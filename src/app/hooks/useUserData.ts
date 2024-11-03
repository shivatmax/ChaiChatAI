import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase';
import type { Database } from '../integrations/supabase/types';

export type UserData = {
  account: Database['public']['Tables']['account_settings']['Row'] | null;
  usage: Database['public']['Tables']['usage_statistics']['Row'] | null;
  settings: Database['public']['Tables']['user_settings']['Row'] | null;
};

export const useUserData = () => {
  return useQuery({
    queryKey: ['user-data'],
    queryFn: async (): Promise<UserData> => {
      // Fetch first record from each table
      const [accountResult, usageResult, settingsResult] = await Promise.all([
        supabase
          .from('account_settings')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .single(),
        supabase
          .from('usage_statistics')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .single(),
        supabase
          .from('user_settings')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)
          .single(),
      ]);

      return {
        account: accountResult.data,
        usage: usageResult.data,
        settings: settingsResult.data,
      };
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
