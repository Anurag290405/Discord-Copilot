/**
 * Discord Copilot Bot
 * AI-powered Discord bot with conversation memory and context awareness
 */

import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import { getSystemInstructions, isChannelAllowed } from "./supabase.js";
import { getMemory, updateMemory, formatMemoryForContext } from "./memory.js";
import { generateResponse, getFallbackResponse } from "./ai.js";

// Validate environment variables
const requiredEnvVars = [
  "DISCORD_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Bot ready event
client.once("ready", () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  console.log(`✅ Bot is ready to receive messages`);
});

// Message handler
client.on("messageCreate", async (message) => {
  try {
    // 1. Ignore bot messages
    if (message.author.bot) return;

    // 2. Check if channel is allowed (skip for DMs)
    if (message.guildId) {
      const allowed = await isChannelAllowed(message.channelId);
      if (!allowed) {
        console.log(`⛔ Message ignored: Channel ${message.channelId} not in allow-list`);
        return;
      }
    }

    // 3. Check if bot is mentioned or it's a DM
    const isMentioned = message.mentions.has(client.user);
    const isDM = !message.guildId;

    if (!isMentioned && !isDM) {
      return;
    }

    console.log(`\n📨 New message from ${message.author.tag} in ${message.channel.name || "DM"}`);
    console.log(`   Content: ${message.content.substring(0, 100)}...`);

    // Show typing indicator
    await message.channel.sendTyping();

    // 4. Fetch system instructions
    const systemInstructions = await getSystemInstructions();
    console.log(`📝 Loaded system instructions (${systemInstructions.length} chars)`);

    // 5. Get conversation memory
    const memory = await getMemory(message.channelId);
    const conversationContext = formatMemoryForContext(memory);
    console.log(`💭 Loaded conversation memory (${memory ? "existing" : "new"})`);

    // 6. Clean user message (remove bot mention)
    let userMessage = message.content;
    if (isMentioned) {
      userMessage = userMessage.replace(/<@!?\d+>/g, "").trim();
    }

    // 7. Generate AI response
    let response;
    try {
      response = await generateResponse({
        systemInstructions,
        conversationContext,
        userMessage,
        maxRetries: 3,
      });
    } catch (error) {
      console.error("❌ Failed to generate AI response:", error.message);
      response = getFallbackResponse(userMessage);
    }

    // 8. Send response (handle Discord's 2000 char limit)
    if (response.length > 2000) {
      // Split long responses
      const chunks = response.match(/.{1,1900}/gs) || [];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(response);
    }

    console.log(`✅ Response sent (${response.length} chars)`);

    // 9. Update conversation memory
    await updateMemory(message.channelId, userMessage, response);
  } catch (error) {
    console.error("❌ Error handling message:", error);
    try {
      await message.reply(
        "Sorry, I encountered an error processing your message. Please try again."
      );
    } catch (replyError) {
      console.error("❌ Failed to send error message:", replyError);
    }
  }
});

// Error handlers
client.on("error", (error) => {
  console.error("❌ Discord client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled promise rejection:", error);
});

// Login to Discord
console.log("🚀 Starting Discord Copilot Bot...");
client.login(process.env.DISCORD_TOKEN);
