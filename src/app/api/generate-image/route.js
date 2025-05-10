import { NextResponse } from 'next/server';
import { runReplicateImageGeneration } from '@/lib/replicate';
import { validatePrompt } from '@/lib/validatePrompt';

/**
 * API route handler for image generation.
 * Receives a POST request with a prompt and options, validates it, and returns an image URL.
 * NSFW content can be enabled or disabled based on the allowNsfw parameter.
 */
export async function POST(req) {
  try {
    const {
      prompt,
      model = 'flux-schnell', // Default to FLUX Schnell which is reliably working
      width = 768,
      height = 1024,
      steps = 30,
      guidance = 7.5,
      negativePrompt = 'ugly, deformed, disfigured, blurry, bad anatomy, bad hands, cropped, low quality',
      // Always enable NSFW mode - app is entirely NSFW
      allowNsfw = true,
      // Using let for style so it can be modified later
      style: styleParam,
      style_type,
    } = await req.json();

    // Initialize style as a let variable so it can be modified
    let style = styleParam;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Always allow NSFW content
    const validation = validatePrompt(prompt, true);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Map the model selection to actual model IDs
    let modelName;
    switch (model.toLowerCase()) {
      case 'flux-schnell':
        modelName = 'black-forest-labs/flux-schnell';
        break;
      case 'sticker-maker':
        modelName =
          'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a';
        break;
      case 'proteus':
        modelName =
          'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48';
        break;
      case 'babes-xl':
        modelName =
          'asiryan/babes-sdxl:a07fcbe80652ccf989e8198654740d7d562de85f573196dd624a8a80285da27d';
        break;
      case 'minimax':
        modelName = 'minimax/image-01';
        break;
      default:
        // Default to FLUX Schnell which is officially supported and reliable
        console.log(`Unsupported model ${model}, using FLUX Schnell instead`);
        modelName = 'black-forest-labs/flux-schnell';
    }

    try {
      // Generate the image with selected options
      const output = await runReplicateImageGeneration(prompt, {
        modelName,
        width: Number(width),
        height: Number(height),
        numSteps: Number(steps),
        guidanceScale: Number(guidance),
        allowNsfw: true, // Always allow NSFW content
        negativePrompt,
      });

      console.log(
        'Replicate output type:',
        typeof output,
        Array.isArray(output)
      );

      // Log output structure for all models to help debug
      console.log(
        `Model ${modelName} output:`,
        JSON.stringify(output, null, 2).substring(0, 300)
      );

      // Check if the output is empty or invalid
      if (
        !output ||
        (typeof output === 'object' && Object.keys(output).length === 0)
      ) {
        return NextResponse.json(
          {
            error: `Model '${modelName}' returned no image data. Use 'black-forest-labs/flux-schnell' for guaranteed results.`,
            modelName,
          },
          { status: 422 }
        );
      }

      // Handle stream response from Replicate
      if (output && output[0] instanceof ReadableStream) {
        // Read from the stream to get the binary image data
        const reader = output[0].getReader();
        let chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        // Combine all chunks into a single Uint8Array
        const totalLength = chunks.reduce(
          (acc, chunk) => acc + chunk.length,
          0
        );
        const combinedChunks = new Uint8Array(totalLength);
        let position = 0;

        for (const chunk of chunks) {
          combinedChunks.set(chunk, position);
          position += chunk.length;
        }

        // Convert binary data to base64 for display in browser
        const base64Image = Buffer.from(combinedChunks).toString('base64');
        const dataUrl = `data:image/png;base64,${base64Image}`;

        return NextResponse.json({
          image_url: dataUrl,
          status: 'completed',
          model: model,
          nsfw_allowed: allowNsfw,
        });
      }

      // Check for FLUX model output structure (direct URL)
      if (
        Array.isArray(output) &&
        typeof output[0] === 'string' &&
        output[0].startsWith('http')
      ) {
        return NextResponse.json({
          image_url: output[0],
          status: 'completed',
          model: model,
          nsfw_allowed: allowNsfw,
        });
      }

      // Special handling for Sticker Maker which returns an array of images
      if (Array.isArray(output) && model === 'sticker-maker') {
        console.log('Sticker Maker detected, returning first image from array');
        // Return the first image in the array
        return NextResponse.json({
          image_url: output[0],
          all_images: output, // Include all images in case the client wants to use them
          status: 'completed',
          model: model,
          nsfw_allowed: allowNsfw,
        });
      }

      // Check for MiniMax model output structure (returns { images: [url] })
      if (
        output &&
        typeof output === 'object' &&
        output.images &&
        Array.isArray(output.images) &&
        output.images.length > 0
      ) {
        console.log(
          'MiniMax image detected, URL:',
          output.images[0].substring(0, 100)
        );
        return NextResponse.json({
          image_url: output.images[0],
          status: 'completed',
          model: model,
          nsfw_allowed: allowNsfw,
        });
      }

      // Check for output with a specific property structure (some models return {image: url})
      if (output && typeof output === 'object') {
        // Some models return { image: url }
        if (output.image) {
          return NextResponse.json({
            image_url: output.image,
            status: 'completed',
            model: model,
            nsfw_allowed: allowNsfw,
          });
        }

        // Ideogram often returns { output: [url] }
        if (
          output.output &&
          Array.isArray(output.output) &&
          output.output.length > 0
        ) {
          return NextResponse.json({
            image_url: output.output[0],
            status: 'completed',
            model: model,
            nsfw_allowed: allowNsfw,
          });
        }
      }

      // Fallback for any other output format
      return NextResponse.json({
        image_url: Array.isArray(output)
          ? output[0]
          : typeof output === 'string'
          ? output
          : null,
        status: 'completed',
        model: model,
        nsfw_allowed: allowNsfw,
      });
    } catch (modelError) {
      console.error('Model error in generate-image API:', modelError);

      // Check for specific error types
      if (modelError.message.includes('404 Not Found')) {
        return NextResponse.json(
          {
            error: `Model '${modelName}' not found on Replicate. Please try a different model.`,
            modelName,
          },
          { status: 404 }
        );
      } else if (modelError.message.includes('422 Unprocessable Entity')) {
        return NextResponse.json(
          {
            error: `Invalid parameters for model '${modelName}': ${modelError.message}`,
            modelName,
          },
          { status: 422 }
        );
      } else if (
        modelError.message.includes('NSFW content') ||
        modelError.message.includes('flagged as sensitive') ||
        modelError.message.includes('E005') ||
        modelError.message.includes('No images were generated')
      ) {
        return NextResponse.json(
          {
            error: `NSFW content detected by '${modelName}'. We recommend trying: 
            1) FLUX Schnell which has the best NSFW support
            2) Using "artistic nude" or "photography" in your prompt instead of explicit terms
            3) Adding words like "artistic", "aesthetic", or "photography" to make the prompt seem more artistic
            4) Removing explicit sexual terms from your prompt`,
            modelName,
          },
          { status: 422 }
        );
      }

      // Generic error fallback
      return NextResponse.json(
        {
          error: `Model error with '${modelName}': ${modelError.message}. Try these troubleshooting steps: 1) Adjust steps (lower for FLUX, higher for others), 2) Simplify your prompt, 3) Try Flux Schnell which is the most reliable.`,
          modelName,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in generate-image API:', error);
    return NextResponse.json(
      { error: 'Image generation failed: ' + error.message },
      { status: 500 }
    );
  }
}
