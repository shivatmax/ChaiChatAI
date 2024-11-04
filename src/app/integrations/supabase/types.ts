export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      AccountSettings: {
        Row: {
          bio: string | null;
          created_at: string | null;
          display_name: string | null;
          email: string | null;
          id: string;
          subscription_plan: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          subscription_plan?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          subscription_plan?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      BetaFeatures: {
        Row: {
          created_at: string | null;
          description: string | null;
          feature_name: string;
          id: string;
          image_url: string | null;
          release_date: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          feature_name: string;
          id?: string;
          image_url?: string | null;
          release_date?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          feature_name?: string;
          id?: string;
          image_url?: string | null;
          release_date?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      UsageStatistics: {
        Row: {
          avg_session_time: number | null;
          conversations_left: number | null;
          created_at: string | null;
          id: string;
          total_ai_friends: number | null;
          total_conversations: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          avg_session_time?: number | null;
          conversations_left?: number | null;
          created_at?: string | null;
          id?: string;
          total_ai_friends?: number | null;
          total_conversations?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          avg_session_time?: number | null;
          conversations_left?: number | null;
          created_at?: string | null;
          id?: string;
          total_ai_friends?: number | null;
          total_conversations?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      UserSettings: {
        Row: {
          auto_reply: boolean | null;
          created_at: string | null;
          email_notifications: boolean | null;
          id: string;
          message_history: boolean | null;
          public_profile: boolean | null;
          push_notifications: boolean | null;
          share_usage_data: boolean | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          auto_reply?: boolean | null;
          created_at?: string | null;
          email_notifications?: boolean | null;
          id?: string;
          message_history?: boolean | null;
          public_profile?: boolean | null;
          push_notifications?: boolean | null;
          share_usage_data?: boolean | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          auto_reply?: boolean | null;
          created_at?: string | null;
          email_notifications?: boolean | null;
          id?: string;
          message_history?: boolean | null;
          public_profile?: boolean | null;
          push_notifications?: boolean | null;
          share_usage_data?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
