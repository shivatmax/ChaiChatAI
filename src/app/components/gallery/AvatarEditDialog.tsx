import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

const AVAILABLE_TAGS = [
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

interface AvatarEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
  }) => void;
  initialData: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
  };
}

const AvatarEditDialog = ({
  open,
  onOpenChange,
  onConfirm,
  initialData,
}: AvatarEditDialogProps) => {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [tags, setTags] = useState<string[]>(initialData.tags);
  const [isPublic, setIsPublic] = useState(initialData.is_public);

  useEffect(() => {
    if (open) {
      setName(initialData.name);
      setDescription(initialData.description);
      const initialTags = Array.isArray(initialData.tags)
        ? initialData.tags
        : [];
      // Ensure there are between 1-2 tags
      if (initialTags.length > 2) {
        setTags(initialTags.slice(0, 2));
      } else if (initialTags.length === 0) {
        setTags([AVAILABLE_TAGS[0]]);
      } else {
        setTags(initialTags);
      }
      setIsPublic(Boolean(initialData.is_public));
    }
  }, [initialData, open]);

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      // Don't remove if it would leave 0 tags
      if (tags.length > 1) {
        setTags(tags.filter((t) => t !== tag));
      }
    } else if (tags.length < 2) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = () => {
    console.log('Tags:', tags);
    console.log('Is Public:', isPublic);
    console.log('Name:', name);
    console.log('Description:', description);
    const formData = {
      name: name.trim(),
      description: description.trim(),
      tags: tags,
      is_public: isPublic,
    };
    console.log('Submitting form data:', formData);
    onConfirm(formData);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-emerald-50 to-sky-50 max-w-[90vw] md:max-w-xl rounded-2xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg md:text-xl font-bold text-gray-800">
            Edit Avatar Details
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="Enter avatar name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-avatar-hover/30 focus:border-avatar-hover"
              placeholder="Enter avatar description"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tags (1-2 tags required)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? 'default' : 'secondary'}
                  className={`cursor-pointer ${
                    tags.includes(tag)
                      ? 'bg-avatar-primary'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {tags.includes(tag) && (
                    <X className="w-3 h-3 ml-1 inline-block" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Visibility
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="text-avatar-primary"
                />
                <span className="text-sm text-gray-600">Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="text-avatar-primary"
                />
                <span className="text-sm text-gray-600">Private</span>
              </label>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex gap-3 mt-6">
          <AlertDialogCancel className="flex-1 px-4 py-2 rounded-lg text-sm md:text-base hover:bg-gray-100">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 rounded-lg text-sm md:text-base bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarEditDialog;
