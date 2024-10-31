import Together from 'together-ai';
import { OpenAI } from 'openai';
import { logger } from './logger';

let together: Together | null = null;
let openai: OpenAI | null = null;

try {
  together = new Together({
    apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY || '',
  });
} catch (error) {
  logger.error('Error initializing Together client:', error);
}

try {
  openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });
} catch (error) {
  logger.error('Error initializing OpenAI client:', error);
}

export async function unifyAgentChat(userPrompt: string, systemPrompt: string) {
  try {
    const response = await fetch('/api/unify-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini@openai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 1,
        stream: false,
        frequency_penalty: 1.5,
        n: 1,
        drop_params: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Unify proxy error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logger.error('Error in unifyAgentChat:', error);
    return 'I am busy now, I will respond later.';
  }
}

export async function unifyAgentChatWithResponseFormat(
  userPrompt: string,
  systemPrompt: string,
  responseFormat: string
) {
  try {
    const response = await fetch('/api/unify-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini@openai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 1,
        stream: false,
        frequency_penalty: 1.5,
        n: 1,
        drop_params: true,
        response_format: {
          type: 'json_schema',
          json_schema: JSON.parse(responseFormat),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Unify proxy error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // logger.debug(
    //   'data from unifyAgentChatWithResponseFormat',
    //   data.choices[0].message.content
    // );
    return data.choices[0].message.content;
  } catch (error) {
    logger.error('Error in unifyAgentChatWithResponseFormat:', error);
    return 'I am busy now, I will respond later.';
  }
}

export async function openaiChat(
  userPrompt: string,
  systemPrompt: string
): Promise<string> {
  try {
    if (!openai) {
      throw new Error('OpenAI client is not initialized');
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 1,
    });

    return (
      completion.choices[0].message.content ||
      'I am busy now, I will respond later.'
    );
  } catch (error) {
    logger.error('Error in openaiChat:', error);
    return 'I am busy now, I will respond later.';
  }
}

async function imagePromptEnhancer(prompt: string) {
  const response = await unifyAgentChat(
    `Create a unique and visually stunning image based on this concept: ${prompt}. Enhance it with vivid details, dramatic lighting, and unexpected elements to make it truly extraordinary.`,
    'You are an expert visual artist and creative director. Your task is to transform basic concepts into breathtaking, one-of-a-kind image descriptions that push the boundaries of imagination.'
  );
  return response;
}
export async function imageGen(prompt: string) {
  if (!together) {
    throw new Error('Together client is not initialized');
  }
  const enhancedPrompt = await imagePromptEnhancer(prompt);
  const response = await together.images.create({
    model: 'black-forest-labs/FLUX.1-schnell-Free',
    prompt: enhancedPrompt,
    width: 960,
    height: 768,
    steps: 4,
    n: 1,
    seed: 1000,
    // @ts-expect-error Need to fix the TypeScript library type
    response_format: 'b64_json',
  });
  return response.data[0].b64_json;
}

// const b64Image = await imageGen(
//   'Create a realistic red dragon with blue-white flames from mouth'
// );
// logger.debug(b64Image);
export async function llamaVisionChat(
  userPrompt: string,
  systemPrompt: string,
  imageUrl?: string
) {
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: imageUrl
        ? [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
            { type: 'text', text: userPrompt },
          ]
        : userPrompt,
    },
  ];

  try {
    if (!together) {
      throw new Error('Together client is not initialized');
    }
    const response = await together.chat.completions.create({
      model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      max_tokens: 150,
      temperature: 1,
      // @ts-expect-error Need to fix the TypeScript library type
      messages: messages,
    });

    // logger.debug(response);

    return (
      response.choices[0]?.message?.content ||
      'I am busy now, I will respond later.'
    );
  } catch (error) {
    logger.error('Error in llamaVisionChat:', error);
    return 'I am busy now, I will respond later.';
  }
}
