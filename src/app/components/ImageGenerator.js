import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Share2,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

/**
 * Generates an image using the Replicate API.
 * @param prompt - The text prompt for image generation.
 * @returns The output from the Replicate model (usually an image URL or base64 data).
 */
export async function generateImage(prompt) {
  try {
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
  } catch (error) {
    console.error('Generate image error:', error);
    throw error;
  }
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
    <div className='space-y-4 relative z-10'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Describe the image you want to generate in detail...'
            className='min-h-[120px] resize-none'
          />
        </div>

        <Button
          type='submit'
          disabled={mutation.isPending || !prompt.trim()}
          className='w-full'>
          {mutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className='mr-2 h-4 w-4' />
              Generate Image
            </>
          )}
        </Button>
      </form>

      {mutation.error && (
        <div className='rounded-md bg-pink-900/20 border border-pink-900 p-4 text-pink-100'>
          <p>{mutation.error.message}</p>
        </div>
      )}

      {imageError && (
        <div className='rounded-md bg-pink-900/20 border border-pink-900 p-4 text-pink-100'>
          <p>
            The image could not be loaded. It may have been filtered due to
            content.
          </p>
        </div>
      )}

      {mutation.data && !imageError && (
        <div className='space-y-4'>
          <h3 className='text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300'>
            Generated Image
          </h3>

          <div className='rounded-lg overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.1)]'>
            {isBase64 ? (
              // Handle base64 image data directly
              <img
                src={mutation.data}
                alt='Generated'
                style={{ maxWidth: '100%', display: 'block' }}
                width={600}
                height={600}
                onError={handleImageError}
              />
            ) : (
              // Handle regular URLs with Next.js Image component
              <div className='relative w-full aspect-square'>
                <Image
                  src={mutation.data}
                  alt='Generated'
                  fill
                  sizes='(max-width: 768px) 100vw, 600px'
                  priority
                  className='object-cover'
                  onError={handleImageError}
                />
              </div>
            )}
          </div>

          <div className='flex gap-2 justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                // Download image logic
                const link = document.createElement('a');
                link.href = mutation.data;
                link.download = 'unlimited-ai-creation.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}>
              <Download className='h-4 w-4 mr-1' />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
