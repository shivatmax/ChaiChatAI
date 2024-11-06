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
}: AvatarCardProps) => {
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const handlePrivacyConfirm = () => {
    onPrivacyToggle?.(id);
    setShowPrivacyDialog(false);
  };

  return (
    <>
      <div
        className={cn(
          'group relative bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border border-avatar-primary/5 animate-fade-in min-w-[140px]',
          className
        )}
      >
        <div className="aspect-square overflow-hidden">
          <Image
            src={image_url || '/images/comic/1.png'}
            alt={name || 'Avatar'}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            priority={true}
          />
        </div>
        <div className="p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-avatar-primary line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-2">
              {showPrivacyControls && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPrivacyDialog(true);
                  }}
                  className="focus:outline-none transform transition-transform active:scale-90"
                >
                  {is_public ? (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-avatar-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-avatar-primary" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle();
                }}
                className="focus:outline-none transform transition-transform active:scale-90"
              >
                <Star
                  className={cn(
                    'w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-colors duration-300',
                    isFavorite
                      ? 'text-avatar-accent fill-avatar-accent'
                      : 'text-gray-400 hover:text-avatar-hover'
                  )}
                />
              </button>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-avatar-primary/60 mb-1 sm:mb-2">
            {creator}
          </p>
          <p className="text-xs lg:text-sm text-avatar-primary/80 line-clamp-2 mb-2 sm:mb-3">
            {description}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-y-1">
            <div className="text-xs lg:text-sm text-avatar-primary/60 font-medium">
              {interactions.toLocaleString()} interactions
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-avatar-secondary/80 text-avatar-primary text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 lg:px-3 lg:py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Avatar Visibility</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to make this avatar{' '}
                {is_public ? 'private' : 'public'}?
              </p>
              <p className="text-sm text-muted-foreground">
                {is_public
                  ? 'Private avatars are only visible to you'
                  : 'Public avatars can be seen by everyone'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-avatar-secondary">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePrivacyConfirm}
              className="bg-avatar-primary hover:bg-avatar-hover"
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
