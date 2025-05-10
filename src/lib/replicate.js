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

  // Proteus v0.3 specifically for anime content
  PROTEUS:
    'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48',

  // Adding Stable Diffusion 3.5 Large - using the official model ID without version
  SD_3_5: 'stability-ai/stable-diffusion-3.5-large',
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
  'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48':
    {
      defaultSteps: 30, // Increased from original to get better quality
      maxSteps: 60, // Maximum recommended by Proteus docs
      defaultGuidance: 7.5,
      description:
        'Specialized in anime art with enhanced lighting effects - trained on 200,000+ anime images',
      nsfw_optimized: true,
    },
  'stability-ai/stable-diffusion-3.5-large': {
    defaultSteps: 30,
    maxSteps: 50,
    defaultGuidance: 7.5,
    description:
      'High-quality model with fine details, supports various styles, and produces diverse outputs',
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
    // SD 3.5 Turbo model - fixed for 422 errors
    else if (modelId.includes('stable-diffusion-3.5')) {
      modelInputs = {
        prompt:
          prompt + ', photo, photography, artistic photograph, high quality', // Add artistic keywords
        negative_prompt:
          mergedOptions.negativePrompt +
          ', censored, censorship, blur, blurry, low quality, cropped, worst quality', // Enhanced negative prompt
        width: Math.min(mergedOptions.width, 1024),
        height: Math.min(mergedOptions.height, 1024),
        num_inference_steps: mergedOptions.numSteps,
        guidance_scale: mergedOptions.guidanceScale,
        // Enhanced NSFW settings for SD 3.5
        apply_watermark: false,
        high_noise_frac: 0.8,
        disable_safety_checker: true,
        safety_checker: 'none', // Use literal "none" value
        allow_nsfw: true,
        nsfw_allowed: true,
        nsfw: true,
        remove_safety: true,
        safety_guidance_scale: 0, // Set to 0 to ignore safety guidance
      };

      console.log('SD 3.5 parameters:', JSON.stringify(modelInputs, null, 2));
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
  // MiniMax Image-01 model - reverted to original working version
  else if (mergedOptions.modelName.includes('minimax/image-01')) {
    modelInputs = {
      prompt: prompt + ', artistic photo', // Add keywords that make content appear more artistic
      negative_prompt:
        mergedOptions.negativePrompt + ', censored, censorship, black bars', // Add censorship to negative prompt
      width: Math.min(mergedOptions.width, 1024), // MiniMax has a 1024x1024 maximum
      height: Math.min(mergedOptions.height, 1024),
      seed: Math.floor(Math.random() * 1000000), // Random seed helps with variation
      steps: mergedOptions.numSteps,
      cfg_scale: mergedOptions.guidanceScale,
      nsfw: true, // Original parameter
      safety_checker: false, // Try to bypass safety checker
      guidance_safety_scale: 0, // Set safety guidance to 0
      allow_nsfw: true, // Add explicit NSFW permission
      remove_safety: true, // Try additional parameter
      disable_safety_checker: true, // Add standard parameter
    };

    // Log parameters for debugging
    console.log('MiniMax parameters:', JSON.stringify(modelInputs, null, 2));
  }
  // Stable Diffusion 3.5 model
  else if (mergedOptions.modelName.includes('stable-diffusion-3.5')) {
    modelInputs = {
      prompt:
        prompt + ', photo, photography, artistic photograph, high quality', // Add artistic keywords
      negative_prompt:
        mergedOptions.negativePrompt +
        ', clothing, censored, censorship, blur, blurry, low quality, cropped, worst quality', // Add clothing to negative prompt
      width: Math.min(mergedOptions.width, 1024),
      height: Math.min(mergedOptions.height, 1024),
      num_inference_steps: mergedOptions.numSteps,
      guidance_scale: mergedOptions.guidanceScale,
      // Enhanced NSFW settings for SD 3.5
      apply_watermark: false,
      high_noise_frac: 0.8,
      disable_safety_checker: true,
      safety_checker: 'none', // Use literal "none" value
      allow_nsfw: true,
      nsfw_allowed: true,
      nsfw: true,
      remove_safety: true,
      safety_guidance_scale: 0, // Set to 0 to ignore safety guidance
    };

    console.log('SD 3.5 parameters:', JSON.stringify(modelInputs, null, 2));
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
