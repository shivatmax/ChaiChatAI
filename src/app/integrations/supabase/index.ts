// Import all the relevant exports from other files in the supabase directory
import { supabase } from './supabase';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth';
import {
  useAIFriend,
  useAIFriends,
  useAddAIFriend,
  useUpdateAIFriend,
  useDeleteAIFriend,
} from './hooks/useAIFriend';

// Export all the imported functions and objects
export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
  useAIFriend,
  useAIFriends,
  useAddAIFriend,
  useUpdateAIFriend,
  useDeleteAIFriend,
};
