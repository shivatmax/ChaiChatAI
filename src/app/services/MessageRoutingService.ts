import { AIFriend } from '../types/AIFriend';
import { User } from '../types/SupabaseTypes';
interface RouterData {
  user: Partial<User>;
  activeFriends: Partial<AIFriend>[];
}
export const routeMessage = async (
  message: string,
  user: User,
  aiFriends: AIFriend[],
  lastConversations: string[],
  fetchConversationsFromSupabase: (
    sessionId: string,
    limit: number
  ) => Promise<string[]>
): Promise<{ friends: string[]; mode: string; webContent?: string } | null> => {
  const activeFriends = aiFriends.filter((friend) => friend.status);
  const routerData: RouterData = {
    user: {
      name: user.name,
      persona: user.persona,
      about: user.about,
      knowledge_base: user.knowledge_base,
    },
    activeFriends: activeFriends.map((friend) => ({
      name: friend.name,
      persona: friend.persona,
      about: friend.about,
      knowledge_base: friend.knowledge_base,
    })),
  };

  // Fetch additional conversations from Supabase if needed
  if (lastConversations.length < 10) {
    const additionalConversations = await fetchConversationsFromSupabase(
      message,
      10
    );
    lastConversations = [...additionalConversations].slice(-10);
  }

  const finalMessage = `lastConversations: ${lastConversations} and lastMessage of user ${user.name}: ${message}`;

  try {
    const response = await fetch('/api/llms/message-router', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: finalMessage,
        routerData: routerData,
        lastConversations: lastConversations || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('data', data);
    return {
      friends: data.friends,
      mode: data.mode,
      webContent: data.webContent,
    };
  } catch (error) {
    console.error('Error in message routing:', error);
    return {
      friends: activeFriends
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map((f) => f.name),
      mode: 'normal',
      webContent: 'no additional content',
    };
  }
};

export const generateFriendsSummary = async (
  aiFriends: AIFriend[] | undefined,
  user: User
): Promise<string> => {
  // Early return if aiFriends is undefined or empty
  if (!aiFriends || aiFriends.length === 0) {
    return 'No AI friends available yet.';
  }

  const cacheKey = 'aiFriendsSummary';
  const cachedSummary = localStorage.getItem(cacheKey);
  const cachedFriendsData = localStorage.getItem('cachedAIFriendsData');

  // Check cache validity
  if (cachedSummary && cachedFriendsData) {
    try {
      const parsedCachedFriends = JSON.parse(cachedFriendsData);
      if (
        JSON.stringify(aiFriends) === JSON.stringify(parsedCachedFriends) &&
        aiFriends.every((friend) => friend.status)
      ) {
        return cachedSummary;
      }
    } catch (error) {
      console.error('Error parsing cached friends data:', error);
      // Continue with generating new summary if cache parsing fails
    }
  }

  try {
    const response = await fetch('/api/llms/generate-friend-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        friendsData: {
          user: {
            name: user.name,
            persona: user.persona,
            about: user.about,
            knowledge_base: user.knowledge_base,
          },
          friends: aiFriends.map((friend) => ({
            name: friend.name,
            persona: friend.persona,
            about: friend.about,
            knowledge_base: friend.knowledge_base,
          })),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const summary = await response.text();

    if (typeof summary !== 'string') {
      throw new Error('Unexpected response format');
    }

    // Only cache if we have valid data
    if (summary && aiFriends.length > 0) {
      localStorage.setItem(cacheKey, summary);
      localStorage.setItem('cachedAIFriendsData', JSON.stringify(aiFriends));
    }

    return summary;
  } catch (error) {
    console.error('Error generating friends summary:', error);
    return 'Error occurred while generating friends summary.';
  }
};

export const FriendsMemory = async (
  aiFriends: AIFriend[],
  userId: string,
  conversationId: string,
  friendsSummary: string,
  fetchConversationsFromSupabase: (
    sessionId: string,
    limit: number
  ) => Promise<string[]>
): Promise<void> => {
  try {
    const activeFriends = aiFriends.filter((friend) => friend.status);
    // Fetch last 30 conversations from Supabase
    const lastConversations = await fetchConversationsFromSupabase(
      conversationId,
      50
    );

    const response = await fetch('/api/vector/create-memory-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataInfo: {
          aiFriends: activeFriends.map((friend) => ({
            aiFriendId: friend.id,
            aiFriendName: friend.name,
            aiFriendPersona: friend.persona,
            aiFriendAbout: friend.about,
            aiFriendKnowledgeBase: friend.knowledge_base,
          })),
        },
        friendsSummary: friendsSummary,
        userId: userId,
        conversationId: conversationId,
        lastConversations: lastConversations.join('\n'),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const summary = await response.text();

    if (typeof summary !== 'string') {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error fetching conversation history:', error);
  }
};
