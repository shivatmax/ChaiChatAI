export interface User {
  id: string;
  name: string;
  persona: string;
  about: string;
  knowledge_base: string;
  avatar_url?: string;
  created_at: string | Date;
  updated_at: string | Date;
}
