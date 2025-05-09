'use client';
import { Dialog, DialogContent } from '@/app/components/ui/dialog';
import Image from 'next/image';
import { Heart, X } from 'lucide-react';
import { Button } from './ui/button';

export default function ImageModal({
  isOpen,
  onClose,
  item,
  onLike,
  hasLiked,
}) {
  if (!item) return null;

  // Handle like button click
  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLike(item.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl w-[90vw] p-0 bg-black/90 border-pink-500/20 overflow-hidden'>
        <div className='relative'>
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 bg-black/50 p-2 rounded-full z-10'>
            <X className='h-5 w-5 text-white' />
          </button>

          {/* Image display */}
          <div className='relative w-full h-[80vh]'>
            <Image
              src={item.content}
              alt={item.title}
              fill
              className='object-contain'
              priority
            />
          </div>

          {/* Image info */}
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6'>
            <h2 className='text-xl font-bold text-white mb-1'>{item.title}</h2>
            <p className='text-sm text-white/70 mb-2'>{item.prompt}</p>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-white/60'>by @{item.username}</span>
              <button
                onClick={handleLike}
                className='flex items-center gap-2 hover:scale-105 transition'>
                <Heart
                  className={`h-5 w-5 ${
                    hasLiked ? 'text-pink-500' : 'text-white/70'
                  }`}
                  fill={hasLiked ? '#ec4899' : 'none'}
                />
                <span className='text-white'>{item.likes || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
