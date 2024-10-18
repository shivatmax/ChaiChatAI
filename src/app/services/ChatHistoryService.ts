import { supabase } from '../integrations/supabase/supabase';
import { ConversationHistory } from '../types/ConversationHistory';

export const addChatEntry = async (
  entry: Omit<ConversationHistory, 'id' | 'created_at' | 'updated_at'>
): Promise<ConversationHistory> => {
  const { data, error } = await supabase
    .from('ConversationHistory')
    .insert([entry])
    .select()
    .single();
  if (error) throw error;

  // Add to local storage
  const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  localHistory.push(data);
  localStorage.setItem('chatHistory', JSON.stringify(localHistory));

  return data;
};

export const getChatHistory = async (
  userId: string,
  aiFriendId: string
): Promise<ConversationHistory[]> => {
  // First, get from local storage
  const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');

  // Then, fetch from database
  const { data, error } = await supabase
    .from('ConversationHistory')
    .select('*')
    .eq('user_id', userId)
    .eq('ai_friend_id', aiFriendId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Merge and deduplicate
  const mergedHistory = [...localHistory, ...data];
  const uniqueHistory = Array.from(new Set(mergedHistory.map((a) => a.id))).map(
    (id) => mergedHistory.find((a) => a.id === id)
  );

  return uniqueHistory;
};

export const updateChatSummary = async (
  id: string,
  summary: string
): Promise<ConversationHistory> => {
  const { data, error } = await supabase
    .from('ConversationHistory')
    .update({ summary })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  // Update in local storage
  const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  const updatedLocalHistory = localHistory.map((entry: ConversationHistory) =>
    entry.id === id ? { ...entry, summary } : entry
  );
  localStorage.setItem('chatHistory', JSON.stringify(updatedLocalHistory));

  return data;
};

export const deleteChatEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ConversationHistory')
    .delete()
    .eq('id', id);
  if (error) throw error;

  // Remove from local storage
  const localHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  const updatedLocalHistory = localHistory.filter(
    (entry: ConversationHistory) => entry.id !== id
  );
  localStorage.setItem('chatHistory', JSON.stringify(updatedLocalHistory));
};
