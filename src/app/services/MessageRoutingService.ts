import { AIFriend } from '../types/AIFriend';
import { User } from '../types/User';
import { openaiChat, unifyAgentChat } from '../utils/models';
import { systemPromptFriendSummary } from '../utils/prompts/Summary';
interface RouterData {
  user: Partial<User>;
  activeFriends: Partial<AIFriend>[];
}
export const routeMessage = async (
  message: string,
  user: User,
  aiFriends: AIFriend[]
): Promise<string[] | null> => {
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
  // console.log('routerData', JSON.stringify(routerData, null, 2));
  try {
    const response = await fetch('/api/llms/message-router', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        routerData: routerData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('data', data);
    return data;
  } catch (error) {
    console.error('Error in message routing:', error);
    return activeFriends
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .map((f) => f.name);
  }
};

export const generateFriendsSummary = async (
  aiFriends: AIFriend[] | undefined
): Promise<string> => {
  if (!aiFriends || aiFriends.length === 0) {
    return 'No AI friends available yet.';
  }

  const cacheKey = 'aiFriendsSummary';
  const cachedSummary = localStorage.getItem(cacheKey);
  const cachedFriendsData = localStorage.getItem('cachedAIFriendsData');

  if (cachedSummary && cachedFriendsData) {
    const parsedCachedFriends = JSON.parse(cachedFriendsData);
    if (
      JSON.stringify(aiFriends) === JSON.stringify(parsedCachedFriends) &&
      aiFriends.every((friend) => friend.status)
    ) {
      return cachedSummary;
    }
  }

  try {
    const friendsInfo = aiFriends.map(
      (friend) => `${friend.name}: ${friend.persona}, about: ${friend.about}`
    );
    const systemPrompt = systemPromptFriendSummary;
    const userPrompt = `AI Friends:\n${friendsInfo.join(
      '\n'
    )}\n\nPlease provide a brief summary of these AI friends, highlighting their key characteristics and how they might interact in a group chat.`;

    let summary = await unifyAgentChat(userPrompt, systemPrompt);
    if (summary === 'I am busy now, I will respond later.') {
      // console.log('Falling back to openaiChat for summary generation');
      summary = await openaiChat(userPrompt, systemPrompt);
    }
    // console.log('Generated summary:', summary);

    localStorage.setItem(cacheKey, summary);
    localStorage.setItem('cachedAIFriendsData', JSON.stringify(aiFriends));

    return summary;
  } catch (error) {
    console.error('Error generating friends summary:', error);
    return 'Error occurred while generating friends summary.';
  }
};
