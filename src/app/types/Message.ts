export interface Message {
  sender: string;
  content: string;
  timestamp: Date;
  mode?: string;
  webContent?: string;
  avatar_url?: string;
  urlPreview?: {
    url: string;
    title?: string;
    description?: string;
    image?: string | null;
  };
}
