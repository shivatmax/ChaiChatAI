import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { UserKnowledgeBase } from '../../../types/SupabaseTypes';
import { v4 as uuidv4 } from 'uuid';

// const fromSupabase = async (query: any) => {
//   const { data, error } = await query;
//   if (error) throw new Error(error.message);
//   return data;
// };

/*
### UserKnowledgeBase

| name       | type                        | format  | required |
|------------|---------------------------|---------|----------|
| id         | text                      | string  | true     |
| user_id    | text                      | string  | true     |
| content    | text                      | string  | true     |
| source     | text                      | string  | true     |
| created_at | timestamp without time zone | string  | true     |
| updated_at | timestamp without time zone | string  | true     |

Foreign Key Relationships:
- user_id references User.id
*/

export const useUserKnowledgeBase = (id: string, userId: string) =>
  useQuery({
    queryKey: ['userKnowledgeBases', id, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('UserKnowledgeBase')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useUserKnowledgeBases = (userId: string) =>
  useQuery({
    queryKey: ['userKnowledgeBases', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('UserKnowledgeBase')
        .select('*')
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useAddUserKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      newUserKnowledgeBase,
      userId,
    }: {
      newUserKnowledgeBase: Omit<
        UserKnowledgeBase,
        'id' | 'created_at' | 'updated_at'
      >;
      userId: string;
    }) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('UserKnowledgeBase')
        .insert([
          {
            id: uuidv4(),
            ...newUserKnowledgeBase,
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
      queryClient.invalidateQueries({
        queryKey: ['userKnowledgeBases', userId],
      });
    },
  });
};

export const useUpdateUserKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      updatedUserKnowledgeBase,
      userId,
    }: {
      updatedUserKnowledgeBase: Partial<UserKnowledgeBase> & { id: string };
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from('UserKnowledgeBase')
        .update({
          ...updatedUserKnowledgeBase,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedUserKnowledgeBase.id)
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ['userKnowledgeBases', userId],
      });
    },
  });
};

export const useDeleteUserKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { data, error } = await supabase
        .from('UserKnowledgeBase')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ['userKnowledgeBases', userId],
      });
    },
  });
};
