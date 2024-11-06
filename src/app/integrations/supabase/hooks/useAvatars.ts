import { Avatar } from '@/app/types/avatar';
import { supabase } from '../supabase';

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
