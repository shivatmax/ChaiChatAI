import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types/User';
import { detectUrls } from '../utils/urlDetector';

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  user: User | null | undefined;
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
          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">${url}</a>`
        );
      });

      return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />;
    };

    return (
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`flex ${
              message.sender === user?.name ? 'justify-end' : 'justify-start'
            } mb-1 sm:mb-2`}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`max-w-[90%] p-1 sm:p-2 rounded-lg sm:rounded-xl comic-border comic-shadow ${
                message.sender === user?.name
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
      </AnimatePresence>
    );
  }
);

MessageList.displayName = 'MessageList';

export default MessageList;
