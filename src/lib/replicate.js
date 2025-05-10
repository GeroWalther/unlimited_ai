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

  // MiniMax Image-01 is also working reliably
  MINIMAX: 'minimax/image-01',

  // Using full version IDs for models that require payment or special access
  STICKER_MAKER:
    'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a',

  // Recraft V3 for high-quality design and text generation
  RECRAFT:
    'recraft-ai/recraft-v3:00d0868ae04f3a6e8bd152f81b191d0c16562c3a39a878c2a074623bfd06f7d7',

  // Proteus v0.3 specifically for anime content
  PROTEUS:
    'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48',

  // SD 3.5 Turbo for high-quality fantasy art
  SD_TURBO:
    'stability-ai/stable-diffusion-3.5-large-turbo:c76327772f9c49cbd5b8f4dbddad19f05a6e8c7b8103b87b509180cfbecf4626',
};

/**
 * Model-specific configurations for optimal performance with NSFW content
 */
export const MODEL_CONFIGS = {
  'black-forest-labs/flux-schnell': {
    defaultSteps: 4, // Increased for better quality
    maxSteps: 10, // Increased max steps
    defaultGuidance: 7.5,
    description:
      'Ultra-fast model generating images in 1-2 seconds - reliable for NSFW content',
    nsfw_optimized: true,
  },
  'minimax/image-01': {
    defaultSteps: 25,
    maxSteps: 40,
    defaultGuidance: 7.0,
    description:
      'High-quality versatile model with excellent character reference support',
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
  'recraft-ai/recraft-v3:00d0868ae04f3a6e8bd152f81b191d0c16562c3a39a878c2a074623bfd06f7d7':
    {
      defaultSteps: 30,
      maxSteps: 50,
      defaultGuidance: 7.5,
      description:
        'State-of-the-art model with excellent text generation in images - can generate long coherent text within images',
      nsfw_optimized: true,
    },
  'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48':
    {
      defaultSteps: 30,
      maxSteps: 60,
      defaultGuidance: 7.5,
      description:
        'Specialized in anime art with enhanced lighting effects - trained on 200,000+ anime images',
      nsfw_optimized: true,
    },
  'stability-ai/stable-diffusion-3.5-large-turbo:c76327772f9c49cbd5b8f4dbddad19f05a6e8c7b8103b87b509180cfbecf4626':
    {
      defaultSteps: 8,
      maxSteps: 20,
      defaultGuidance: 7.5,
      description:
        'Fast high-quality model with fine details, artistic styles and diverse outputs - from Stability AI',
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
        prompt: prompt,
        negative_prompt: mergedOptions.negativePrompt,
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        disable_safety_checker: true,
      };
    }
    // Recraft V3 model
    else if (modelId.includes('recraft')) {
      modelInputs = {
        prompt: prompt,
        negative_prompt: mergedOptions.negativePrompt,
        width: Math.min(mergedOptions.width, 1024),
        height: Math.min(mergedOptions.height, 1024),
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        disable_safety_checker: true,
        nsfw_filter: 'disabled', // Explicitly disable NSFW filter
      };
    }
    // SD 3.5 Turbo model
    else if (modelId.includes('stable-diffusion-3.5')) {
      modelInputs = {
        prompt: prompt,
        negative_prompt: mergedOptions.negativePrompt,
        width: Math.min(mergedOptions.width, 1024),
        height: Math.min(mergedOptions.height, 1024),
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        disable_safety_checker: true,
        apply_safety_checker: false,
      };
    }
    // Proteus v0.3 model
    else if (modelId.includes('proteus')) {
      modelInputs = {
        prompt: prompt + ', best quality, HD, ~*~aesthetic~*~', // Add recommended prompt enhancers
        negative_prompt: mergedOptions.negativePrompt,
        width: Math.min(mergedOptions.width, 1280),
        height: Math.min(mergedOptions.height, 1280),
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        disable_safety_checker: true,
        scheduler: 'DPM++2MSDE', // Recommended scheduler for Proteus
        apply_watermark: false, // No watermarks
      };
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

  // Non-versioned models (Flux Schnell, MiniMax)
  // Black Forest Labs models (FLUX)
  else if (mergedOptions.modelName.includes('flux')) {
    modelInputs = {
      prompt,
      width: mergedOptions.width,
      height: mergedOptions.height,
      num_inference_steps: mergedOptions.numSteps,
      guidance_scale: mergedOptions.guidanceScale,
      allow_nsfw: true, // Always enable NSFW
      disable_safety_checker: true, // Always disable safety checks for NSFW
      negative_prompt: mergedOptions.negativePrompt,
      stream: true,
    };
  }
  // MiniMax Image-01 model
  else if (mergedOptions.modelName.includes('minimax/image-01')) {
    modelInputs = {
      prompt,
      negative_prompt: mergedOptions.negativePrompt,
      width: Math.min(mergedOptions.width, 1024), // MiniMax has a 1024x1024 maximum
      height: Math.min(mergedOptions.height, 1024),
      seed: Math.floor(Math.random() * 1000000), // Random seed helps with variation
      // MiniMax uses different parameter names
      steps: mergedOptions.numSteps,
      cfg_scale: mergedOptions.guidanceScale,
      nsfw: true, // Always enable NSFW flag
    };
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
    };
  }

  console.log(
    `Using model: ${mergedOptions.modelName} with ${mergedOptions.numSteps} steps, NSFW allowed: true`
  );
  const output = await replicate.run(mergedOptions.modelName, {
    input: modelInputs,
  });

  console.log('Replicate initial response type:', typeof output);
  return output;
}
