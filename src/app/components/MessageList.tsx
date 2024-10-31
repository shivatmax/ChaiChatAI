import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User } from '../types/SupabaseTypes';
import { detectUrls } from '../utils/urlDetector';
import { decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  user: User;
}

const MessageList: React.FC<MessageListProps> = React.memo(
  ({ messages, user }) => {
    const messagesList = useMemo(() => messages, [messages]);

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
          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">${url}</a>`
        );
      });

      return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />;
    };

    const getDisplayName = (user: User) => {
      if (!user) return 'You';

      // First try to get name
      if (user.name) {
        return user.name;
      }

      // Fallback to decrypted name
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
      <div className="flex flex-col space-y-2">
        {messagesList.map((message, index) => (
          <motion.div
            key={`${message.sender}-${message.timestamp.getTime()}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
            className={`flex ${
              message.sender === getDisplayName(user)
                ? 'justify-end'
                : 'justify-start'
            } mb-1 sm:mb-2`}
          >
            <motion.div
              initial={false}
              animate={{ scale: 1 }}
              className={`max-w-[90%] p-1 sm:p-2 rounded-lg sm:rounded-xl comic-border comic-shadow ${
                message.sender === getDisplayName(user)
                  ? 'bg-comic-blue text-white'
                  : 'bg-white text-black'
              }`}
            >
              <p className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">
                {message.sender}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed break-words url-highlight message-url url-container">
                {renderMessageContent(message.content)}
              </p>
              <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 opacity-70">
                {formatTime(message.timestamp)}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.messages.length !== nextProps.messages.length) {
      return false;
    }

    return prevProps.messages.every((msg, index) => {
      const nextMsg = nextProps.messages[index];
      return (
        msg.sender === nextMsg.sender &&
        msg.content === nextMsg.content &&
        msg.timestamp.getTime() === nextMsg.timestamp.getTime()
      );
    });
  }
);

MessageList.displayName = 'MessageList';

export default MessageList;
