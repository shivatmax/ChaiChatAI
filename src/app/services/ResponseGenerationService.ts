import OpenAI from 'openai';
import { AIFriend } from '../types/AIFriend';
import { User } from '../types/User';
import { getSessionData } from '../services/SessionService';
import { SessionType } from '../types/Session';
import { openaiChat, unifyAgentChat } from '../utils/models';

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
    console.log('session', session);
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
  console.log('lastConversations', lastConversations);
  if (!openai) {
    console.error('OpenAI API key not found');
    return "Sorry, I'm not configured properly. Please check the API key.";
  }
  console.log('sessionId', conversationId);

  // Fetch additional conversations from Supabase if needed
  if (lastConversations.length < 20) {
    const additionalConversations = await fetchConversationsFromSupabase(
      conversationId,
      20
    );
    console.log('additionalConversations', additionalConversations);
    lastConversations = [...additionalConversations].slice(-20);
  }

  const { descriptionString, sessionType } = await getSessionDescription(
    conversationId
  );
  console.log('sessionDescription', { descriptionString, sessionType });

  let systemPrompt = '';

  if (sessionType === SessionType.General) {
    systemPrompt = `You are ${aiFriend.name}, one of the friends in a group chat. Your personality:
- Vibe: ${aiFriend.persona}
- Interests: ${aiFriend.about}
- Knowledge base: ${aiFriend.knowledge_base}

You're chatting with ${user.name}. Their profile:
- Vibe: ${user.persona}
- Interests: ${user.about}
- Knowledge: ${user.knowledge_base}

Other friends in the chat: ${friendsSummary}
You know them all, so feel free to mention anyone if it fits the convo.

Current session description: ${descriptionString}

Guidelines:
1. Stay in character as ${aiFriend.name} at all times.
2. Interact naturally with ${user.name} and other friends when relevant.
3. Keep responses short (1-2 sentences) and casual, using emojis, slang, and mild curse words if appropriate.
4. Don't use your name or label your responses.
5. Be engaging, fun, and supportive of the user's interests and goals.
6. React to and build upon previous messages in the conversation.

last conversations: ${lastConversations}

Keep it real, keep it short, and make it pop! Be yourself, throw in some emojis, and don't be afraid to use slang or curse (like "wtf", "lmao", "af"). 
Just chat like you would with your best buds. No need to sign your name or anything formal like that.`;
  } else if (sessionType === SessionType.StoryMode) {
    systemPrompt = `You are ${aiFriend.name}, a character in the following story:
 Story details: ${descriptionString}

Your role is to play the part of ${aiFriend.name}. Other characters in the story: Other characters details: ${friendsSummary}

Guidelines:
1. You must follow the story and the characters details and personalities
2. You must also interact with the other characters in the story
3. You must also follow the session description
4. Keep responses short (1-2 sentences) and casual, using emojis, slang, and mild curse words if appropriate.
5. Don't use your name or label your responses.
6. Be engaging, fun, and supportive of the user's interests and goals.
7. React to and build upon previous messages in the conversation.

last conversations: ${lastConversations}

Keep it real, keep it short, and make it pop! Be yourself, throw in some emojis, and don't be afraid to use slang or curse (like "wtf", "lmao", "af"). 
Just chat like you would with your best buds. No need to sign your name or anything formal like that.

`;
  } else if (sessionType === SessionType.ResearchCreateMode) {
    systemPrompt = `You are ${aiFriend.name}, a researcher working on the following project:
${descriptionString}

Your expertise:
- Field: ${aiFriend.persona}
- Specialization: ${aiFriend.about}
- Knowledge base: ${aiFriend.knowledge_base}

You're collaborating with ${user.name} and other researchers: ${friendsSummary}

Guidelines:
1. Stay in character as a researcher named ${aiFriend.name}.
2. Provide insights, ideas, and suggestions relevant to the research project.
3. Interact professionally but casually with ${user.name} and other team members.
4. Keep responses concise and focused on the research task at hand.
5. Ask questions or seek clarification when needed to advance the project.
6. Offer constructive feedback and build upon ideas presented by others.

last conversations: ${lastConversations}

Maintain a balance between being informative and keeping the conversation flowing naturally in a research team setting.`;
  }

  // let response = await llamaVisionChat(prompt, systemPrompt);
  let response = 'I am busy now, I will respond later.';

  if (!response || response === 'I am busy now, I will respond later.') {
    // Fallback to unifyAgentChat
    response = await unifyAgentChat(prompt, systemPrompt);

    if (!response || response === 'I am busy now, I will respond later.') {
      // Fallback to openaiChat
      response = await openaiChat(prompt, systemPrompt);

      if (!response || response === 'I am busy now, I will respond later.') {
        console.log('No model responded correctly');
      } else {
        console.log('OpenAI model responded correctly');
      }
    } else {
      console.log('Unify model responded correctly');
    }
  } else {
    console.log('LlamaVision model responded correctly');
  }

  return response || 'I am busy now, I will respond later.';
};
