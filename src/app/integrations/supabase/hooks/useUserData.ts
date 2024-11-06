import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
// import { decrypt } from '../../../utils/encryption';
import { logger } from '../../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const fetchUser = async (currentUserId: string) => {
  console.log('Fetching user data for ID:', currentUserId);
  const { data: user, error: userError } = await supabase
    .from('User')
    .select('*')
    .eq('id', currentUserId)
    .single();

  if (userError) {
    if (userError.code === 'PGRST116') {
      console.log('No user found for ID:', currentUserId);
      return null;
    }
    throw userError;
  }

  console.log('Raw user data:', user);

  // Decrypt user data
  let decryptedUser = { ...user };
  // Decryption disabled
  // if (user?.encryption_key && user?.iv && user?.tag) {
  //   try {
  //     const key = Buffer.from(user.encryption_key, 'hex');

  //     // Decrypt name and email separately with their own IV/tag
  //     if (user.encrypted_name) {
  //       decryptedUser.name = decrypt(
  //         user.encrypted_name,
  //         key,
  //         user.iv,
  //         user.tag
  //       );
  //     }

  //     if (user.encrypted_email) {
  //       decryptedUser.email = decrypt(
  //         user.encrypted_email,
  //         key,
  //         user.iv,
  //         user.tag
  //       );
  //     }
  //     console.log('Successfully decrypted user data');
  //   } catch (decryptError) {
  //     logger.error('Decryption error:', { error: decryptError });
  //     console.log('Failed to decrypt user data, using encrypted values');
  //     // Fallback to encrypted values
  //     decryptedUser.name = user.encrypted_name;
  //     decryptedUser.email = user.encrypted_email;
  //   }
  // }

  // Use encrypted values directly
  decryptedUser.name = user.encrypted_name;
  decryptedUser.email = user.encrypted_email;

  console.log('Returning user:', decryptedUser);
  return decryptedUser;
};

const fetchSettings = async (currentUserId: string) => {
  console.log('Fetching settings for user ID:', currentUserId);
  const { data, error } = await supabase
    .from('UserSettings')
    .select('*')
    .eq('user_id', currentUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('No settings found, creating default settings');
      const defaultSettings = {
        id: uuidv4(),
        user_id: currentUserId,
        email_notifications: true,
        push_notifications: false,
        share_usage_data: false,
        message_history: false,
        auto_reply: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newSettings, error: createError } = await supabase
        .from('UserSettings')
        .insert(defaultSettings)
        .select()
        .single();

      if (createError) throw createError;
      return newSettings;
    }
    throw error;
  }
  console.log('Settings data:', data);
  return data;
};

const fetchUsageStats = async (currentUserId: string) => {
  const { data, error } = await supabase
    .from('UsageStatistics')
    .select(
      `
      id,
      user_id,
      total_conversations,
      total_ai_friends,
      avg_session_time,
      conversations_left,
      created_at,
      updated_at
    `
    )
    .eq('user_id', currentUserId)
    .single();

  if (error) throw error;
  return data;
};

const fetchAccount = async (currentUserId: string) => {
  console.log('Fetching account settings for user ID:', currentUserId);
  const { data, error } = await supabase
    .from('AccountSettings')
    .select('*')
    .eq('user_id', currentUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('No account settings found, creating default settings');
      const defaultAccount = {
        userId: currentUserId,
        subscriptionPlan: 'FREE',
        bio: '',
      };

      const { data: newAccount, error: createError } = await supabase
        .from('AccountSettings')
        .insert(defaultAccount)
        .select()
        .single();

      if (createError) throw createError;
      return newAccount;
    }
    throw error;
  }
  console.log('Account settings:', data);
  return data;
};

const fetchBeta = async () => {
  console.log('Fetching beta features');
  const { data, error } = await supabase.from('BetaFeatures').select('*');

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('No beta features found');
      return [];
    }
    throw error;
  }
  console.log('Beta features:', data);
  return data;
};

export const useUserData = (currentUserId: string) => {
  return useQuery({
    queryKey: ['user-data', currentUserId],
    queryFn: async () => {
      try {
        console.log('Starting useUserData query for ID:', currentUserId);
        const [user, settings, usage, account, beta] = await Promise.all([
          fetchUser(currentUserId),
          fetchSettings(currentUserId),
          fetchUsageStats(currentUserId),
          fetchAccount(currentUserId),
          fetchBeta(),
        ]);

        const result = {
          user,
          settings,
          usage,
          account,
          beta,
        };
        console.log('Final aggregated user data:', result);
        return result;
      } catch (error) {
        logger.error('Error in useUserData:', error);
        console.error('Failed to fetch user data:', error);
        throw error;
      }
    },
    enabled: Boolean(currentUserId),
    retry: 1,
  });
};
