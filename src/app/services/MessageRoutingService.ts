import OpenAI from 'openai';
import { AIFriend } from '../types/AIFriend';
import { User } from '../types/User';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

export const routeMessage = async (
  message: string,
  user: User,
  aiFriends: AIFriend[]
): Promise<string[] | null> => {
  const activeFriends = aiFriends.filter((friend) => friend.status);

  const RespondingFriends = z.object({
    friends: z.array(z.string()),
  });

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI tasked with determining which friends in a group chat should respond to a message. Your role is to analyze the message content, user context, and friends' profiles to make informed decisions. Follow these guidelines:

1. If a user directly addresses a specific friend by name, that friend must be included in the response.
2. Select 1 to 4 friends who are most relevant to the conversation based on their personalities, about, and the message content.
3. If User want to talk to all friends at once then you must respond with all friends name.
4. A friend can be selected multiple times if they remain highly relevant to the ongoing conversation example - [Allen, Tom, Allen, John, Doe, Doe]
5. Consider the dynamics of the group and aim to create engaging and diverse interactions.`,
        },
        {
          role: 'user',
          content: `
User: ${user.name}
User persona: ${user.persona}

Active Friends:
${activeFriends.map((f) => `- ${f.name} (${f.persona})`).join('\n')}

Friend Profiles:
${JSON.stringify(
  activeFriends.map((f) => ({
    name: f.name,
    persona: f.persona,
    about: f.about,
  })),
  null,
  2
)}

Latest Message: "${message}"

Based on the provided information, determine which 1-3 friends should respond to this message. Consider the message content, the user's profile, and the friends' personalities and about. Provide your response as an array of friend names.`,
        },
      ],
      response_format: zodResponseFormat(
        RespondingFriends,
        'respondingFriends'
      ),
    });

    const respondingFriends = completion.choices[0].message.parsed?.friends;
    return respondingFriends || null;
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a summarization agent. Your task is to create a brief summary of the AI friends in the chat.',
        },
        {
          role: 'user',
          content: `AI Friends:\n${friendsInfo.join(
            '\n'
          )}\n\nPlease provide a brief summary of these AI friends, highlighting their key characteristics and how they might interact in a group chat.`,
        },
      ],
      max_tokens: 300,
    });

    const summary =
      completion.choices[0].message.content ||
      'Unable to generate friends summary.';
    console.log('Generated summary:', summary);

    localStorage.setItem(cacheKey, summary);
    localStorage.setItem('cachedAIFriendsData', JSON.stringify(aiFriends));

    return summary;
  } catch (error) {
    console.error('Error generating friends summary:', error);
    return 'Error occurred while generating friends summary.';
  }
};
