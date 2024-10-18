import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const apiUrl = process.env.NEXT_PUBLIC_UNIFY_BASE_URL || '';
  const apiKey = process.env.NEXT_PUBLIC_UNIFY_API_KEY || '';

  if (!apiUrl || !apiKey) {
    console.error('Missing Unify API configuration');
    return NextResponse.json(
      { error: 'Unify API URL or API Key is missing' },
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
      console.error('Unify API error:', errorData);
      return NextResponse.json(
        { error: `Unify API error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in unify-proxy:', error);
    return NextResponse.json(
      {
        error: 'An error occurred while proxying the request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
