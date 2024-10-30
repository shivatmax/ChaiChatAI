import { supabase } from '../integrations/supabase/supabase';

export const resetTodaysSummary = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('User')
      .update({ todaysSummary: false })
      .not('id', 'is', null);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error resetting todaysSummary:', error);
  }
};
