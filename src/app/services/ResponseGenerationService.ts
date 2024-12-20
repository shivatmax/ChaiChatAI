/* eslint-disable no-undef */
// import OpenAI from 'openai';
import { AIFriend } from '../types/AIFriend';
import { User } from '../types/SupabaseTypes';
import { getSessionData } from '../services/SessionService';
import { SessionType } from '../types/Session';
import { logger } from '../utils/logger';
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
    // logger.debug('session', session);
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
    logger.error('Error fetching session description:', error);
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
  ) => Promise<string[]>,
  mode?: string,
  webContent?: string
): Promise<string> => {
  // Fetch additional conversations from Supabase if needed
  if (lastConversations.length > 30) {
    lastConversations = [...lastConversations].slice(-20);
  } else if (lastConversations.length < 30) {
    const additionalConversations = await fetchConversationsFromSupabase(
      conversationId,
      30
    );
    // Merge consecutive messages from same sender
    const mergedConversations = [];
    let currentSender = '';
    let currentMessage = '';

    for (const conv of additionalConversations) {
      const [sender, message] = conv.split(': ');
      if (sender === currentSender) {
        currentMessage += ' ' + message;
      } else {
        if (currentMessage) {
          mergedConversations.push(`${currentSender}: ${currentMessage}`);
        }
        currentSender = sender;
        currentMessage = message;
      }
    }
    if (currentMessage) {
      mergedConversations.push(`${currentSender}: ${currentMessage}`);
    }

    lastConversations = [...mergedConversations].slice(-20);
  }

  const { descriptionString, sessionType } =
    await getSessionDescription(conversationId);

  logger.debug('mode', mode);
  logger.debug('webContent', webContent);

  const response = await fetch('/api/llms/ai-friend-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userPrompt: prompt,
      modeData: {
        mode: mode,
        webContent: webContent,
      },
      dataObject: {
        userId: user.id,
        sessionId: conversationId,
        aiFriendId: aiFriend.id,
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

  logger.debug('response', response);

  if (!response.ok) {
    logger.error('Error in AI response:', {
      status: response.status,
      statusText: response.statusText,
    });
    return 'Sorry, there was an error generating the response.';
  }

  const responseText = await response.text();
  logger.debug('responseText', responseText);

  try {
    return responseText || 'I am busy now, I will respond later.';
  } catch (error) {
    logger.error('Error parsing JSON:', error);
    return responseText || 'Error parsing the response.';
  }
};
