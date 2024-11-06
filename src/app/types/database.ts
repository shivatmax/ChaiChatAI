export interface UserSettings {
  id: string;
  userId: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  share_usage_data?: boolean;
  message_history?: boolean;
  auto_reply?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UsageStatistics {
  id: string;
  userId: string;
  totalConversations?: number;
  totalAiFriends?: number;
  avgSessionTime?: number;
  conversationsLeft?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccountSettings {
  id: string;
  userId: string;
  subscriptionPlan?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BetaFeatures {
  id: string;
  featureName: string;
  description?: string;
  status?: string;
  releaseDate?: Date;
  createdAt?: Date;
  imageUrl?: string;
}
