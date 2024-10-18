export interface ConversationHistory {
  id: string;
  conversation_id: string;
  sender: string;
  message: string;
  created_at: string;
}

export interface ConversationInsightsProps {
  userId: string;
  aiFriendId: string;
  aiFriendName: string;
}

export interface ConversationEntry {
  id: string;
  user_id: string;
  ai_friend_id: string;
  sender: string;
  message: string;
  created_at: string;
}
