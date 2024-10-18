import { supabase } from '../integrations/supabase/supabase';
import { User } from '../types/SupabaseTypes';

export const createUser = async (
  user: Omit<User, 'id' | 'created_at' | 'updated_at'>
): Promise<User> => {
  const { data, error } = await supabase
    .from('User')
    .insert([user])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getUser = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User> => {
  const { data, error } = await supabase
    .from('User')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase.from('User').delete().eq('id', id);
  if (error) throw error;
};
