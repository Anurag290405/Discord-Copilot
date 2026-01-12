/**
 * This file re-exports all Supabase authentication functions
 * Use this as your central authentication module
 */

export {
  supabase,
  getSupabaseClient,
  getCurrentUser,
  signUp,
  signIn,
  signInWithMagicLink,
  signOut,
  getSession,
  onAuthStateChange,
  resetPassword,
  updatePassword,
} from "./supabaseClient";
