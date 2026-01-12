/**
 * AI Response Generation
 * Uses Groq (LLaMA 3) – Free & Stable
 */

import Groq from "groq-sdk";
import "dotenv/config";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateResponse({
  systemInstructions,
  conversationContext,
  userMessage,
}) {
  const messages = [
    {
      role: "system",
      content: systemInstructions,
    },
  ];

  if (conversationContext) {
    messages.push({
      role: "assistant",
      content: `Conversation summary:\n${conversationContext}`,
    });
  }

  messages.push({
    role: "user",
    content: userMessage,
  });

  const completion = await groq.chat.completions.create({
model: "llama-3.1-8b-instant",
    messages,
    temperature: 0.7,
    max_tokens: 400,
  });

  return completion.choices[0]?.message?.content
    || "I couldn't generate a response right now.";
}

export function getFallbackResponse() {
  return "I'm having trouble responding right now. Please try again.";
}
