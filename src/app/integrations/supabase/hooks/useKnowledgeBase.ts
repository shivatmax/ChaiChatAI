import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { KnowledgeBase } from '../../../types/SupabaseTypes';
import { v4 as uuidv4 } from 'uuid';

/*
### KnowledgeBase

| name         | type                        | format  | required |
|--------------|---------------------------|---------|----------|
| id           | text                      | string  | true     |
| ai_friend_id | text                      | string  | true     |
| content      | text                      | string  | true     |
| source       | text                      | string  | true     |
| created_at   | timestamp without time zone | string  | true     |
| updated_at   | timestamp without time zone | string  | true     |

Foreign Key Relationships:
- ai_friend_id references AIFriend.id
*/

export const useKnowledgeBase = (id: string, aiFriendId: string) =>
  useQuery({
    queryKey: ['knowledgeBases', id, aiFriendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('KnowledgeBase')
        .select('*')
        .eq('id', id)
        .eq('ai_friend_id', aiFriendId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useKnowledgeBases = (aiFriendId: string) =>
  useQuery({
    queryKey: ['knowledgeBases', aiFriendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('KnowledgeBase')
        .select('*')
        .eq('ai_friend_id', aiFriendId);

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useAddKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      newKnowledgeBase,
      aiFriendId,
    }: {
      newKnowledgeBase: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>;
      aiFriendId: string;
    }) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('KnowledgeBase')
        .insert([
          {
            id: uuidv4(),
            ...newKnowledgeBase,
            ai_friend_id: aiFriendId,
            created_at: now,
            updated_at: now,
          },
        ])
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: (_, { aiFriendId }) => {
      queryClient.invalidateQueries({
        queryKey: ['knowledgeBases', aiFriendId],
      });
    },
  });
};

export const useUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      updatedKnowledgeBase,
      aiFriendId,
    }: {
      updatedKnowledgeBase: Partial<KnowledgeBase> & { id: string };
      aiFriendId: string;
    }) => {
      const { data, error } = await supabase
        .from('KnowledgeBase')
        .update({
          ...updatedKnowledgeBase,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedKnowledgeBase.id)
        .eq('ai_friend_id', aiFriendId);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { aiFriendId }) => {
      queryClient.invalidateQueries({
        queryKey: ['knowledgeBases', aiFriendId],
      });
    },
  });
};

export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      aiFriendId,
    }: {
      id: string;
      aiFriendId: string;
    }) => {
      const { data, error } = await supabase
        .from('KnowledgeBase')
        .delete()
        .eq('id', id)
        .eq('ai_friend_id', aiFriendId);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { aiFriendId }) => {
      queryClient.invalidateQueries({
        queryKey: ['knowledgeBases', aiFriendId],
      });
    },
  });
};
