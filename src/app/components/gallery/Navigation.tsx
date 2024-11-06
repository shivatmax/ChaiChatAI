import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface NavigationProps {
  position?: 'left' | 'right';
  className?: string;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Navigation = ({
  position = 'left',
  className,
  activeSection,
  onSectionChange,
}: NavigationProps) => {
  const isLeft = position === 'left';
  const sections = isLeft
    ? [
        { name: 'Your Avatars', color: 'text-avatar-primary' },
        { name: 'Featured', color: 'text-avatar-accent' },
        { name: 'Discover', color: 'text-avatar-hover' },
        { name: 'Favorites', color: 'text-avatar-primary' },
      ]
    : [
        { name: 'Home', color: 'text-avatar-primary' },
        { name: 'Favorites', color: 'text-avatar-accent' },
        { name: 'Create New', color: 'text-avatar-hover' },
        { name: 'Settings', color: 'text-avatar-primary' },
      ];

  const handleClick = (name: string) => {
    if (isLeft && onSectionChange) {
      onSectionChange(name);
    }
  };

  return (
    <nav
      className={cn(
        'h-full py-8 flex flex-col backdrop-blur-sm bg-white/5',
        isLeft
          ? 'items-start pr-6 border-r border-avatar-primary/20'
          : 'items-center pl-6 border-l border-avatar-primary/20',
        className
      )}
    >
      <div className="space-y-3 w-full">
        {sections.map(({ name, color }) => (
          <motion.button
            key={name}
            onClick={() => handleClick(name)}
            className={cn(
              'relative w-full group flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-300',
              activeSection === name
                ? 'bg-gradient-to-br from-avatar-primary via-avatar-accent to-avatar-hover text-white shadow-lg'
                : `hover:bg-avatar-secondary/20 hover:backdrop-blur-sm ${color}`,
              isLeft ? 'justify-start' : 'justify-center'
            )}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeSection === name && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-avatar-primary via-avatar-accent to-avatar-hover rounded-lg opacity-90"
                layoutId="activeSection"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span
              className={cn(
                'relative text-sm font-medium transition-all duration-300',
                activeSection === name
                  ? 'text-white drop-shadow-md'
                  : 'group-hover:text-avatar-primary group-hover:drop-shadow-sm'
              )}
            >
              {name}
            </span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
