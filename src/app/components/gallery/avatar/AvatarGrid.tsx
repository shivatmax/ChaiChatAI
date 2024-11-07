import AvatarCard from '../AvatarCard';
import { Avatar } from '../../../types/avatar';
import React from 'react';

interface AvatarGridProps {
  avatars: Avatar[];
  isLoading: boolean;
  showPrivacyControls?: boolean;
  onFavoriteToggle: (id: string) => void;
  onPrivacyToggle?: (
    id: string,
    data: {
      name: string;
      description: string;
      tags: string[];
      is_public: boolean;
    }
  ) => void;
  favorites: string[];
  onUseAsAIFriend: (id: string) => void;
  userId: string;
  inUseAvatars: string[];
  userAIFriends: string[];
}

const AvatarGrid = ({
  avatars,
  isLoading,
  showPrivacyControls,
  onFavoriteToggle,
  onPrivacyToggle,
  favorites,
  onUseAsAIFriend,
  userId,
  inUseAvatars,
  userAIFriends,
}: AvatarGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-8">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (avatars.length === 0) {
    return (
      <div className="text-center max-w-md mx-auto px-4 py-10">
        <div className="bg-white/80 rounded-full p-6 mb-4 mx-auto w-fit shadow-md">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Avatars Found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          {showPrivacyControls
            ? "You haven't created any avatars yet. Start by creating your first avatar!"
            : 'No Avatars Found Here'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-8 animate-slide-up">
      {avatars.map((avatar) => {
        const { creator, ...avatarProps } = avatar;
        return (
          <AvatarCard
            key={avatar.id}
            {...avatarProps}
            creator={
              typeof creator === 'object' && creator !== null
                ? (creator as { name: string }).name
                : creator
            }
            user_id={avatar.creator_id}
            isFavorite={favorites.includes(avatar.id)}
            onFavoriteToggle={() => onFavoriteToggle(avatar.id)}
            onPrivacyToggle={onPrivacyToggle}
            showPrivacyControls={showPrivacyControls}
            isCreator={avatar.creator_id === userId}
            onUseAsAIFriend={onUseAsAIFriend}
            isInUse={inUseAvatars.includes(avatar.id)}
            hasAIFriend={userAIFriends.includes(avatar.id)}
          />
        );
      })}
    </div>
  );
};

export default AvatarGrid;
