import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navigation from './Navigation';
import {
  fetchAvatars,
  // toggleAvatarPrivacy,
  updateAvatar,
  // useAvatarAsAIFriend,
} from '../../integrations/supabase/hooks/useAvatars';
import { useToast } from '../ui/use-toast';
import SearchBar from './avatar/SearchBar';
import CategoryFilter from './avatar/CategoryFilter';
import AvatarGrid from './avatar/AvatarGrid';
import { useFavorites } from '../../hooks/useFavorites';
import { cn } from '../../lib/utils';
import React from 'react';
import { Menu } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
// import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/app/integrations/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/app/utils/logger';

const AVATAR_CATEGORIES = [
  'All',
  'Anime',
  'Gaming',
  'Education',
  'Lifestyle',
  'Fantasy',
  'Sci-Fi',
  'Professional',
  'Sports',
  'Music',
  'Art',
];

const AvatarLibrary = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const { favorites, toggleFavorite } = useFavorites(userId);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeSection, setActiveSection] = useState('Your Avatars');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    data: avatars = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['avatars', activeSection, userId],
    queryFn: () => fetchAvatars(activeSection, userId),
  });

  const togglePrivacy = async (
    avatarId: string,
    data: {
      name: string;
      description: string;
      tags: string[];
      is_public: boolean;
    }
  ) => {
    try {
      logger.debug('Sending update with data:', data);
      await updateAvatar(avatarId, userId, {
        name: data.name || '',
        description: data.description || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        is_public: Boolean(data.is_public),
      });

      await queryClient.invalidateQueries({ queryKey: ['avatars'] });
      await refetch();

      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
        className: 'bg-avatar-primary text-white',
      });
    } catch (error) {
      console.error('Error in togglePrivacy:', error);
      toast({
        title: 'Error',
        description: 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filterAvatars = () => {
    let filtered = avatars;

    if (activeSection === 'Favorites') {
      filtered = avatars.filter((avatar) => favorites.includes(avatar.id));
    }

    if (searchQuery || selectedCategory !== 'All') {
      filtered = filtered.filter((avatar) => {
        const matchesSearch =
          !searchQuery ||
          avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          avatar.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All' || avatar.tags.includes(selectedCategory);

        return matchesSearch && matchesCategory;
      });
    }

    return filtered;
  };

  const isMobile = windowWidth < 768;

  const handleUseAsAIFriend = async (avatarId: string) => {
    try {
      // Check if user has reached the maximum limit
      const { data: existingAIFriends, error: countError } = await supabase
        .from('AIFriend')
        .select('id')
        .eq('user_id', userId)
        .eq('status', true);

      if (countError) throw countError;

      if (existingAIFriends && existingAIFriends.length >= 5) {
        toast({
          title: 'Limit Reached',
          description: 'You can only have 5 active AI Friends at a time.',
          variant: 'destructive',
        });
        return;
      }

      const now = new Date().toISOString();

      // Get the avatar details
      const { data: avatar } = await supabase
        .from('Avatar')
        .select('*')
        .eq('id', avatarId)
        .single();

      if (!avatar) throw new Error('Avatar not found');

      // Create a new AI Friend using the avatar's properties
      const { data: aiFriend, error: aiFriendError } = await supabase
        .from('AIFriend')
        .insert([
          {
            id: uuidv4(),
            user_id: userId,
            avatar_id: avatarId,
            name: avatar.name,
            about: avatar.about,
            persona: avatar.persona,
            knowledge_base: avatar.knowledge_base,
            memory: avatar.memory,
            status: true,
            in_use: true,
            created_at: now,
            updated_at: now,
            is_original: userId === avatar.creator_id,
            original_id: userId === avatar.creator_id ? null : avatarId,
          },
        ])
        .select()
        .single();

      if (aiFriendError) throw aiFriendError;

      // Invalidate and refetch all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['aiFriends', userId] }),
        queryClient.invalidateQueries({ queryKey: ['inUseAvatars', userId] }),
        queryClient.invalidateQueries({ queryKey: ['userAIFriends', userId] }),
        refetchInUseAvatars(),
      ]);

      toast({
        title: 'Success',
        description: `${aiFriend.name} has been added to your AI Friends!`,
        className: 'bg-green-500 text-white',
      });
    } catch (error) {
      console.error('Error using avatar as AI Friend:', error);
      toast({
        title: 'Error',
        description: 'Failed to add AI Friend. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const { data: inUseAvatars = [], refetch: refetchInUseAvatars } = useQuery({
    queryKey: ['inUseAvatars', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('AIFriend')
        .select('avatar_id')
        .eq('user_id', userId)
        .eq('status', true)
        .eq('in_use', true);
      return data?.map((item) => item.avatar_id) || [];
    },
  });

  const { data: userAIFriends = [] } = useQuery({
    queryKey: ['userAIFriends', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('AIFriend')
        .select('avatar_id')
        .eq('user_id', userId);
      return data?.map((item) => item.avatar_id) || [];
    },
  });

  return (
    <div className="flex h-full overflow-hidden bg-white relative">
      {/* Mobile Menu Button and Navigation */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <div className="flex items-center justify-between p-3 bg-white border-b border-avatar-primary/10">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu className="w-7 h-7 text-avatar-primary" />
            </button>
            {isMobileMenuOpen && (
              <div className="absolute top-full left-0 w-full max-w-[280px] bg-white shadow-xl border-r border-avatar-primary/10 rounded-br-lg">
                <Navigation
                  position="left"
                  className="w-full py-2"
                  activeSection={activeSection}
                  onSectionChange={(section) => {
                    setActiveSection(section);
                    setIsMobileMenuOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Navigation Sidebar */}
      {!isMobile && (
        <div className="relative w-72 bg-white shadow-lg border-r border-avatar-primary/10">
          <Navigation
            position="left"
            className="w-full h-full py-4"
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>
      )}

      <main
        className={cn('flex-1 h-full overflow-hidden', isMobile && 'w-full')}
      >
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div
            className={cn(
              'bg-white z-20 px-4 lg:px-8 py-4 space-y-4 shadow-sm border-b border-avatar-primary/10 flex-shrink-0',
              isMobile ? 'pt-2' : 'pt-4'
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <h1
                className={cn(
                  'text-xl md:text-2xl lg:text-3xl font-bold text-avatar-primary transition-all duration-300',
                  activeSection === 'Featured' && 'text-avatar-accent',
                  activeSection === 'Discover' && 'text-avatar-hover'
                )}
              >
                {activeSection}
              </h1>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div
            className={cn(
              'bg-white z-10 px-4 lg:px-8 py-4 shadow-sm border-b border-avatar-primary/10',
              'flex-shrink-0',
              'min-h-[80px] md:min-h-[60px]'
            )}
          >
            <div
              className={cn(
                'flex gap-3',
                isMobile ? 'flex-col' : 'flex-row items-center'
              )}
            >
              <div
                className={cn(
                  'transition-all duration-300 hover:scale-[1.02]',
                  isMobile ? 'w-full' : 'w-80'
                )}
              >
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {activeSection === 'Discover' && (
                <div
                  className={cn(
                    'overflow-x-auto scrollbar-thin scrollbar-thumb-avatar-primary/20 scrollbar-track-transparent',
                    isMobile ? 'w-full' : 'flex-1'
                  )}
                >
                  <CategoryFilter
                    categories={AVATAR_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Spacer div */}
          <div className="h-4 md:h-6 lg:h-8 bg-gray-50/50 flex-shrink-0" />

          {/* Avatar Grid Section */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-3 md:px-4 lg:px-8 py-6 bg-gray-50/50">
            <div className="max-w-[2000px] mx-auto h-full">
              <AvatarGrid
                avatars={filterAvatars()}
                isLoading={isLoading}
                showPrivacyControls={activeSection === 'Your Avatars'}
                onFavoriteToggle={toggleFavorite}
                onPrivacyToggle={togglePrivacy}
                favorites={favorites}
                onUseAsAIFriend={handleUseAsAIFriend}
                userId={userId}
                inUseAvatars={inUseAvatars}
                userAIFriends={userAIFriends}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvatarLibrary;
