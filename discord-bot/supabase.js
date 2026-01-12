/**
 * Supabase Client for Discord Bot
 * Provides database access for instructions, channels, and memory
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required Supabase environment variables");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Fetch system instructions from database
 * @returns {Promise<string>} Active system instructions
 */
export async function getSystemInstructions() {
  try {
    const { data, error } = await supabase
      .from("system_instructions")
      .select("instructions")
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data?.instructions || "You are a helpful Discord bot assistant.";
  } catch (error) {
    console.error("Error fetching system instructions:", error.message);
    return "You are a helpful Discord bot assistant.";
  }
}

/**
 * Check if a channel is in the allow-list
 * @param {string} channelId - Discord channel ID
 * @returns {Promise<boolean>} True if channel is allowed
 */
export async function isChannelAllowed(channelId) {
  try {
    const { data, error } = await supabase
      .from("allowed_channels")
      .select("*")
      .eq("channel_id", channelId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return false; // Not found
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking channel allowlist:", error.message);
    return false;
  }
}
