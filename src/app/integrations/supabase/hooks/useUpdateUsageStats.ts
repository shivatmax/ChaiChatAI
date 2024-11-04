import { supabase } from '../supabase';

export const updateUsageStats = async (userId: string) => {
  try {
    // Get total AI friends count
    const { count: aiFriendsCount, error: friendsError } = await supabase
      .from('AIFriend')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (friendsError) throw friendsError;

    // Get conversation data for calculations
    const { data: conversations, error: convoError } = await supabase
      .from('ConversationHistory')
      .select('conversation_id')
      .eq('user_id', userId);

    if (convoError) throw convoError;

    // Get total messages count
    const { count: totalMessages, error: messagesError } = await supabase
      .from('ConversationHistory')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (messagesError) throw messagesError;

    // Calculate unique conversations
    const uniqueConversations = new Set(
      conversations?.map((conv) => conv.conversation_id) || []
    ).size;

    // Calculate conversations left
    const conversationsLeft = Math.max(0, 100 - uniqueConversations);

    // Calculate average session time in minutes
    // Formula: (total_messages * 10 seconds) / total_conversations / 60 seconds
    const avgSessionTime =
      uniqueConversations > 0 && totalMessages
        ? Math.round((totalMessages * 10) / uniqueConversations / 60)
        : 0;

    // First check if a record exists
    const { data: existingStats, error: checkError } = await supabase
      .from('UsageStatistics')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    const statsData = {
      ...(existingStats
        ? { id: existingStats.id }
        : { id: crypto.randomUUID() }),
      user_id: userId,
      total_ai_friends: aiFriendsCount || 0,
      conversations_left: conversationsLeft,
      avg_session_time: avgSessionTime,
      updated_at: new Date().toISOString(),
    };

    // Update UsageStatistics
    const { error: updateError } = await supabase
      .from('UsageStatistics')
      .upsert(statsData, {
        onConflict: 'user_id',
      });

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error updating usage stats:', error);
    return { success: false, error };
  }
};
