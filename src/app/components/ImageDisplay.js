'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Share2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Share image to community
async function shareToCommmunity({ image, prompt, title }) {
  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'image',
        title:
          title || prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        prompt,
        content: image,
        username: `artist_${Math.floor(Math.random() * 10000)}`, // Random username for now
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error sharing to community');
    }

    return data;
  } catch (error) {
    console.error('Share error:', error);
    throw error;
  }
}

export default function ImageDisplay({
  image,
  prompt,
  isLoading,
  error,
  onImageError,
}) {
  const [shareTitle, setShareTitle] = useState('');
  const [showShareForm, setShowShareForm] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Get the query client for cache invalidation
  const queryClient = useQueryClient();

  // Check if the image data is a base64 string
  const isBase64 =
    image && typeof image === 'string' && image.startsWith('data:');

  // Reset image load error when new image arrives
  useEffect(() => {
    if (image) {
      setImageLoadError(false);
    }
  }, [image]);

  // Enhanced image error handler
  const handleImageError = () => {
    console.error(
      'Image failed to load:',
      image ? image.substring(0, 100) : 'undefined'
    );
    setImageLoadError(true);
    if (onImageError) {
      onImageError();
    }
  };

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: shareToCommmunity,
    onSuccess: () => {
      setShowShareForm(false);
      setShareTitle('');

      // Invalidate the community query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });

  const handleDownload = () => {
    if (!image) return;

    const link = document.createElement('a');
    link.href = image;
    link.download = 'unlimited-ai-creation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    setShowShareForm(true);
  };

  const submitShare = (e) => {
    e.preventDefault();
    shareMutation.mutate({
      image,
      prompt: prompt || 'No prompt provided',
      title: shareTitle,
    });
  };

  return (
    <div className='min-h-[300px] relative z-10'>
      {isLoading ? (
        <div className='text-center p-8'>
          <div className='inline-block p-6 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 mb-4 relative'>
            <div className='absolute inset-0 rounded-full border-t-2 border-pink-500 animate-spin'></div>
            <Loader2 className='h-8 w-8 text-pink-400' />
          </div>
          <p className='text-white font-medium'>Creating Your Vision</p>
          <p className='text-xs text-pink-300/70 mt-2'>
            Synthesizing neon dreams...
          </p>
        </div>
      ) : error || imageLoadError ? (
        <div className='rounded-md bg-pink-900/20 border border-pink-900 p-4 text-pink-100'>
          <p>
            {error ||
              'The image failed to load. Please try a different prompt or model.'}
          </p>
          {imageLoadError && (
            <p className='mt-2 text-xs'>
              Some models may be temporarily unavailable. If this model fails
              repeatedly, try Flux Schnell which is the most reliable option.
            </p>
          )}
        </div>
      ) : image ? (
        <div className='space-y-4'>
          <div className='rounded-lg overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.1)]'>
            {isBase64 ? (
              // Handle base64 image data directly
              <img
                src={image}
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
                  src={image}
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

          {/* Share form modal - Now after the image */}
          {showShareForm && (
            <div className='mb-4 p-4 bg-black/50 backdrop-blur-md rounded-lg border border-pink-500/30'>
              <h3 className='text-lg font-medium mb-2 text-white'>
                Share to Community
              </h3>
              <form onSubmit={submitShare} className='space-y-3'>
                <div>
                  <label className='text-xs text-white/70 mb-1 block'>
                    Title for your creation
                  </label>
                  <input
                    type='text'
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder='Give your creation a title'
                    className='w-full p-2 bg-black/50 border border-white/20 rounded text-white text-sm'
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowShareForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    size='sm'
                    disabled={shareMutation.isPending}>
                    {shareMutation.isPending ? 'Sharing...' : 'Confirm Share'}
                  </Button>
                </div>
                {shareMutation.isError && (
                  <p className='text-pink-500 text-xs'>
                    {shareMutation.error.message}
                  </p>
                )}
                {shareMutation.isSuccess && (
                  <p className='text-green-500 text-xs'>
                    Successfully shared to community!
                  </p>
                )}
              </form>
            </div>
          )}

          <div className='flex gap-2 justify-end'>
            <Button variant='outline' size='sm' onClick={handleDownload}>
              <Download className='h-4 w-4 mr-1' />
              Download
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleShare}
              disabled={shareMutation.isPending}>
              <Share2 className='h-4 w-4 mr-1' />
              Share
            </Button>
          </div>
        </div>
      ) : (
        <div className='text-center p-8'>
          <div className='inline-block p-6 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 mb-4 mt-10'>
            <ImageIcon className='h-8 w-8 text-pink-400' />
          </div>
          <p className='text-white font-medium'>Your Creation Awaits</p>
          <p className='text-xs text-pink-300/70 mt-2'>
            Enter a prompt to begin
          </p>
        </div>
      )}
    </div>
  );
}
