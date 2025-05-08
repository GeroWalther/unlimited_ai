import Replicate from 'replicate';

// Initialize the Replicate client with your API key from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

/**
 * Calls the Replicate API to generate an image based on the prompt.
 * @param prompt - The text prompt for image generation.
 * @returns The output from the Replicate model (usually an image URL).
 */
export async function runReplicateImageGeneration(prompt) {
  console.log('Sending prompt to Replicate:', prompt);

  const output = await replicate.run('black-forest-labs/flux-schnell', {
    input: {
      prompt,
      width: 768,
      height: 1024,
      num_inference_steps: 4,
      guidance_scale: 7.5,
      allow_nsfw: true, // Enable NSFW content generation
    },
    // Enable streaming for the Flux-Schnell model
    stream: true,
  });

  console.log('Replicate initial response type:', typeof output);
  return output;
}
