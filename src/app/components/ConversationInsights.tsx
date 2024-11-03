import React from 'react';
import { useUserAIFriendConversationHistory } from '../integrations/supabase/hooks/useConversationHistory';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { motion } from 'framer-motion';
import {
  ConversationInsightsProps,
  ConversationEntry,
} from '../types/ConversationHistory';

const ConversationInsights: React.FC<ConversationInsightsProps> = ({
  userId,
  aiFriendId,
  aiFriendName,
}) => {
  const { data: conversationHistory } = useUserAIFriendConversationHistory(
    userId,
    aiFriendId
  );

  const filteredHistory = conversationHistory?.filter(
    (entry: ConversationEntry) =>
      entry.user_id === userId &&
      entry.ai_friend_id === aiFriendId &&
      entry.sender === aiFriendName
  );

  return (
    <Card className="w-full h-full bg-gradient-to-b from-blue-50 to-white backdrop-blur-lg border border-blue-200 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-400/80 to-blue-500/80 backdrop-blur-md border-b border-blue-200 p-4">
        <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent flex items-center">
          Conversation Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-240px)]">
          {filteredHistory && filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((entry: ConversationEntry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-blue-100/50 to-blue-200/50 backdrop-blur-sm p-4 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-blue-200/20"
                >
                  <p className="text-lg text-blue-800 font-medium leading-relaxed">
                    {entry.message}
                  </p>
                  <p className="text-sm text-blue-500 mt-2 font-light">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </motion.div>
              ))}
              <div className="h-4" /> {/* Added spacing at the end */}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center p-6"
            >
              <p className="text-xl text-blue-500 font-medium">
                No conversation insights available yet!
              </p>
              <p className="text-sm text-blue-400 mt-2">
                Start chatting to see insights appear here
              </p>
            </motion.div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationInsights;
