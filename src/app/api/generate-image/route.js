import { NextResponse } from 'next/server';

/**
 * API route handler for image generation.
 * Receives a POST request with a prompt, validates it, and returns an image URL.
 */
export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Received prompt:', prompt);

    // For now, return a placeholder image until we implement the actual AI generation
    // This simulates a successful API response
    const placeholderImage = `https://via.placeholder.com/512x512/1a1a1a/ffffff?text=${encodeURIComponent(
      prompt.substring(0, 20) + (prompt.length > 20 ? '...' : '')
    )}`;

    return NextResponse.json({ image_url: placeholderImage }, { status: 200 });
  } catch (error) {
    console.error('Error in generate-image API:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
