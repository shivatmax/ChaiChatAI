import OpenAI from 'openai';
import { AIFriend } from '../types/AIFriend';
import { User } from '../types/SupabaseTypes';
import { getSessionData } from '../services/SessionService';
import { SessionType } from '../types/Session';
import { llamaVisionChat, openaiChat, unifyAgentChat } from '../utils/models';
import {
  systemPromptGeneral,
  systemPromptStoryMode,
  systemPromptResearchCreateMode,
} from '../utils/prompts/Response';

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

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
  // console.log('lastConversations', lastConversations);
  if (!openai) {
    console.error('OpenAI API key not found');
    return "Sorry, I'm not configured properly. Please check the API key.";
  }
  // console.log('sessionId', conversationId);

  // Fetch additional conversations from Supabase if needed
  if (lastConversations.length < 20) {
    const additionalConversations = await fetchConversationsFromSupabase(
      conversationId,
      20
    );
    // console.log('additionalConversations', additionalConversations);
    lastConversations = [...additionalConversations].slice(-20);
  }

  const { descriptionString, sessionType } = await getSessionDescription(
    conversationId
  );
  // console.log('sessionDescription', { descriptionString, sessionType });

  let systemPrompt = '';

  if (sessionType === SessionType.General) {
    systemPrompt = systemPromptGeneral
      .replace('{aiFriendName}', aiFriend.name)
      .replace('{aiFriendPersona}', aiFriend.persona)
      .replace('{aiFriendAbout}', aiFriend.about)
      .replace('{aiFriendKnowledgeBase}', aiFriend.knowledge_base)
      .replace('{userName}', user.name)
      .replace('{userPersona}', user.persona)
      .replace('{userAbout}', user.about)
      .replace('{userKnowledgeBase}', user.knowledge_base || '')
      .replace('{friendsSummary}', friendsSummary)
      .replace('{descriptionString}', descriptionString)
      .replace('{lastConversations}', lastConversations.join('\n'));
  } else if (sessionType === SessionType.StoryMode) {
    systemPrompt = systemPromptStoryMode
      .replace('{aiFriendName}', aiFriend.name)
      .replace('{descriptionString}', descriptionString)
      .replace('{friendsSummary}', friendsSummary)
      .replace('{lastConversations}', lastConversations.join('\n'));
  } else if (sessionType === SessionType.ResearchCreateMode) {
    systemPrompt = systemPromptResearchCreateMode
      .replace('{aiFriendName}', aiFriend.name)
      .replace('{descriptionString}', descriptionString)
      .replace('{aiFriendPersona}', aiFriend.persona)
      .replace('{aiFriendAbout}', aiFriend.about)
      .replace('{aiFriendKnowledgeBase}', aiFriend.knowledge_base)
      .replace('{userName}', user.name)
      .replace('{friendsSummary}', friendsSummary)
      .replace('{lastConversations}', lastConversations.join('\n'));
  }

  let response = await openaiChat(prompt, systemPrompt);
  // let response = 'I am busy now, I will respond later.';

  if (!response || response === 'I am busy now, I will respond later.') {
    // Fallback to unifyAgentChat
    response = await unifyAgentChat(prompt, systemPrompt);

    if (!response || response === 'I am busy now, I will respond later.') {
      // Fallback to openaiChat
      response = await llamaVisionChat(prompt, systemPrompt);

      if (!response || response === 'I am busy now, I will respond later.') {
        // console.log('No model responded correctly');
      } else {
        // console.log('OpenAI model responded correctly');
      }
    } else {
      // console.log('Unify model responded correctly');
    }
  } else {
    // console.log('LlamaVision model responded correctly');
  }

  return response || 'I am busy now, I will respond later.';
};
