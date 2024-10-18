import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Session } from '../../../types/SupabaseTypes';
import { v4 as uuidv4 } from 'uuid';

/*
### Session

| name           | type                   | format                | required |
|----------------|------------------------|----------------------|----------|
| id             | text                   | string               | true     |
| user_id        | text                   | string               | true     |
| ai_friend_ids  | text[]                 | array                | false    |
| session_type   | public."SessionType"   | string               | true     |
| title          | text                   | string               | false    |
| description    | text                   | string               | false    |
| created_at     | timestamp without time zone | string          | true     |
| updated_at     | timestamp without time zone | string          | true     |

Foreign Key Relationships:
- user_id references User.id
- ai_friend_ids references AIFriend.id (many-to-many relationship)
*/

export const useSession = (id: string, userId: string) =>
  useQuery({
    queryKey: ['sessions', id, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Session')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useSessions = (userId: string) =>
  useQuery({
    queryKey: ['sessions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Session')
        .select('*')
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useAddSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      newSession,
      userId,
    }: {
      newSession: Omit<Session, 'id' | 'created_at' | 'updated_at'>;
      userId: string;
    }) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('Session')
        .insert([
          {
            id: uuidv4(),
            ...newSession,
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
      queryClient.invalidateQueries({ queryKey: ['sessions', userId] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      updatedSession,
      userId,
    }: {
      updatedSession: Partial<Session> & { id: string };
      userId: string;
    }) => {
      const { data, error } = await supabase
        .from('Session')
        .update({
          ...updatedSession,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedSession.id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', userId] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { data, error } = await supabase
        .from('Session')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', userId] });
    },
  });
};
