import React from 'react';
import { Session } from '../types/Session';
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
  // const getSessionTypeColor = (type: SessionType) => {
  //   switch (type) {
  //     case SessionType.StoryMode:
  //       return 'bg-comic-green text-black';
  //     case SessionType.ResearchCreateMode:
  //       return 'bg-comic-blue text-white';
  //     default:
  //       return 'bg-comic-yellow text-black';
  //   }
  // };

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
      }}
      className={`flex items-center justify-between my-2 rounded-xl backdrop-blur-lg border border-blue-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer p-3 sm:p-4`}
      onClick={() => onSelect(session.id)}
    >
      <div className="flex items-center flex-grow">
        <span className="text-sm sm:text-base font-medium truncate mr-3 text-blue-800">
          {session.title || `Session ${session.id.slice(0, 8)}`}
        </span>
      </div>
      <div className="flex space-x-2 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEdit}
          className="rounded-full bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 transition-colors duration-200"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className="rounded-full bg-blue-50 hover:bg-red-100 border-blue-200 text-blue-600 hover:text-red-500 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default SessionItem;
