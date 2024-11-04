export interface UserSettings {
  id: string;
  userId: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  shareUsageData?: boolean;
  publicProfile?: boolean;
  messageHistory?: boolean;
  autoReply?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
