'use client';
import { useState } from 'react';
import {
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';

import ImageTab from './ImageTab';
import TextTab from './TextTab';

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState('image');

  return (
    <div className='mb-12'>
      <div className='w-full'>
        <div className='flex justify-center mb-8'>
          <div className='grid grid-cols-2 w-full max-w-md bg-black/70 p-1.5 border border-purple-900/30 shadow-[0_0_20px_rgba(128,90,213,0.3)] rounded-full'>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                  : 'text-white/70 hover:text-white'
              }`}>
              <ImageIcon className='h-4 w-4 mr-2' />
              Image Generation
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-300 ${
                activeTab === 'text'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                  : 'text-white/70 hover:text-white'
              }`}>
              <MessageSquare className='h-4 w-4 mr-2' />
              Text Creation
            </button>
          </div>
        </div>

        {/* Image Tab Content */}
        {activeTab === 'image' && <ImageTab />}

        {/* Text Tab Content */}
        {activeTab === 'text' && <TextTab />}
      </div>
    </div>
  );
}
