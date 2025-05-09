'use client';
import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const communityItems = [
  {
    type: 'text',
    title: 'Neon City Sunset',
    author: 'retrowave',
    likes: 423,
    id: 1,
  },
  {
    type: 'text',
    title:
      'The year was 2099. The neon lights of Neo-Miami illuminated the rain-slicked streets...',
    author: 'cyberpunk_writer',
    likes: 189,
    id: 2,
  },
  {
    type: 'text',
    title: 'Digital Dreams',
    author: 'vaporwave',
    likes: 312,
    id: 3,
  },
  {
    type: 'text',
    title:
      'She walked through the holographic doorway, her silhouette cutting through the pink and blue light...',
    author: 'neon_novelist',
    likes: 276,
    id: 4,
  },
  {
    type: 'text',
    title: 'Retro Arcade',
    author: 'pixel_master',
    likes: 501,
    id: 5,
  },
  {
    type: 'text',
    title: 'Synthwave Horizon',
    author: 'outrun_artist',
    likes: 348,
    id: 6,
  },
];
// Community Item Component
const CommunityItem = ({ type = 'image', title, author, likes, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className='group relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10 hover:border-pink-500/50 transition-all duration-300'>
      {type === 'image' ? (
        <div className='aspect-square'>
          <img
            src={`https://via.placeholder.com/300x300/1a1a1a/ffffff?text=${title}`}
            alt={title}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
          />
        </div>
      ) : (
        <div className='aspect-square p-4 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-pink-900/40'>
          <p className='text-white/80 text-sm line-clamp-6 text-center italic'>
            &ldquo;{title}&rdquo;
          </p>
        </div>
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3'>
        <p className='text-white font-medium text-sm'>{title}</p>
        <div className='flex justify-between items-center mt-1'>
          <p className='text-white/70 text-xs'>@{author}</p>
          <div className='flex items-center gap-1'>
            <Heart className='h-3 w-3 text-pink-500' fill='#ec4899' />
            <span className='text-white/70 text-xs'>{likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunitySection() {
  return (
    <div className='mt-24'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300'>
          Community Creations
        </h2>
        <p className='text-white/70 max-w-2xl mx-auto'>
          Explore what others have created with our AI. Get inspired and share
          your own creations with the community.
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
        {communityItems.map((item, index) => (
          <CommunityItem
            key={item.id}
            type={item.type}
            title={item.title}
            author={item.author}
            likes={item.likes}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
