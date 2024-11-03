export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  share_usage_data: boolean;
  public_profile: boolean;
  message_history: boolean;
  auto_reply: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageStatistics {
  id: string;
  user_id: string;
  total_conversations: number;
  total_ai_friends: number;
  avg_session_time: number;
  conversations_left: number;
  created_at: string;
  updated_at: string;
}
