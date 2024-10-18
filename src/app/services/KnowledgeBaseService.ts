// import OpenAI from 'openai';

// const apiKey = import.meta.env.VITE_NEXT_PUBLIC_OPENAI_API_KEY || '';
// const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

// export const updateKnowledgeBase = async (
//   currentKnowledge: string,
//   newKnowledge: string
// ): Promise<string> => {
//   try {
//     const completion = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
//       messages: [
//         {
//           role: 'system',
//           content:
//             'You are a knowledge integration agent. Your task is to integrate new knowledge into the existing knowledge base.',
//         },
//         {
//           role: 'user',
//           content: `Current knowledge:\n${currentKnowledge}\n\nNew knowledge to be integrated:\n${newKnowledge}\n\nPlease provide an updated, coherent knowledge base that incorporates the new information. Avoid redundancy, resolve any conflicts, and ensure the information is organized logically.`,
//         },
//       ],
//       max_tokens: 500,
//     });

//     return (
//       completion.choices[0].message.content ||
//       'Unable to update knowledge base.'
//     );
//   } catch (error) {
//     console.error('Error in knowledge integration:', error);
//     return currentKnowledge;
//   }
// };
