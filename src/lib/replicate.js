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
 * Selected based on confirmed working models from the error logs
 */
const MODELS = {
  // Flux Schnell is fast and reliable - the recommended model from Replicate docs
  FLUX_SCHNELL: 'black-forest-labs/flux-schnell',

  // MiniMax Image-01 is also working reliably
  MINIMAX: 'minimax/image-01',
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
      'Ultra-fast model for quick NSFW image generation - verified working',
    nsfw_optimized: true,
  },
  'minimax/image-01': {
    defaultSteps: 25,
    maxSteps: 40,
    defaultGuidance: 7.0,
    description:
      'High-quality versatile NSFW generation with character reference support',
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

  // Black Forest Labs models (FLUX)
  if (mergedOptions.modelName.includes('flux')) {
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
