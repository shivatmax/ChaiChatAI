import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase';
import { useToast } from '../components/ui/use-toast';

export const useFavorites = (userId: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('User')
        .select('favorite_avatars')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setFavorites(data.favorite_avatars || []);
      }
    };

    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (avatarId: string) => {
    try {
      const newFavorites = favorites.includes(avatarId)
        ? favorites.filter((id) => id !== avatarId)
        : [...favorites, avatarId];

      const { error } = await supabase
        .from('User')
        .update({ favorite_avatars: newFavorites })
        .eq('id', userId);

      if (error) throw error;

      setFavorites(newFavorites);

      toast({
        title: favorites.includes(avatarId)
          ? 'Removed from favorites'
          : 'Added to favorites',
        description: favorites.includes(avatarId)
          ? 'Avatar has been removed from your favorites'
          : 'Avatar has been added to your favorites',
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { favorites, toggleFavorite };
};
