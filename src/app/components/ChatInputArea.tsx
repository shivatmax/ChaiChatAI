import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Smile, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import GlowingComponent from './GlowingComponent';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface ChatInputAreaProps {
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  isGlowing: boolean;
  isDisabled: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = React.memo(
  ({
    inputMessage,
    setInputMessage,
    handleSendMessage,
    isGlowing,
    isDisabled,
  }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target as Node)
        ) {
          setShowEmojiPicker(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      },
      [handleSendMessage]
    );

    const handleEmojiClick = useCallback(
      (emojiObject: EmojiClickData) => {
        setInputMessage((prevMessage) => prevMessage + emojiObject.emoji);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      [setInputMessage]
    );

    useEffect(() => {
      adjustInputSize();
    }, [inputMessage]);

    const adjustInputSize = () => {
      if (inputRef.current) {
        inputRef.current.style.width = 'auto';
        inputRef.current.style.width = `${inputRef.current.scrollWidth}px`;
      }
    };

    return (
      <div className='relative w-full flex justify-center items-center'>
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className='absolute bottom-full left-0 z-10 mb-2 w-full sm:w-72'
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width='100%'
                height='300px'
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className='flex items-center space-x-2 p-2 sm:p-3 bg-comic-green comic-border w-full max-w-5xl'>
          <motion.div
            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  variant='outline'
                  size='icon'
                  className='rounded-full hover:bg-comic-yellow transition-colors duration-200 comic-border comic-shadow w-8 h-8 sm:w-10 sm:h-10'
                  disabled={isDisabled}
                >
                  <Smile className='h-4 w-4 sm:h-5 sm:w-5 text-comic-purple' />
                </Button>
              </TooltipTrigger>
              {isDisabled && (
                <TooltipContent>
                  <p>Create a session to start chatting! 🚀</p>
                </TooltipContent>
              )}
            </Tooltip>
          </motion.div>
          <GlowingComponent
            isGlowing={isGlowing}
            className='flex-grow'
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='w-full flex justify-center'>
                    <Input
                      ref={inputRef}
                      type='text'
                      placeholder={
                        isDisabled
                          ? 'Create a session to start chatting 🚀'
                          : 'Type your message... 📝'
                      }
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        adjustInputSize();
                      }}
                      onKeyPress={handleKeyPress}
                      className='w-full max-w-full rounded-full bg-white comic-border focus:ring-2 focus:ring-comic-purple text-sm sm:text-base py-2 px-3'
                      disabled={isDisabled}
                      style={{
                        minWidth: '200px',
                        width: '100%',
                        maxWidth: 'calc(100% - 120px)',
                      }}
                    />
                  </div>
                </TooltipTrigger>
                {isDisabled && (
                  <TooltipContent>
                    <p>Create a session to start chatting! 🚀</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </GlowingComponent>
          <motion.div
            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendMessage}
                  className='rounded-full bg-comic-red hover:bg-comic-purple transition-colors duration-200 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-bold text-white comic-border comic-shadow'
                  disabled={isDisabled}
                >
                  <Send className='h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1' />
                  <span className='hidden sm:inline'>Send</span>
                </Button>
              </TooltipTrigger>
              {isDisabled && (
                <TooltipContent>
                  <p>Create a session to start chatting! 🚀</p>
                </TooltipContent>
              )}
            </Tooltip>
          </motion.div>
        </div>
      </div>
    );
  }
);

ChatInputArea.displayName = 'ChatInputArea';

export default ChatInputArea;
