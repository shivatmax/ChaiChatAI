/* eslint-disable no-undef */
// import OpenAI from 'openai';
import { AIFriend } from '../types/AIFriend';
import { User } from '../types/SupabaseTypes';
import { getSessionData } from '../services/SessionService';
import { SessionType } from '../types/Session';

// const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
// const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

const getSessionDescription = async (
  sessionId: string
): Promise<{ descriptionString: string; sessionType: SessionType }> => {
  const storedDescription = localStorage.getItem(
    `session_description_${sessionId}`
  );
  const storedSessionType = localStorage.getItem(`session_type_${sessionId}`);
  if (storedDescription && storedSessionType) {
    return {
      descriptionString: storedDescription,
      sessionType: storedSessionType as SessionType,
    };
  }

  try {
    const session = await getSessionData(sessionId);
    // console.log('session', session);
    if (session && session.description && session.session_type) {
      const sessionType = session.session_type;
      const description = {
        description:
          typeof session.description === 'string'
            ? session.description
            : JSON.stringify(session.description),
      };
      const descriptionString = JSON.stringify(description);
      localStorage.setItem(
        `session_description_${sessionId}`,
        descriptionString
      );
      localStorage.setItem(`session_type_${sessionId}`, session.session_type);
      return { descriptionString, sessionType };
    }
  } catch (error) {
    console.error('Error fetching session description:', error);
  }

  return {
    descriptionString: 'No description available',
    sessionType: SessionType.General,
  };
};

export const clearStoredSessionDescription = (sessionId: string): void => {
  localStorage.removeItem(`session_description_${sessionId}`);
};

export const generateAIResponse = async (
  prompt: string,
  user: User,
  aiFriend: AIFriend,
  friendsSummary: string,
  conversationId: string,
  lastConversations: string[],
  fetchConversationsFromSupabase: (
    sessionId: string,
    limit: number
  ) => Promise<string[]>
): Promise<string> => {
  // Fetch additional conversations from Supabase if needed
  if (lastConversations.length < 20) {
    const additionalConversations = await fetchConversationsFromSupabase(
      conversationId,
      20
    );
    lastConversations = [...additionalConversations].slice(-20);
  }

  const { descriptionString, sessionType } =
    await getSessionDescription(conversationId);

  const response = await fetch('/api/llms/ai-friend-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userPrompt: prompt,
      dataObject: {
        userId: user.id,
        sessionId: conversationId,
        aiFriend: {
          name: aiFriend.name || '',
          persona: aiFriend.persona || '',
          about: aiFriend.about || '',
          knowledge_base: aiFriend.knowledge_base || '',
        },
        user: {
          name: user.name || '',
          persona: user.persona || '',
          about: user.about || '',
          knowledge_base: user.knowledge_base || '',
        },
        friendsSummary: friendsSummary || '',
      },
      sessionType: sessionType || '',
      sessionDescription: descriptionString || '',
      lastConversation: lastConversations || [],
    }),
  });

  console.log('response', response);

  if (!response.ok) {
    console.error(
      'Error in AI response:',
      response.status,
      response.statusText
    );
    return 'Sorry, there was an error generating the response.';
  }

  const responseText = await response.text();
  console.log('responseText', responseText);

  try {
    return responseText || 'I am busy now, I will respond later.';
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return responseText || 'Error parsing the response.';
  }
};
