import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { AIFriend } from '../../../types/SupabaseTypes';
import { v4 as uuidv4 } from 'uuid';
// import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

// const fromSupabase = async <T>(query: Promise<PostgrestSingleResponse<T> | PostgrestResponse<T>>): Promise<T> => {
//   const { data, error } = await query;
//   if (error) throw new Error(error.message);
//   return data as T;
// };

export const useAIFriend = (id: string, userId: string) =>
  useQuery({
    queryKey: ['aiFriends', id, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('AIFriend')
        .select(
          `
          *,
          avatar:Avatar(id, image_url)
        `
        )
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useAIFriends = (userId: string) =>
  useQuery({
    queryKey: ['aiFriends', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('AIFriend')
        .select(
          `
          *,
          avatar:Avatar(id, image_url)
        `
        )
        .eq('user_id', userId);

      if (error) throw new Error(error.message);

      // Transform the data to include avatar_url from the avatar relation
      return data.map((friend) => ({
        ...friend,
        avatar_url: friend.avatar?.image_url || '',
      }));
    },
  });

export const useAddAIFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      newAIFriend,
      userId,
    }: {
      newAIFriend: Omit<AIFriend, 'id' | 'created_at' | 'updated_at'>;
      userId: string;
    }) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('AIFriend')
        .insert([
          {
            id: uuidv4(),
            ...newAIFriend,
            user_id: userId,
            created_at: now,
            updated_at: now,
          },
        ])
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['aiFriends', userId] });
    },
  });
};

export const useUpdateAIFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      updatedAIFriend,
      userId,
    }: {
      updatedAIFriend: Partial<AIFriend> & { id: string; avatar_id: string };
      userId: string;
    }) => {
      const { avatar, avatar_url, ...updateData } =
        updatedAIFriend as Partial<AIFriend> & {
          id: string;
          avatar_id: string;
          avatar?: { id: string; image_url: string };
          avatar_url?: string;
        };

      console.log('updateData', updateData);
      console.log('avatar', avatar);
      console.log('avatar_url', avatar_url);
      // First update the Avatar
      const { error: avatarError } = await supabase
        .from('Avatar')
        .update({
          name: updateData.name,
          about: updateData.about,
          persona: updateData.persona,
          knowledge_base: updateData.knowledge_base,
          status: updateData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedAIFriend.avatar_id);

      if (avatarError) throw new Error(avatarError.message);

      // Then update the AIFriend
      const { data, error } = await supabase
        .from('AIFriend')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedAIFriend.id)
        .eq('user_id', userId).select(`
          *,
          avatar:Avatar(id, image_url)
        `);

      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['aiFriends', userId] });
    },
  });
};

export const useDeleteAIFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // First, delete related ConversationHistory records
      await supabase
        .from('ConversationHistory')
        .delete()
        .eq('ai_friend_id', id);

      // Then, delete the AIFriend
      const { data, error } = await supabase
        .from('AIFriend')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['aiFriends', userId] });
    },
  });
};
