'use client';

import Image from 'next/image';
import { Download, Share2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

export default function ImageDisplay({
  image,
  isLoading,
  error,
  onImageError,
}) {
  // Check if the image data is a base64 string
  const isBase64 = image && image.startsWith('data:');

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
    alert('Shared to community!');
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
      ) : error ? (
        <div className='rounded-md bg-pink-900/20 border border-pink-900 p-4 text-pink-100'>
          <p>{error}</p>
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
                onError={onImageError}
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
                  onError={onImageError}
                />
              </div>
            )}
          </div>

          <div className='flex gap-2 justify-end'>
            <Button variant='outline' size='sm' onClick={handleDownload}>
              <Download className='h-4 w-4 mr-1' />
              Download
            </Button>
            <Button variant='outline' size='sm' onClick={handleShare}>
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
