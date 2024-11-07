import { Eye, EyeOff, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useState } from 'react';
import React from 'react';

interface AvatarCardProps {
  id: string;
  name: string;
  creator: string;
  description: string;
  image_url: string;
  interactions: number;
  tags: string[];
  user_id: string;
  public_id?: string;
  is_featured?: boolean;
  isFavorite?: boolean;
  is_public?: boolean;
  className?: string;
  onFavoriteToggle: () => void;
  onPrivacyToggle?: (id: string) => void;
  showPrivacyControls?: boolean;
  onUseAsAIFriend?: (id: string) => void;
  isCreator?: boolean;
  isInUse?: boolean;
  hasAIFriend?: boolean;
}

const AvatarCard = ({
  id,
  name,
  creator,
  description,
  image_url,
  interactions,
  tags,
  // user_id,
  // public_id,
  // is_featured,
  isFavorite,
  is_public,
  className,
  onFavoriteToggle,
  onPrivacyToggle,
  showPrivacyControls,
  onUseAsAIFriend,
  isCreator,
  isInUse,
  hasAIFriend,
}: AvatarCardProps) => {
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const handlePrivacyConfirm = () => {
    onPrivacyToggle?.(id);
    setShowPrivacyDialog(false);
  };

  const getButtonText = () => {
    if (isInUse) return 'In Use';
    if (isCreator && hasAIFriend) return 'Edit AI Friend';
    return 'Use as AI Friend';
  };

  const getButtonStyle = () => {
    if (isInUse) {
      return 'bg-gray-400 cursor-not-allowed opacity-75';
    }
    return 'bg-gradient-to-r from-green-400 to-green-300 hover:from-green-500 hover:to-green-400';
  };

  return (
    <>
      <div
        className={cn(
          'group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-avatar-primary/10 animate-fade-in min-w-[120px] md:min-w-[140px]',
          className
        )}
      >
        <div className="aspect-square overflow-hidden">
          <Image
            src={image_url || '/images/comic/1.png'}
            alt={name || 'Avatar'}
            width={300}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={true}
          />
        </div>
        <div className="p-2.5 md:p-3.5">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <h3 className="font-semibold text-xs md:text-sm text-avatar-primary line-clamp-1 flex-1">
              {name}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {showPrivacyControls && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPrivacyDialog(true);
                  }}
                  className="focus:outline-none transform transition-transform active:scale-90 p-1.5"
                >
                  {is_public ? (
                    <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-avatar-primary/70 hover:text-avatar-primary" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4 text-avatar-primary/70 hover:text-avatar-primary" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle();
                }}
                className="focus:outline-none transform transition-transform active:scale-90 p-1.5"
              >
                <Star
                  className={cn(
                    'w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-300',
                    isFavorite
                      ? 'text-avatar-accent fill-avatar-accent'
                      : 'text-gray-400 hover:text-avatar-hover'
                  )}
                />
              </button>
              {onUseAsAIFriend && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isInUse) {
                      onUseAsAIFriend?.(id);
                    }
                  }}
                  disabled={isInUse}
                  className={`${getButtonStyle()} text-white text-sm px-2 py-1 rounded-lg shadow-sm transition-all duration-300`}
                >
                  {getButtonText()}
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-avatar-primary/60 mb-2">
            {creator}
          </p>
          <p className="text-[10px] md:text-xs text-avatar-primary/80 line-clamp-2 mb-3.5">
            {description}
          </p>
          <div className="flex flex-col gap-2.5">
            <div className="text-[10px] md:text-xs text-avatar-primary/60 font-medium">
              {interactions.toLocaleString()} interactions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-avatar-secondary/70 text-avatar-primary text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm max-w-[85vw] md:max-w-sm rounded-xl p-3.5 md:p-5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg font-semibold text-avatar-primary">
              Change Avatar Visibility
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2.5 text-xs md:text-sm text-avatar-primary/70">
              <p>
                Are you sure you want to make this avatar{' '}
                {is_public ? 'private' : 'public'}?
              </p>
              <p className="text-[10px] md:text-xs text-avatar-primary/60">
                {is_public
                  ? 'Private avatars are only visible to you'
                  : 'Public avatars can be seen by everyone'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2.5 mt-5">
            <AlertDialogCancel className="flex-1 px-3.5 py-1.5 rounded-lg text-xs md:text-sm hover:bg-avatar-secondary/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePrivacyConfirm}
              className="flex-1 px-3.5 py-1.5 rounded-lg text-xs md:text-sm bg-avatar-primary text-white hover:bg-avatar-hover"
            >
              Make {is_public ? 'Private' : 'Public'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AvatarCard;
