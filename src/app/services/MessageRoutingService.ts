import OpenAI from 'openai';
import { AIFriend } from '../types/AIFriend';
import { User } from '../types/User';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import {
  openaiChat,
  unifyAgentChat,
  unifyAgentChatWithResponseFormat,
} from '../utils/models';
import { systemPromptMessageRoute } from '../utils/prompts/MessageRoute';
import { systemPromptFriendSummary } from '../utils/prompts/Summary';

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

  const systemPrompt = systemPromptMessageRoute;

  const userPrompt = `
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

Based on the provided information, determine which 1-3 friends should respond to this message. Consider the message content, the user's profile, and the friends' personalities and about. Provide your response as an array of friend names.`;
  //Json schema
  const jsonSchema = {
    type: 'object',
    properties: {
      friends: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['friends'],
  };
  const responseFormat = JSON.stringify({
    schema: jsonSchema,
    name: 'respondingFriends',
  });

  try {
    const result = await unifyAgentChatWithResponseFormat(
      userPrompt,
      systemPrompt,
      responseFormat
    );
    const parsedResult = JSON.parse(result);
    if (parsedResult && Array.isArray(parsedResult.friends)) {
      return parsedResult.friends;
    }
    // console.log(
    //   'parsedResult from unifyAgentChatWithResponseFormat',
    //   parsedResult
    // );
    throw new Error(
      'Invalid response format from unifyAgentChatWithResponseFormat'
    );
  } catch (error) {
    console.error(
      'Error in unifyAgentChatWithResponseFormat, falling back to openaiChat:',
      error
    );
    try {
      const completion = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: zodResponseFormat(
          RespondingFriends,
          'respondingFriends'
        ),
      });

      const respondingFriends = completion.choices[0].message.parsed?.friends;
      // console.log('respondingFriends from openaiChat', respondingFriends);
      return respondingFriends || null;
    } catch (openaiError) {
      console.error('Error in openaiChat fallback:', openaiError);
      return activeFriends
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map((f) => f.name);
    }
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
