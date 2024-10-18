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
    <Card className='w-full h-full bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow overflow-hidden'>
      <CardHeader className='bg-gradient-to-r from-comic-purple to-comic-blue p-4'>
        <CardTitle className='text-2xl font-bold text-comic-yellow'>
          Conversation Insights
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <ScrollArea className='h-[calc(100vh-240px)]'>
          {filteredHistory && filteredHistory.length > 0 ? (
            <div className='space-y-4'>
              {filteredHistory.map((entry: ConversationEntry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className='bg-white p-3 rounded-lg comic-border comic-shadow'
                >
                  <p className='text-lg text-comic-blue font-medium'>
                    {entry.message}
                  </p>
                  <p className='text-sm text-comic-purple mt-2'>
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className='text-xl text-comic-purple text-center font-bold'>
              No conversation insights available yet!
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationInsights;
