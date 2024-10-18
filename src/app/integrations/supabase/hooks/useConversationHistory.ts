import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { ConversationHistory } from '../../../types/SupabaseTypes';
import { v4 as uuidv4 } from 'uuid';

export const useUserAIFriendConversationHistory = (
  userId: string,
  aiFriendId: string
) =>
  useQuery({
    queryKey: ['conversationHistories', userId, aiFriendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ConversationHistory')
        .select('*')
        .eq('user_id', userId)
        .eq('ai_friend_id', aiFriendId);

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useConversationHistory = (id: string) =>
  useQuery({
    queryKey: ['conversationHistories', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ConversationHistory')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useConversationHistories = () =>
  useQuery({
    queryKey: ['conversationHistories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ConversationHistory')
        .select('*');

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useAddConversationHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      newConversationHistory: Omit<
        ConversationHistory,
        'id' | 'created_at' | 'updated_at'
      >
    ) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('ConversationHistory')
        .insert([
          {
            id: uuidv4(),
            ...newConversationHistory,
            created_at: now,
            updated_at: now,
          },
        ])
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationHistories'] });
    },
  });
};

export const useUpdateConversationHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      updatedConversationHistory: Partial<ConversationHistory> & { id: string }
    ) => {
      const { data, error } = await supabase
        .from('ConversationHistory')
        .update({
          ...updatedConversationHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedConversationHistory.id);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationHistories'] });
    },
  });
};

export const useDeleteConversationHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ConversationHistory')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationHistories'] });
    },
  });
};
