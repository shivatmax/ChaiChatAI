import AvatarCard from '../AvatarCard';
import { Avatar } from '../../../types/avatar';
import React from 'react';

interface AvatarGridProps {
  avatars: Avatar[];
  isLoading: boolean;
  showPrivacyControls?: boolean;
  onFavoriteToggle: (id: string) => void;
  onPrivacyToggle?: (id: string) => void;
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
            onPrivacyToggle={() => onPrivacyToggle?.(avatar.id)}
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
