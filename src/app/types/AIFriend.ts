export interface AIFriend {
  id: string;
  user_id: string;
  avatar_id: string;
  name: string;
  persona: string;
  about: string;
  knowledge_base: string;
  memory?: { role: 'user' | 'assistant'; content: string }[];
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  avatar_url?: string;
}
