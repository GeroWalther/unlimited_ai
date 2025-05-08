import { NextResponse } from 'next/server';
import { runReplicateImageGeneration } from '@/lib/replicate';
import { validatePrompt } from '@/lib/validatePrompt';

/**
 * API route handler for image generation.
 * Receives a POST request with a prompt, validates it, and returns an image URL.
 */
export async function POST(req) {
  const { prompt } = await req.json();

  // Validate the prompt
  const validation = validatePrompt(prompt);
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Generate the image using Replicate
  try {
    const output = await runReplicateImageGeneration(prompt);
    console.log('Replicate output type:', typeof output, Array.isArray(output));

    // Handle stream response from Replicate
    if (output && output[0] instanceof ReadableStream) {
      // Read from the stream to get the binary image data
      const reader = output[0].getReader();
      let chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      // Combine all chunks into a single Uint8Array
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combinedChunks = new Uint8Array(totalLength);
      let position = 0;

      for (const chunk of chunks) {
        combinedChunks.set(chunk, position);
        position += chunk.length;
      }

      // Convert binary data to base64 for display in browser
      const base64Image = Buffer.from(combinedChunks).toString('base64');
      const dataUrl = `data:image/png;base64,${base64Image}`;

      console.log('Converted binary image to base64 data URL');
      return NextResponse.json({ image_url: dataUrl, status: 'completed' });
    }

    // Fallback if not a stream
    return NextResponse.json({
      image_url: Array.isArray(output) ? output[0] : output,
      status: 'completed',
    });
  } catch (error) {
    console.error('Replicate error:', error);
    return NextResponse.json(
      { error: 'Image generation failed.' },
      { status: 500 }
    );
  }
}
