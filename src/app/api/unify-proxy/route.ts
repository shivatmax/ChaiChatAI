import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const apiUrl = process.env.NEXT_PUBLIC_UNIFY_BASE_URL || '';
  const apiKey = process.env.NEXT_PUBLIC_UNIFY_API_KEY || '';

  if (!apiUrl) {
    return NextResponse.json(
      { error: 'Unify API URL is missing' },
      { status: 500 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Unify API Key is missing' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // .error('Unify API error:', errorData);
      return NextResponse.json(
        { error: `Unify API error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    // console.log('Unify API response:', data);
    return NextResponse.json(data);
  } catch (error) {
    // console.error('Error in unify-proxy:', error);
    return NextResponse.json(
      {
        error: 'An error occurred while proxying the request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// New proxy for message routing
// export async function POSTMessageRouting(req: Request) {
//   const body = await req.json();
//   const openaiUrl = process.env.NEXT_PUBLIC_UNIFY_OPENAI_COMPLETIONS_URL || '';
//   const apiKey = process.env.NEXT_PUBLIC_UNIFY_API_KEY || '';

//   if (!openaiUrl) {
//     return NextResponse.json(
//       { error: 'Unify OpenAI Completions URL is missing' },
//       { status: 500 }
//     );
//   }

//   if (!apiKey) {
//     return NextResponse.json(
//       { error: 'Unify API Key is missing' },
//       { status: 500 }
//     );
//   }

//   try {
//     const response = await fetch(openaiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('Unify OpenAI Completions API error:', errorData);
//       return NextResponse.json(
//         {
//           error: `Unify OpenAI Completions API error: ${response.status}`,
//           details: errorData,
//         },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Error in unify-proxy-message-routing:', error);
//     return NextResponse.json(
//       {
//         error: 'An error occurred while proxying the message routing request',
//         details: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }
