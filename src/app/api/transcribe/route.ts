import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyAIKey) {
      return NextResponse.json(
        { error: 'AssemblyAI API key not configured' },
        { status: 500 }
      );
    }

    // Upload the audio file to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        Authorization: assemblyAIKey,
      },
      body: audioFile,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio file');
    }

    const { upload_url } = await uploadResponse.json();

    // Start transcription with improved parameters for multi-language support
    const transcribeResponse = await fetch(
      'https://api.assemblyai.com/v2/transcript',
      {
        method: 'POST',
        headers: {
          Authorization: assemblyAIKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: upload_url,
          language_detection: true, // Enable automatic language detection
          punctuate: true, // Enable automatic punctuation
          format_text: true, // Enable text formatting
        }),
      }
    );

    if (!transcribeResponse.ok) {
      throw new Error('Failed to start transcription');
    }

    const { id } = await transcribeResponse.json();

    // Poll for transcription result
    let result;
    let attempts = 0;
    const maxAttempts = 60; // 1 minute timeout

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        {
          headers: {
            Authorization: assemblyAIKey,
          },
        }
      );

      result = await pollingResponse.json();

      if (result.status === 'completed') {
        break;
      } else if (result.status === 'error') {
        throw new Error('Transcription failed');
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (attempts >= maxAttempts) {
      throw new Error('Transcription timed out');
    }

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to process transcription' },
      { status: 500 }
    );
  }
}
