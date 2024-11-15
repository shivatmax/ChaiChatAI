/* eslint-disable */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
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
import { detectUrls } from '../utils/urlDetector';
import AudioTranscriber from './AudioTranscriber';

interface ChatInputAreaProps {
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  isGlowing: boolean;
  isDisabled: boolean;
  isTyping: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = React.memo(
  ({
    inputMessage,
    setInputMessage,
    handleSendMessage,
    isGlowing,
    isDisabled,
    isTyping,
  }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const adjustTextareaHeight = useCallback(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 60);
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }, []);

    useEffect(() => {
      adjustTextareaHeight();
    }, [inputMessage, adjustTextareaHeight]);

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      },
      [setInputMessage]
    );

    return (
      <div className="relative w-full flex justify-center items-center">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-0 z-10 mb-2 w-full sm:w-72"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width="100%"
                height="300px"
                previewConfig={{ showPreview: false }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-4 bg-gradient-to-r from-blue-200/90 to-blue-300/90 backdrop-blur-md rounded-2xl border border-blue-100 w-full max-w-5xl shadow-lg">
          <motion.div
            whileHover={{ scale: isDisabled ? 1 : 1.1 }}
            whileTap={{ scale: isDisabled ? 1 : 0.9 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  variant="outline"
                  size="icon"
                  className="rounded-xl bg-white/80 hover:bg-white border-blue-200 w-8 h-8 sm:w-12 sm:h-12 transition-all duration-300"
                  disabled={isDisabled}
                >
                  <Smile className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
                </Button>
              </TooltipTrigger>
              {isDisabled && (
                <TooltipContent>
                  <p>
                    {isTyping
                      ? 'Wait for your friends to finish'
                      : 'Create a session to start chatting! ✨'}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </motion.div>
          <GlowingComponent isGlowing={isGlowing} className="flex-grow">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full flex justify-center">
                    <Textarea
                      ref={textareaRef}
                      rows={2}
                      placeholder={
                        isDisabled
                          ? 'Create a session to start chatting ✨'
                          : 'Type your message...'
                      }
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        adjustTextareaHeight();
                      }}
                      onKeyDown={handleKeyPress}
                      onPaste={(e) => {
                        const pastedText = e.clipboardData.getData('text');
                        const urls = detectUrls(pastedText);
                        if (urls.length > 0) {
                          e.preventDefault();
                          const newText = inputMessage + pastedText;
                          setInputMessage(newText);
                        }
                      }}
                      className="w-full max-w-full rounded-xl bg-white/80 border border-blue-200 focus:ring-2 focus:ring-blue-300 text-blue-800 placeholder-blue-400 text-base py-2 sm:py-3 px-3 sm:px-4 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent backdrop-blur-sm"
                      disabled={isDisabled}
                      style={{
                        minHeight: '50px',
                        maxHeight: '100px',
                      }}
                    />
                  </div>
                </TooltipTrigger>
                {isDisabled && (
                  <TooltipContent>
                    <p>
                      {isTyping
                        ? 'Wait for your friends to finish'
                        : 'Create a session to start chatting! ✨'}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </GlowingComponent>
          <AudioTranscriber
            onTranscriptionComplete={(text) =>
              setInputMessage((prev) => prev + text)
            }
            isDisabled={isDisabled}
          />
          <motion.div
            whileHover={{ scale: isDisabled ? 1 : 1.1 }}
            whileTap={{ scale: isDisabled ? 1 : 0.9 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendMessage}
                  className="rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-3 sm:px-6 py-2 sm:py-3 font-medium text-white border border-blue-200 shadow-lg transition-all duration-300"
                  disabled={isDisabled}
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </TooltipTrigger>
              {isDisabled && (
                <TooltipContent>
                  <p>
                    {isTyping
                      ? 'Wait for your friends to finish'
                      : 'Create a session to start chatting! ✨'}
                  </p>
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
