export interface AIFriend {
  id: string;
  name: string;
  persona: string;
  about: unknown;
  knowledge_base: string;
  memory?: unknown;
  status: boolean;
  avatar_url?: string;
}

export interface KnowledgeBase {
  id: string;
  ai_friend_id: string;
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationHistory {
  id: string;
  user_id: string;
  ai_friend_id: string;
  message: string;
  sender: string;
  created_at: string;
  conversation_id: string;
  updated_at: string;
  summary?: string;
}

export interface UserKnowledgeBase {
  id: string;
  user_id: string;
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  encrypted_name: string;
  encrypted_email: string;
  email_hash: string;
  encryption_key: string;
  encryption_salt: string;
  iv: string;
  tag: string;
  email?: string;
  avatar_url?: string;
  persona: string;
  about: string;
  knowledge_base: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export enum SessionType {
  General = 'General',
  StoryMode = 'StoryMode',
  ResearchCreateMode = 'ResearchCreateMode',
}

export interface Session {
  id: string;
  user_id: string;
  ai_friend_ids: string[];
  session_type: SessionType;
  title?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
