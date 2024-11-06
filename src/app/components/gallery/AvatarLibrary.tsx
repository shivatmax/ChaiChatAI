import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navigation from './Navigation';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';
import {
  fetchAvatars,
  toggleAvatarPrivacy,
} from '../../integrations/supabase/hooks/useAvatars';
import { useToast } from '../ui/use-toast';
import SearchBar from './avatar/SearchBar';
import CategoryFilter from './avatar/CategoryFilter';
import AvatarGrid from './avatar/AvatarGrid';
import { useFavorites } from '../../hooks/useFavorites';
// import { supabase } from '../../integrations/supabase';
import { cn } from '../../lib/utils';
import React from 'react';

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

// For testing purposes

const AvatarLibrary = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const { favorites, toggleFavorite } = useFavorites(userId);

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

  console.log(avatars, 'avatars');
  console.log(favorites, 'favorites');
  console.log(activeSection, 'activeSection');
  console.log(userId, 'userId');
  console.log(selectedCategory, 'selectedCategory');
  console.log(searchQuery, 'searchQuery');

  const togglePrivacy = async (avatarId: string) => {
    try {
      const newIsPublic = await toggleAvatarPrivacy(avatarId, userId);

      toast({
        title: 'Success',
        description: `Avatar is now ${newIsPublic ? 'public' : 'private'}`,
      });

      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update avatar privacy. Please try again.',
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

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <Navigation
        position="left"
        className="hidden lg:flex w-64 bg-white shadow-lg animate-slide-up border-r border-avatar-primary/10"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 h-full overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="sticky top-0 bg-white z-20 px-4 lg:px-8 py-6 space-y-6 shadow-sm animate-slide-up border-b border-avatar-primary/10">
            <div className="flex items-center justify-between gap-4">
              <h1
                className={cn(
                  'text-2xl lg:text-3xl font-bold text-avatar-primary animate-fade-in transition-all duration-300',
                  activeSection === 'Featured' && 'text-avatar-accent',
                  activeSection === 'Discover' && 'text-avatar-hover'
                )}
              >
                {activeSection}
              </h1>

              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-avatar-secondary transition-colors duration-300"
                    >
                      <Menu className="h-6 w-6 text-avatar-primary" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="top"
                    className="w-full h-[60vh] rounded-b-xl bg-white border-t-0 top-0 pt-20"
                  >
                    <Navigation
                      position="left"
                      className="w-full h-full bg-transparent animate-slide-up"
                      activeSection={activeSection}
                      onSectionChange={setActiveSection}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-72 transition-all duration-300 hover:scale-[1.02]">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>

              {activeSection === 'Discover' && (
                <div className="w-full sm:flex-1 overflow-x-auto">
                  <CategoryFilter
                    categories={AVATAR_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 bg-white">
            <div className="max-w-[2000px] mx-auto">
              <AvatarGrid
                avatars={filterAvatars()}
                isLoading={isLoading}
                showPrivacyControls={activeSection === 'Your Avatars'}
                onFavoriteToggle={toggleFavorite}
                onPrivacyToggle={togglePrivacy}
                favorites={favorites}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvatarLibrary;
