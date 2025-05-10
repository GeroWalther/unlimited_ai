import Replicate from 'replicate';

// Initialize the Replicate client with your API key from environment variables
const apiKey = process.env.REPLICATE_API_KEY;

// Debug log to see if the API key is loading correctly (first 5 chars only for security)
console.log(
  'API Key prefix:',
  apiKey ? `${apiKey.substring(0, 5)}...` : 'undefined'
);

const replicate = new Replicate({
  auth: apiKey,
});

/**
 * Models available for NSFW/artistic nude content generation
 * Selected based on confirmed working models from the error logs and versioned IDs from documentation
 */
const MODELS = {
  // Flux Schnell is fast and reliable - the recommended model from Replicate docs
  FLUX_SCHNELL: 'black-forest-labs/flux-schnell',

  // Using full version IDs for models that require payment or special access
  STICKER_MAKER:
    'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a',

  // Proteus v0.3 specifically for anime content
  PROTEUS:
    'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48',

  // Babes-XL for high-quality NSFW photorealism
  BABES_XL:
    'asiryan/babes-sdxl:a07fcbe80652ccf989e8198654740d7d562de85f573196dd624a8a80285da27d',
};

/**
 * Model-specific configurations for optimal performance with NSFW content
 */
export const MODEL_CONFIGS = {
  'black-forest-labs/flux-schnell': {
    defaultSteps: 4, // Flux is optimized for speed, 4 steps is optimal
    maxSteps: 4, // Maximum recommended steps for FLUX
    defaultGuidance: 7.5,
    description:
      'Ultra-fast model generating images in 1-2 seconds - reliable for NSFW content',
    nsfw_optimized: true,
  },
  'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a':
    {
      defaultSteps: 20,
      maxSteps: 30,
      defaultGuidance: 7.5,
      description:
        'Specialized model for creating graphics with transparent backgrounds - perfect for stickers, emotes, and icons',
      nsfw_optimized: true,
    },
  'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48':
    {
      defaultSteps: 30, // Increased from original to get better quality
      maxSteps: 60, // Maximum recommended by Proteus docs
      defaultGuidance: 7.5,
      description:
        'Specialized in anime art with enhanced lighting effects - trained on 200,000+ anime images',
      nsfw_optimized: true,
    },
  'asiryan/babes-sdxl:a07fcbe80652ccf989e8198654740d7d562de85f573196dd624a8a80285da27d':
    {
      defaultSteps: 40,
      maxSteps: 50,
      defaultGuidance: 3.5,
      description:
        'High-quality photorealistic NSFW model with excellent figure details and lighting (2025)',
      nsfw_optimized: true,
    },
};

/**
 * Calls the Replicate API to generate an image based on the prompt.
 * All models are set to allow NSFW content by default.
 * @param prompt - The text prompt for image generation.
 * @param options - Additional options for image generation.
 * @returns The output from the Replicate model (usually an image URL).
 */
