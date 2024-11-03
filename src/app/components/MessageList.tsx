import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types/SupabaseTypes';
import { detectUrls } from '../utils/urlDetector';
import { decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
  avatar_url?: string;
}

interface MessageListProps {
  messages: Message[];
  user: User;
}

const MessageList: React.FC<MessageListProps> = React.memo(
  ({ messages, user }) => {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    const renderMessageContent = (content: string) => {
      const urls = detectUrls(content);
      if (urls.length === 0) return content;

      let renderedContent = content;
      urls.forEach((url) => {
        renderedContent = renderedContent.replace(
          url,
          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline break-all transition-colors duration-300">${url}</a>`
        );
      });

      return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />;
    };

    const getDisplayName = (user: User) => {
      if (!user) return 'You';

      if (user.name) {
        return user.name;
      }

      try {
        if (user.encrypted_name && user.encryption_key && user.iv && user.tag) {
          const key = Buffer.from(user.encryption_key, 'hex');
          const decryptedName = decrypt(
            user.encrypted_name,
            key,
            user.iv,
            user.tag
          );
          return decryptedName;
        }
      } catch (error) {
        logger.error('Error decrypting name:', error);
      }

      return 'Unknown User';
    };

    return (
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 20,
            }}
            className={`flex ${
              message.sender === getDisplayName(user)
                ? 'justify-end'
                : 'justify-start'
            } mb-3 px-4`}
          >
            {message.sender !== getDisplayName(user) && (
              <Avatar className="w-8 h-8 mr-2 mt-2">
                <AvatarImage src={message.avatar_url} alt={message.sender} />
                <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                  {message.sender.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <motion.div
              whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
              }}
              className={`max-w-[85%] p-4 rounded-2xl backdrop-blur-lg border border-blue-100/30 ${
                message.sender === getDisplayName(user)
                  ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                  : 'bg-gradient-to-r from-white to-blue-50 text-blue-900'
              }`}
            >
              <p className="font-bold text-sm mb-2 text-blue-900/90">
                {message.sender}
              </p>
              <p className="text-sm leading-relaxed break-words">
                {renderMessageContent(message.content)}
              </p>
              <p className="text-xs mt-2 text-blue-800/70 font-light">
                {formatTime(message.timestamp)}
              </p>
            </motion.div>
            {message.sender === getDisplayName(user) && (
              <Avatar className="w-8 h-8 ml-2 mt-2">
                <AvatarImage src={user.avatar_url} alt={message.sender} />
                <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                  {message.sender.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  }
);

MessageList.displayName = 'MessageList';

export default MessageList;
