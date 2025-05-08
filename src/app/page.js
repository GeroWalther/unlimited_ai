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
  Heart,
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { useMobile } from './hooks/use-mobile';
import { motion } from 'framer-motion';
import ImageDisplay from './components/ImageDisplay';
import { useMutation } from '@tanstack/react-query';

// Animated Header Component
const AnimatedHeader = () => {
  return (
    <section className='w-full py-12 md:py-24 lg:py-32 relative overflow-hidden flex justify-center items-center'>
      <div className='container max-w-4xl mx-auto flex justify-center items-center'>
        <h1 className='flex flex-col items-center justify-center font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-center w-full'>
          <motion.span
            className='gradient-text gradient-1'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}>
            Create.
          </motion.span>
          <motion.span
            className='gradient-text gradient-2'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              type: 'spring',
              stiffness: 50,
            }}>
            Imagine.
          </motion.span>
          <motion.span
            className='gradient-text gradient-3'
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.4,
              type: 'spring',
              stiffness: 50,
            }}>
            Inspire.
          </motion.span>
        </h1>
      </div>
    </section>
  );
};

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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('image');
  const [textPrompt, setTextPrompt] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageError, setImageError] = useState(false);
  const isMobile = useMobile();

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

  const handleGenerateText = async (e) => {
    e.preventDefault();
    if (!textPrompt.trim()) return;

    setIsGeneratingText(true);
    setGeneratedText('');

    // Simulate API call with timeout
    setTimeout(() => {
      setGeneratedText(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.'
      );
      setIsGeneratingText(false);
    }, 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Text copied to clipboard!');
  };

  const handleShare = () => {
    alert('Shared to community!');
  };

  // Community content
  const communityItems = [
    {
      type: 'image',
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
      type: 'image',
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
      type: 'image',
      title: 'Retro Arcade',
      author: 'pixel_master',
      likes: 501,
      id: 5,
    },
    {
      type: 'image',
      title: 'Synthwave Horizon',
      author: 'outrun_artist',
      likes: 348,
      id: 6,
    },
  ];

  return (
    <main className='min-h-screen bg-black text-white overflow-hidden'>
      {/* Background elements */}
      <div className='fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0'></div>
      <div className='fixed inset-0 bg-grid-pattern opacity-30 z-0'></div>

      <div className='relative z-10 flex flex-col items-center'>
        {/* Animated Header */}
        <AnimatedHeader />

        <div className='container max-w-7xl mx-auto px-4 pb-20'>
          {/* Main Tabs */}
          <div className='mb-12'>
            <Tabs
              defaultValue='image'
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'>
              <div className='flex justify-center mb-8'>
                <TabsList className='grid grid-cols-2 w-full max-w-md bg-black/70 p-1.5 border border-purple-900/30 shadow-[0_0_20px_rgba(128,90,213,0.3)]'>
                  <TabsTrigger
                    value='image'
                    className={
                      activeTab === 'image'
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                        : ''
                    }>
                    <ImageIcon className='h-4 w-4 mr-2' />
                    Image Generation
                  </TabsTrigger>
                  <TabsTrigger value='text'>
                    <MessageSquare className='h-4 w-4 mr-2' />
                    Text Creation
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Image Tab Content */}
              <TabsContent value='image'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Image Input Form */}
                  <div className='bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.15)] relative overflow-hidden'>
                    <div className='absolute -top-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl'></div>
                    <div className='absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl'></div>

                    <h2 className='text-xl font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 relative z-10'>
                      Describe Your Vision
                    </h2>

                    <div className='space-y-4 relative z-10'>
                      <form
                        onSubmit={handleGenerateImage}
                        className='space-y-4'>
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
                              {activeTab === 'image'
                                ? 'Generate Image'
                                : 'Generate Story'}
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
              </TabsContent>

              {/* Text Tab Content */}
              <TabsContent value='text'>
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
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={handleShare}>
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
                          <div className='w-24 h-24 rounded-full bg-purple-900/50 flex items-center justify-center mb-4'>
                            <MessageSquare className='h-10 w-10 text-pink-500' />
                          </div>
                          <h3 className='text-xl font-semibold text-white mb-2'>
                            Your Creation Awaits
                          </h3>
                          <p className='text-pink-400/80 text-sm'>
                            Enter a prompt to begin
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Community Section */}
          <div className='mt-24'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300'>
                Community Creations
              </h2>
              <p className='text-white/70 max-w-2xl mx-auto'>
                Explore what others have created with our AI. Get inspired and
                share your own creations with the community.
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
        </div>
      </div>
    </main>
  );
}

// Import the generateImage function directly
async function generateImage(prompt) {
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Unknown error');
    }

    if (!data.image_url) {
      throw new Error('No image data returned from the API');
    }

    return data.image_url;
  } catch (error) {
    console.error('Generate image error:', error);
    throw error;
  }
}