export async function runReplicateImageGeneration(prompt, options = {}) {
  console.log('Sending prompt to Replicate:', prompt);

  // Get the model configuration based on the selected model
  const modelName = options.modelName || MODELS.FLUX_SCHNELL;
  const modelConfig =
    MODEL_CONFIGS[modelName] || MODEL_CONFIGS[MODELS.FLUX_SCHNELL];

  // Set default options with NSFW always enabled
  const defaultOptions = {
    modelName: MODELS.FLUX_SCHNELL,
    width: 768,
    height: 1024,
    numSteps: modelConfig.defaultSteps, // Use model-specific default
    guidanceScale: modelConfig.defaultGuidance,
    allowNsfw: true, // Always allow NSFW content
    negativePrompt:
      'ugly, deformed, disfigured, blurry, bad anatomy, bad hands, cropped, low quality',
  };

  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };

  // Ensure steps is within the acceptable range for the selected model
  if (modelConfig) {
    mergedOptions.numSteps = Math.min(
      Math.max(1, mergedOptions.numSteps),
      modelConfig.maxSteps
    );
  }

  // Configure model-specific parameters - all optimized for NSFW
  let modelInputs = {};

  // For versioned model IDs (contains colon), use direct run with specific version
  if (mergedOptions.modelName.includes(':')) {
    // Extract the model ID and version
    const [modelId, versionId] = mergedOptions.modelName.split(':');

    // Sticker maker model
    if (modelId.includes('sticker-maker')) {
      modelInputs = {
        prompt: prompt + ', high quality, detailed',
        negative_prompt:
          mergedOptions.negativePrompt + ', censored, censorship, blurred',
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        disable_safety_checker: true,
        nsfw: true,
        allow_nsfw: true,
        safety_checker: 'none',
        remove_safety: true,
      };

      console.log(
        'Sticker Maker parameters:',
        JSON.stringify(modelInputs, null, 2)
      );
    }
    // Proteus v0.3 model
    else if (modelId.includes('proteus')) {
      modelInputs = {
        prompt:
          prompt +
          ', best quality, HD, ~*~aesthetic~*~, detailed, artistic anime, uncensored', // Add recommended prompt enhancers
        negative_prompt:
          mergedOptions.negativePrompt +
          ', censored, censorship, blurred, blur, mosaic censoring, black bars', // Enhanced negative prompt
        width: Math.min(mergedOptions.width, 1280),
        height: Math.min(mergedOptions.height, 1280),
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        disable_safety_checker: true,
        scheduler: 'DPM++2MSDE', // Recommended scheduler for Proteus
        apply_watermark: false, // No watermarks
        nsfw: true,
        allow_nsfw: true,
        safety_checker: 'none',
        remove_safety: true,
      };

      console.log('Proteus parameters:', JSON.stringify(modelInputs, null, 2));
    }
    // Babes-XL model
    else if (modelId.includes('babes-sdxl')) {
      modelInputs = {
        prompt:
          'artistic photography, ' +
          prompt +
          ', high quality, detailed, 8k ultra HD',
        negative_prompt:
          mergedOptions.negativePrompt +
          ', censored, censorship, blurred, blur',
        width: Math.min(mergedOptions.width, 1024),
        height: Math.min(mergedOptions.height, 1024),
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        scheduler: 'K_EULER_ANCESTRAL', // Default scheduler for this model
        num_outputs: 1,
        disable_safety_checker: true,
      };

      console.log('Babes-XL parameters:', JSON.stringify(modelInputs, null, 2));
    }
    // Generic parameters for other versioned models
    else {
      modelInputs = {
        prompt: prompt,
        negative_prompt: mergedOptions.negativePrompt,
        width: mergedOptions.width,
        height: mergedOptions.height,
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        disable_safety_checker: true,
      };
    }

    console.log(
      `Using versioned model: ${modelId} (${versionId}) with ${mergedOptions.numSteps} steps, NSFW allowed: true`
    );

    // Run with direct versioned model ID
    const output = await replicate.run(mergedOptions.modelName, {
      input: modelInputs,
    });

    console.log('Replicate initial response type:', typeof output);
    return output;
  }

  // Non-versioned models
  // Black Forest Labs models (FLUX)
  if (mergedOptions.modelName.includes('flux')) {
    modelInputs = {
      prompt: prompt + ', artistic nude photography', // Add artistic keywords
      width: mergedOptions.width,
      height: mergedOptions.height,
      num_inference_steps: mergedOptions.numSteps,
      guidance_scale: mergedOptions.guidanceScale,
      allow_nsfw: true, // Always enable NSFW
      disable_safety_checker: true, // Always disable safety checks for NSFW
      negative_prompt:
        mergedOptions.negativePrompt + ', censored, censorship, blurred', // Add censorship to negative prompt
      stream: true,
      nsfw: true, // Add explicit NSFW flag
      remove_safety: true, // Try additional parameter
    };

    // Log parameters for debugging
    console.log('FLUX parameters:', JSON.stringify(modelInputs, null, 2));
  }
  // Default fallback for any other model
  else {
    modelInputs = {
      prompt,
      width: mergedOptions.width,
      height: mergedOptions.height,
      num_inference_steps: mergedOptions.numSteps,
      guidance_scale: mergedOptions.guidanceScale,
      negative_prompt: mergedOptions.negativePrompt,
      disable_safety_checker: true,
      nsfw_filter: false, // Always disable NSFW filter
      allow_nsfw: true, // Always try to allow NSFW
      nsfw: true, // Explicit NSFW flag for models that support it
    };
  }

  console.log(
    `Using model: ${mergedOptions.modelName} with ${mergedOptions.numSteps} steps, NSFW allowed: true`
  );

  try {
    const output = await replicate.run(mergedOptions.modelName, {
      input: modelInputs,
    });

    console.log('Replicate initial response type:', typeof output);
    return output;
  } catch (error) {
    console.error('Replicate API error:', error);
    throw error;
  }
}
