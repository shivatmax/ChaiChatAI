// import OpenAI from 'openai';

// const apiKey = import.meta.env.VITE_NEXT_PUBLIC_OPENAI_API_KEY || '';
// const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

// export const summarizeConversation = async (
//   conversationHistory: string
// ): Promise<string> => {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [
//         {
//           role: 'system',
//           content:
//             'You are a summarization agent. Your task is to extract key information and insights from the recent conversation history. Focus on new facts, important discussions, and notable interactions.',
//         },
//         {
//           role: 'user',
//           content: `Conversation history:\n${conversationHistory}\n\nPlease provide a concise summary of the key points and any new information learned during this conversation.`,
//         },
//       ],
//       max_tokens: 300,
//     });

//     return (
//       completion.choices[0].message.content ||
//       'Unable to summarize conversation.'
//     );
//   } catch (error) {
//     console.error('Error in summarization:', error);
//     return 'Error occurred during summarization.';
//   }
// };
