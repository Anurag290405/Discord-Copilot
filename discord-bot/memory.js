/**
 * Conversation Memory Management
 * Handles storing and retrieving conversation context
 */

import { supabase } from "./supabase.js";

/**
 * Get conversation memory for a channel
 * @param {string} channelId - Discord channel ID
 * @returns {Promise<Object|null>} Memory object with summary and recent messages
 */
export async function getMemory(channelId) {
  try {
    const { data, error } = await supabase
      .from("conversation_memory")
      .select("*")
      .eq("channel_id", channelId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching memory for ${channelId}:`, error.message);
    return null;
  }
}

/**
 * Update conversation memory with new messages
 * @param {string} channelId - Discord channel ID
 * @param {string} userMessage - User's message content
 * @param {string} botResponse - Bot's response content
 * @returns {Promise<void>}
 */
export async function updateMemory(channelId, userMessage, botResponse) {
  try {
    const memory = await getMemory(channelId);
    const now = new Date().toISOString();

    // Get recent messages or initialize empty array
    const recentMessages = memory?.recent_messages || [];

    // Add new messages
    recentMessages.push(
      { role: "user", content: userMessage, timestamp: now },
      { role: "assistant", content: botResponse, timestamp: now }
    );

    // Keep only last 10 messages (rolling window)
    const trimmedMessages = recentMessages.slice(-10);

    // Generate summary from messages
    const summary = await generateSummary(trimmedMessages);

    // Calculate new message count
    const messageCount = (memory?.message_count || 0) + 2;

    if (memory) {
      // Update existing memory
      const { error } = await supabase
        .from("conversation_memory")
        .update({
          summary,
          recent_messages: trimmedMessages,
          message_count: messageCount,
          last_message_at: now,
        })
        .eq("channel_id", channelId);

      if (error) throw error;
    } else {
      // Create new memory
      const { error } = await supabase
        .from("conversation_memory")
        .insert({
          channel_id: channelId,
          summary,
          recent_messages: trimmedMessages,
          message_count: messageCount,
          last_message_at: now,
        });

      if (error) throw error;
    }

    console.log(`✅ Updated memory for channel ${channelId}`);
  } catch (error) {
    console.error(`Error updating memory for ${channelId}:`, error.message);
  }
}

/**
 * Generate a summary of recent messages
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>} Summary text
 */
async function generateSummary(messages) {
  if (messages.length === 0) return "";

  // Simple summary: extract key topics from messages
  // In a production system, you could use AI to generate better summaries
  const topics = messages
    .map((m) => m.content)
    .join(" ")
    .split(" ")
    .filter((word) => word.length > 5)
    .slice(0, 20)
    .join(" ");

  return `Recent conversation about: ${topics}`;
}

/**
 * Format memory for AI context
 * @param {Object|null} memory - Memory object from database
 * @returns {string} Formatted context string
 */
export function formatMemoryForContext(memory) {
  if (!memory) return "";

  let context = "";

  // Add summary if available
  if (memory.summary) {
    context += `Previous conversation summary: ${memory.summary}\n\n`;
  }

  // Add recent messages
  if (memory.recent_messages && memory.recent_messages.length > 0) {
    context += "Recent messages:\n";
    memory.recent_messages.forEach((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant";
      context += `${role}: ${msg.content}\n`;
    });
  }

  return context;
}
