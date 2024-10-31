import { supabase } from '../integrations/supabase/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export const saveConversationHistory = async (
  userId: string,
  aiFriendId: string,
  message: string,
  sender: string,
  conversationId: string
): Promise<void> => {
  try {
    const { error } = await supabase.from('ConversationHistory').insert([
      {
        id: uuidv4(),
        user_id: userId,
        ai_friend_id: aiFriendId,
        message,
        sender,
        conversation_id: conversationId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('Error saving conversation history:', error);
  }
};
