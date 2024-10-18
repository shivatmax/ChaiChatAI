import React from 'react';
import { Session, SessionType } from '../types/Session';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionItemProps {
  session: Session;
  onSelect: (sessionId: string) => void;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case SessionType.StoryMode:
        return 'bg-comic-green text-black';
      case SessionType.ResearchCreateMode:
        return 'bg-comic-blue text-white';
      default:
        return 'bg-comic-yellow text-black';
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(session);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(session);
  };

  return (
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
      className={`flex items-center justify-between my-1 sm:my-2 rounded-md sm:rounded-lg ${getSessionTypeColor(
        session.session_type
      )} hover:opacity-80 transition-opacity duration-200 cursor-pointer text-xs sm:text-sm font-bold p-1 sm:p-2 comic-border comic-shadow`}
      onClick={() => onSelect(session.id)}
    >
      <span className='block truncate flex-grow mr-2'>
        {session.title || `Session ${session.id.slice(0, 8)}`}
      </span>
      <div className='flex space-x-1 flex-shrink-0'>
        <Button
          size='sm'
          variant='ghost'
          onClick={handleEdit}
          className='p-1 hover:bg-comic-purple hover:text-white'
        >
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          size='sm'
          variant='ghost'
          onClick={handleDelete}
          className='p-1 hover:bg-comic-red hover:text-white'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </motion.div>
  );
};

export default SessionItem;
