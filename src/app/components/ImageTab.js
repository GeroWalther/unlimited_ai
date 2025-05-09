'use client';
import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import ImageDisplay from './ImageDisplay';
import { useMutation } from '@tanstack/react-query';

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

export default function ImageTab() {
  const [imageError, setImageError] = useState(false);
  const [prompt, setPrompt] = useState('');

  // Image generation mutation
  const imageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: (data) => {
      console.log('Generated image data received');
      setImageError(false);
    },
    onError: (error) => {
      console.error('Image mutation error:', error);
    },
  });

  // Handle image generation
  function handleGenerateImage(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    imageMutation.mutate(prompt);
  }

  // Handle image error
  const handleImageError = () => {
    console.error('Image failed to load');
    setImageError(true);
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      {/* Image Input Form */}
      <div className='bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.15)] relative overflow-hidden'>
        <div className='absolute -top-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl'></div>

        <h2 className='text-xl font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 relative z-10'>
          Describe Your Vision
        </h2>

        <div className='space-y-4 relative z-10'>
          <form onSubmit={handleGenerateImage} className='space-y-4'>
            <div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Describe the image you want to generate in detail...'
                className='min-h-[200px] md:min-h-[300px] resize-none'
              />
            </div>

            <Button
              type='submit'
              disabled={imageMutation.isPending || !prompt.trim()}
              className='w-full'>
              {imageMutation.isPending ? (
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
        </div>
      </div>

      {/* Image Output Display */}
      <div className='bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.15)] h-full relative overflow-hidden'>
        <div className='absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl'></div>

        <h2 className='text-xl font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 relative z-10'>
          Your Creation
        </h2>

        <ImageDisplay
          image={imageMutation.data}
          isLoading={imageMutation.isPending}
          error={imageMutation.error?.message}
          onImageError={handleImageError}
        />
      </div>
    </div>
  );
}
