export interface Avatar {
  id: string;
  name: string;
  creator_id: string;
  creator: string;
  description: string;
  image_url: string;
  interactions: number;
  tags: string[];
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  about: string;
  persona: string;
  knowledge_base: string;
  memory?: unknown;
  status: boolean;
}
