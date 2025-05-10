'use client';
import React, { useState, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import {
  Loader2,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Eye,
  Info,
} from 'lucide-react';
import ImageDisplay from './ImageDisplay';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
// import { Switch } from './ui/switch';
import { MODEL_CONFIGS } from '@/lib/replicate';
/**
 * Generates an image using the Replicate API.
 * @param params - Object containing prompt and generation options.
 * @returns The output from the Replicate model (usually an image URL or base64 data).
 */
export async function generateImage(params) {
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    console.log('API response type:', typeof data.image_url);

    if (!res.ok) {
      // Check for model-specific errors
      if (res.status === 404 && data.modelName) {
        throw new Error(
          `Model "${data.modelName}" not found. Please try Flux Schnell instead.`
        );
      } else if (res.status === 422 && data.modelName) {
        if (
          data.error &&
          (data.error.includes('NSFW content') ||
            data.error.includes('flagged as sensitive'))
        ) {
          // NSFW content detection error
          throw new Error(
            `"${data.modelName}" detected too sensitive prompt for this innocent AI model. 1) Use Babes-XL model for more NSFW content 2) Avoid explicit terms NSFW content with this model`
          );
        } else {
          // Standard parameter error
          throw new Error(
            `Invalid parameters for model "${data.modelName}". Try Flux Schnell which handles NSFW content reliably.`
          );
        }
      }
      // Generic error
      throw new Error(data.error || 'Unknown error');
    }

    // Validate that we have a valid image data
    if (!data.image_url) {
      throw new Error(
        'No image data returned. Please select FLUX Schnell which is guaranteed to work.'
      );
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
  const [negativePrompt, setNegativePrompt] = useState(
    'ugly, deformed, disfigured, blurry, bad anatomy, bad hands, cropped, low quality'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Comment out NSFW mode - app is entirely NSFW
  // const [nsfwMode, setNsfwMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [width, setWidth] = useState(768);
  const [height, setHeight] = useState(1024);

  const defaultModelKey = 'black-forest-labs/flux-schnell';
  const defaultConfig = MODEL_CONFIGS[defaultModelKey];

  const [steps, setSteps] = useState(defaultConfig?.defaultSteps || 4);
  const [guidance, setGuidance] = useState(
    defaultConfig?.defaultGuidance || 7.5
  );
  // Remove style options for Recraft
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  // Helper function to get the full model name based on the selected model ID
  const getModelConfigKey = (modelId) => {
    switch (modelId) {
      case 'flux-schnell':
        return 'black-forest-labs/flux-schnell';
      case 'sticker-maker':
        return 'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a';
      case 'proteus':
        return 'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48';
      case 'babes-xl':
        return 'asiryan/babes-sdxl:a07fcbe80652ccf989e8198654740d7d562de85f573196dd624a8a80285da27d';
      case 'minimax':
        return 'minimax/image-01';
      default:
        return 'black-forest-labs/flux-schnell';
    }
  };

  // Update steps and guidance based on model selection
  useEffect(() => {
    const modelConfigKey = getModelConfigKey(selectedModel);
    const config = MODEL_CONFIGS[modelConfigKey];

    if (config) {
      console.log(
        `Updating UI for model: ${selectedModel} (${modelConfigKey})`
      );
      console.log(
        `Setting steps to ${config.defaultSteps}, guidance to ${config.defaultGuidance}`
      );
      setSteps(config.defaultSteps);
      setGuidance(config.defaultGuidance);
    } else {
      console.warn(
        `No config found for model: ${selectedModel} (${modelConfigKey})`
      );
    }

    // We don't need to show style selector anymore since Recraft is removed
    setShowStyleSelector(false);
  }, [selectedModel]);

  // Image generation mutation
  const imageMutation = useMutation({
    mutationFn: (params) => generateImage(params),
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

    // Add style parameter for specific models
    const params = {
      prompt,
      model: selectedModel,
      width,
      height,
      steps,
      guidance,
      negativePrompt,
      allowNsfw: true, // Always allow NSFW content
    };

    imageMutation.mutate(params);
  }

  // Comment out NSFW toggle handler - no longer needed
  /*
  const handleNsfwToggle = (checked) => {
    setNsfwMode(checked);
  };
  */

  // Handle image error
  const handleImageError = () => {
    console.error('Image failed to load');
    setImageError(true);
  };

  // Helper to handle numeric input changes
  const handleNumberChange = (setter) => (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setter(value);
    }
  };

  // Define all available models with NSFW-friendly descriptions
  const AVAILABLE_MODELS = [
    {
      id: 'flux-schnell',
      name: 'FLUX Schnell',
      description:
        'Ultra-fast generation (1-2s) with decent quality - reliable for NSFW content',
    },
    {
      id: 'minimax',
      name: 'MiniMax',
      description:
        'Beautiful photorealistic images with excellent detail and prompt understanding',
    },
    {
      id: 'babes-xl',
      name: 'Babes-XL',
      description:
        'High-quality photorealistic NSFW model with excellent figure details and lighting',
    },
    {
      id: 'proteus',
      name: 'Proteus v0.3 (Anime)',
      description:
        'Specialized in anime art with enhanced lighting - use 30+ steps for best quality',
    },
    {
      id: 'sticker-maker',
      name: 'Sticker Maker',
      description:
        'Creates graphics with transparent backgrounds - perfect for stickers and icons',
    },
  ];

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      {/* Image Input Form */}
      <div className='bg-black/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-[0_0_15px_rgba(236,72,153,0.15)] relative overflow-hidden'>
        <div className='absolute -top-24 -right-24 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl'></div>

        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 relative z-10'>
            Describe Your Vision
          </h2>

          {/* NSFW Mode Toggle - commented out as app is entirely NSFW
          <div className='flex items-center space-x-2 z-10'>
            <span className='text-sm text-white/70'>
              {nsfwMode ? (
                <span className='flex items-center text-pink-400'>
                  <EyeOff className='h-3 w-3 mr-1' />
                  NSFW
                </span>
              ) : (
                <span className='flex items-center text-green-400'>
                  <Eye className='h-3 w-3 mr-1' />
                  SFW
                </span>
              )}
            </span>
            <Switch
              checked={nsfwMode}
              onCheckedChange={handleNsfwToggle}
              className={nsfwMode ? 'bg-pink-600' : 'bg-green-600'}
            />
          </div>
          */}
        </div>

        {/* User guidelines */}
        <div className='bg-pink-900/30 border border-pink-500/30 rounded-md p-3 mb-4 text-sm text-white/90'>
          <p>
            NSFW content is fully supported.{' '}
            <Link
              href='/artistic-guidelines'
              className='mt-1 inline-block text-pink-400 hover:text-pink-300 underline'>
              Read our guidelines →
            </Link>
          </p>
        </div>

        <div className='space-y-4 relative z-10'>
          <form onSubmit={handleGenerateImage} className='space-y-4'>
            {/* Main prompt input */}
            <div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Describe your image in detail...'
                className='min-h-[180px] resize-none'
              />
            </div>

            {/* Model Selection */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm text-white/70 block'>Model</label>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className='w-full p-2 rounded-md bg-black/50 border border-pink-500/20 text-white'>
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className='text-xs text-white/50'>
                {AVAILABLE_MODELS.find((m) => m.id === selectedModel)
                  ?.description || 'Select a model for image generation'}
              </p>
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
                {/* Negative prompt */}
                <div className='sm:col-span-2'>
                  <label className='text-sm text-white/70 block mb-1'>
                    Negative Prompt
                  </label>
                  <Textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder='What to avoid in the generated image...'
                    className='min-h-[80px] resize-none'
                  />
                  <p className='text-xs text-white/50 mt-1'>
                    Negative prompts tell the AI what NOT to include in your
                    image. Separate terms with commas.
                  </p>
                </div>

                {/* Image dimensions */}
                <div>
                  <label className='text-sm text-white/70 block mb-1'>
                    Width
                  </label>
                  <input
                    type='number'
                    value={width}
                    onChange={handleNumberChange(setWidth)}
                    min={256}
                    max={1024}
                    step={64}
                    className='w-full p-2 rounded-md bg-black/50 border border-pink-500/20 text-white'
                  />
                </div>

                <div>
                  <label className='text-sm text-white/70 block mb-1'>
                    Height
                  </label>
                  <input
                    type='number'
                    value={height}
                    onChange={handleNumberChange(setHeight)}
                    min={256}
                    max={1024}
                    step={64}
                    className='w-full p-2 rounded-md bg-black/50 border border-pink-500/20 text-white'
                  />
                </div>

                {/* Generation parameters */}
                <div>
                  <label className='text-sm text-white/70 block mb-1'>
                    Steps ({steps})
                  </label>
                  {/* Debug info
                  {process.env.NODE_ENV === 'development' && (
                    <div className='text-xs text-pink-400 mb-1'>
                      Model: {selectedModel}, Config Key:{' '}
                      {getModelConfigKey(selectedModel)}, Max Steps:{' '}
                      {MODEL_CONFIGS[getModelConfigKey(selectedModel)]
                        ?.maxSteps || 'not found'}
                    </div>
                  )} */}
                  <input
                    type='range'
                    value={steps}
                    onChange={handleNumberChange(setSteps)}
                    min={1}
                    max={
                      MODEL_CONFIGS[getModelConfigKey(selectedModel)]
                        ?.maxSteps || 30
                    }
                    step={1}
                    className='w-full'
                  />
                  <p className='text-xs text-white/50'>
                    Higher = better quality but slower (Max:{' '}
                    {MODEL_CONFIGS[getModelConfigKey(selectedModel)]
                      ?.maxSteps || 30}
                    )
                  </p>
                </div>

                <div>
                  <label className='text-sm text-white/70 block mb-1'>
                    Guidance ({guidance})
                  </label>
                  <input
                    type='range'
                    value={guidance}
                    onChange={(e) => setGuidance(parseFloat(e.target.value))}
                    min={1}
                    max={15}
                    step={0.1}
                    className='w-full'
                  />
                  <p className='text-xs text-white/50'>
                    Higher = follows prompt more closely
                  </p>
                </div>
              </div>
            )}

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
          prompt={prompt}
          isLoading={imageMutation.isPending}
          error={imageMutation.error?.message}
          onImageError={handleImageError}
        />
      </div>
    </div>
  );
}
