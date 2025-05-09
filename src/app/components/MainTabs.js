'use client';
import { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Share2,
  Image as ImageIcon,
  MessageSquare,
  Loader2,
} from 'lucide-react';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import ImageTab from './ImageTab';

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
        {activeTab === 'text' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Text Input Form */}
            <div className='bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.15)] relative overflow-hidden'>
              <div className='absolute -top-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl'></div>
              <div className='absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl'></div>

              <h2 className='text-xl font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 relative z-10'>
                Describe Your Idea
              </h2>

              <form
                onSubmit={handleGenerateText}
                className='space-y-5 relative z-10'>
                <div className='space-y-2'>
                  <Textarea
                    placeholder='Write a short story about a detective in a neon-lit cyberpunk city...'
                    className='min-h-[200px] resize-none bg-black/50 border-pink-900/50 focus:border-pink-500 text-white'
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full'
                  disabled={isGeneratingText || !textPrompt.trim()}>
                  {isGeneratingText ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className='mr-2 h-4 w-4' />
                      Generate Text
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Text Output Display */}
            <div className='bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.15)] h-full relative overflow-hidden'>
              <div className='absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl'></div>
              <div className='absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl'></div>

              <div className='flex justify-between items-center mb-4 relative z-10'>
                <h2 className='text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300'>
                  Your Creation
                </h2>
                {generatedText && !isGeneratingText && (
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCopyText}>
                      <Copy className='h-4 w-4 mr-1' />
                      Copy
                    </Button>
                    <Button variant='outline' size='sm' onClick={handleShare}>
                      <Share2 className='h-4 w-4 mr-1' />
                      Share
                    </Button>
                  </div>
                )}
              </div>

              <div className='min-h-[300px] relative z-10'>
                {isGeneratingText ? (
                  <div className='h-full flex flex-col items-center justify-center text-white/60'>
                    <Loader2 className='h-8 w-8 animate-spin mb-4' />
                    <p>Creating your masterpiece...</p>
                  </div>
                ) : generatedText ? (
                  <div className='bg-black/30 rounded-md p-4 text-white/90 text-sm'>
                    <p className='leading-relaxed'>{generatedText}</p>
                  </div>
                ) : (
                  <div className='h-full flex flex-col items-center justify-center'>
                    <div className='text-center p-8 mt-10'>
                      <div className='inline-block p-6 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 mb-4'>
                        <MessageSquare className='h-8 w-8 text-pink-400' />
                      </div>
                      <p className='text-white font-medium'>
                        Your Creation Awaits
                      </p>
                      <p className='text-xs text-pink-300/70 mt-2'>
                        Enter a prompt to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
