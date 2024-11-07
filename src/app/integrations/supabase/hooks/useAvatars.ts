import { Avatar } from '@/app/types/avatar';
import { supabase } from '../supabase';
import { logger } from '@/app/utils/logger';

export const fetchAvatars = async (section: string, userId: string) => {
  let query = supabase.from('Avatar').select(`
      *,
      creator:User(id, name)
    `);

  switch (section) {
    case 'Your Avatars':
      query = query.eq('creator_id', userId);
      break;
    case 'Featured':
      query = query.eq('is_featured', true).eq('is_public', true);
      break;
    case 'Discover':
      query = query.eq('is_public', true);
      break;
    case 'Favorites': {
      const { data: user } = await supabase
        .from('User')
        .select('favorite_avatars')
        .eq('id', userId)
        .single();

      if (user?.favorite_avatars?.length) {
        query = query.in('id', user.favorite_avatars);
      } else {
        return [];
      }
      break;
    }
    default:
      break;
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((avatar: Avatar) => ({
    ...avatar,
    creator: avatar.creator || 'Unknown Creator',
  }));
};

export const toggleAvatarPrivacy = async (avatarId: string, userId: string) => {
  const { data: avatar } = await supabase
    .from('Avatar')
    .select('is_public')
    .eq('id', avatarId)
    .eq('creator_id', userId)
    .single();

  if (!avatar) throw new Error('Avatar not found');

  const { error } = await supabase
    .from('Avatar')
    .update({ is_public: !avatar.is_public })
    .eq('id', avatarId)
    .eq('creator_id', userId);

  if (error) throw error;

  return !avatar.is_public;
};

export const toggleAvatarFavorite = async (
  avatarId: string,
  userId: string
) => {
  const { data: user } = await supabase
    .from('User')
    .select('favorite_avatars')
    .eq('id', userId)
    .single();

  const favorites = user?.favorite_avatars || [];
  const newFavorites = favorites.includes(avatarId)
    ? favorites.filter((id: string) => id !== avatarId)
    : [...favorites, avatarId];

  const { error } = await supabase
    .from('User')
    .update({ favorite_avatars: newFavorites })
    .eq('id', userId);

  if (error) throw error;

  return newFavorites;
};

export const useAvatarAsAIFriend = async (avatarId: string, userId: string) => {
  // First, get the avatar details
  const { data: avatar, error: avatarError } = await supabase
    .from('Avatar')
    .select('*')
    .eq('id', avatarId)
    .single();

  if (avatarError) throw avatarError;

  // Create a new AI Friend using the avatar's properties
  const now = new Date().toISOString();
  const { data: aiFriend, error: aiFriendError } = await supabase
    .from('AIFriend')
    .insert([
      {
        user_id: userId,
        avatar_id: avatarId,
        name: avatar.name,
        about: avatar.about,
        persona: avatar.persona,
        knowledge_base: avatar.knowledge_base,
        memory: avatar.memory,
        status: true,
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();

  if (aiFriendError) throw aiFriendError;

  return aiFriend;
};

export const updateAvatar = async (
  avatarId: string,
  userId: string,
  data: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
  }
) => {
  logger.debug('Updating avatar with data:', data);

  const { error } = await supabase
    .from('Avatar')
    .update({
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_public: data.is_public,
      updated_at: new Date().toISOString(),
    })
    .eq('id', avatarId)
    .eq('creator_id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }

  return true;
};
