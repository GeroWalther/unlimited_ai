import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useState } from 'react';

/**
 * Generates an image using the Replicate API.
 * @param prompt - The text prompt for image generation.
 * @returns The output from the Replicate model (usually an image URL or base64 data).
 */
export async function generateImage(prompt) {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  console.log('API response type:', typeof data.image_url);

  if (!res.ok) {
    throw new Error(data.error || 'Unknown error');
  }

  // Validate that we have a valid image data
  if (!data.image_url) {
    throw new Error('No image data returned from the API');
  }

  return data.image_url;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageError, setImageError] = useState(false);

  const mutation = useMutation({
    mutationFn: generateImage,
    onSuccess: (data) => {
      console.log('Generated image data received');
      setImageError(false);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate(prompt);
  }

  // Handle image load error
  const handleImageError = () => {
    console.error('Image failed to load');
    setImageError(true);
  };

  // Check if the image data is a base64 string
  const isBase64 = mutation.data && mutation.data.startsWith('data:');

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Enter your prompt'
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <button type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {mutation.error && (
        <p style={{ color: 'red' }}>{mutation.error.message}</p>
      )}

      {imageError && (
        <p style={{ color: 'red' }}>
          The image could not be loaded. It may have been filtered due to
          content.
        </p>
      )}

      {mutation.data && !imageError && (
        <div>
          <h2>Result:</h2>
          {isBase64 ? (
            // Handle base64 image data directly
            <img
              src={mutation.data}
              alt='Generated'
              style={{ maxWidth: '100%' }}
              width={600}
              height={600}
              onError={handleImageError}
            />
          ) : (
            // Handle regular URLs with Next.js Image component
            <Image
              src={mutation.data}
              alt='Generated'
              style={{ maxWidth: '100%' }}
              width={600}
              height={600}
              onError={handleImageError}
            />
          )}
        </div>
      )}
    </div>
  );
}
