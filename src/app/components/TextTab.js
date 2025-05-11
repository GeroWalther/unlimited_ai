import {
  Copy,
  Loader2,
  MessageSquare,
  Share2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export default function TextTab() {
  const [textPrompt, setTextPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-sonnet');
  const [outputLanguage, setOutputLanguage] = useState('english');
  const [storyType, setStoryType] = useState('any');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(300);

  // Models available for text generation
  const AVAILABLE_MODELS = [
    {
      id: 'claude-sonnet',
      name: 'Claude 3.5 Sonnet',
      description:
        'Most powerful model for creative writing with multilingual support',
      apiPath: 'anthropic/claude-3.5-sonnet',
    },
  ];

  // Languages supported for text generation
  const LANGUAGES = [
    { id: 'english', name: 'English' },
    { id: 'japanese', name: 'Japanese' },
    { id: 'german', name: 'German' },
    { id: 'spanish', name: 'Spanish' },
  ];

  // Story types
  const STORY_TYPES = [
    {
      id: 'any',
      name: 'Any Style',
      description: 'Generate content based solely on your prompt',
    },
    {
      id: 'romance',
      name: 'Romance',
      description: 'Emotional and tender stories focused on relationships',
    },
    {
      id: 'erotic',
      name: 'Spicy',
      description: 'Sensual stories with explicit adult content (NSFW)',
      restrictedModels: ['claude-sonnet'],
    },
    {
      id: 'funny',
      name: 'Comedy',
      description: 'Humorous and entertaining narratives',
    },
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'Action-packed stories with exciting plots',
    },
    {
      id: 'scifi',
      name: 'Sci-Fi',
      description: 'Futuristic tales with technology and space themes',
    },
  ];

  // Reset story type if selected model doesn't support it
  useEffect(() => {
    const currentType = STORY_TYPES.find((type) => type.id === storyType);
    if (currentType?.restrictedModels?.includes(selectedModel)) {
      setStoryType('any'); // Reset to default story type
    }
  }, [selectedModel, storyType]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Text copied to clipboard!');
  };

  const handleShare = () => {
    alert('Shared to community!');
  };

  const handleGenerateText = async (e) => {
    e.preventDefault();
    if (!textPrompt.trim()) return;

    setIsGeneratingText(true);
    setGeneratedText('');

    try {
      // No longer need to construct the full prompt here - backend will handle it
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          textPrompt: textPrompt, // Just send the raw user prompt
          temperature: temperature,
          maxTokens: maxTokens,
          outputLanguage: outputLanguage,
          storyType: storyType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate text');
      }

      setGeneratedText(data.text);
      setIsGeneratingText(false);
    } catch (error) {
      console.error('Error generating text:', error);
      setIsGeneratingText(false);

      setGeneratedText(
        `Sorry, there was an error generating your story: ${
          error.message || 'Unknown error'
        }. Please try again or select a different model.`
      );
    }
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      {/* Text Input Form */}
      <div className='bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.15)] relative overflow-hidden'>
        <div className='absolute -top-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl'></div>

        <h2 className='text-xl font-medium mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 relative z-10'>
          Create Your Story
        </h2>

        {/* Story type banner */}
        {storyType === 'erotic' && (
          <div className='bg-pink-900/30 border border-pink-500/30 rounded-md p-3 mb-4 text-sm text-white/90'>
            <p>For NSFW supported.</p>
            <p className='mt-1 text-xs text-white/80'>
              Content is generated with refined, literary quality similar to
              published novels.
            </p>
          </div>
        )}

        <form onSubmit={handleGenerateText} className='space-y-5 relative z-10'>
          {/* Model Selection */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='text-sm text-white/70 block'>AI Model</label>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className='w-full p-2 rounded-md bg-black/50 border border-pink-500/20 text-white'>
              {AVAILABLE_MODELS.map((model) => (
                <option
                  key={model.id}
                  value={model.id}
                  disabled={model.unavailable}>
                  {model.name}
                </option>
              ))}
            </select>
            <p className='text-xs text-white/50'>
              {AVAILABLE_MODELS.find((m) => m.id === selectedModel)
                ?.description || 'Select a model for text generation'}
            </p>
          </div>

          {/* Story Type Selection */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='text-sm text-white/70 block'>Story Type</label>
            </div>
            <select
              value={storyType}
              onChange={(e) => setStoryType(e.target.value)}
              className='w-full p-2 rounded-md bg-black/50 border border-pink-500/20 text-white'>
              {STORY_TYPES.filter(
                (type) => !type.restrictedModels?.includes(selectedModel)
              ).map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <p className='text-xs text-white/50'>
              {STORY_TYPES.find((t) => t.id === storyType)?.description ||
                'Select the type of story you want to generate'}
            </p>
          </div>

          {/* Output Language Selection */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label className='text-sm text-white/70 block'>
                Output Language
              </label>
            </div>
            <select
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value)}
              className='w-full p-2 rounded-md bg-black/50 border border-pink-500/20 text-white'>
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
            <p className='text-xs text-white/50'>
              Language of the generated story (you can write your prompt in any
              language)
            </p>
          </div>

          {/* Main text input */}
          <div className='space-y-2'>
            <Textarea
              placeholder='Describe your story idea... (e.g. "A chance meeting between two strangers on a rainy night in Tokyo")'
              className='min-h-[200px] md:min-h-[240px] resize-none'
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
            />
          </div>

          {/* Toggle advanced options */}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setShowAdvanced(!showAdvanced)}
            className='w-full flex items-center justify-center gap-2'>
            <Sliders className='h-4 w-4' />
            Advanced Options
            {showAdvanced ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>

          {/* Advanced options panel */}
          {showAdvanced && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white/10 rounded-md p-4 bg-black/30'>
              {/* Temperature setting */}
              <div>
                <label className='text-sm text-white/70 block mb-1'>
                  Temperature ({temperature})
                </label>
                <input
                  type='range'
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  className='w-full'
                />
                <p className='text-xs text-white/50'>
                  Higher = more creative, lower = more predictable
                </p>
              </div>

              {/* Max tokens setting */}
              <div>
                <label className='text-sm text-white/70 block mb-1'>
                  Length ({maxTokens})
                </label>
                <input
                  type='range'
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  min={200}
                  max={2000}
                  step={100}
                  className='w-full'
                />
                <p className='text-xs text-white/50'>
                  Word count of generated text (stories will complete properly
                  within this limit)
                </p>
              </div>
            </div>
          )}

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
                Generate Story
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
            Your Story
          </h2>
          {generatedText && !isGeneratingText && (
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={handleCopyText}>
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

        <div className='min-h-[300px] max-h-[600px] overflow-y-auto relative z-10'>
          {isGeneratingText ? (
            <div className='h-full flex flex-col items-center justify-center text-white/60'>
              <Loader2 className='h-8 w-8 animate-spin mb-4' />
              <p>Creating your story...</p>
            </div>
          ) : generatedText ? (
            <div className='bg-black/30 rounded-md p-4 text-white/90 text-sm min-h-full'>
              <p className='leading-relaxed whitespace-pre-line'>
                {generatedText}
              </p>
            </div>
          ) : (
            <div className='h-full flex flex-col items-center justify-center'>
              <div className='text-center p-8 mt-10'>
                <div className='inline-block p-6 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 mb-4'>
                  <MessageSquare className='h-8 w-8 text-pink-400' />
                </div>
                <p className='text-white font-medium'>Your Story Awaits</p>
                <p className='text-xs text-pink-300/70 mt-2'>
                  Enter a scenario to begin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
