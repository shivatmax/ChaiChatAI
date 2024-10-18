import { supabase } from '../integrations/supabase/supabase';
import { AIFriend } from '../types/SupabaseTypes';

export const createAIFriend = async (
  aiFriend: Omit<AIFriend, 'id'>,
  userId: string
): Promise<AIFriend> => {
  const { data, error } = await supabase
    .from('AIFriend')
    .insert([{ ...aiFriend, user_id: userId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAIFriend = async (
  id: string,
  userId: string
): Promise<AIFriend> => {
  const { data, error } = await supabase
    .from('AIFriend')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateAIFriend = async (
  id: string,
  updates: Partial<AIFriend>,
  userId: string
): Promise<AIFriend> => {
  const { data, error } = await supabase
    .from('AIFriend')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAIFriend = async (
  id: string,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('AIFriend')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
};

export const getAIFriendsByUserId = async (
  userId: string
): Promise<AIFriend[]> => {
  const { data, error } = await supabase
    .from('AIFriend')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};
