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
      style,
      style_type,
    } = await req.json();

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
      case 'minimax':
        modelName = 'minimax/image-01';
        break;
      case 'sticker-maker':
        modelName =
          'fofr/sticker-maker:4acb778eb059772225ec213948f0660867b2e03f277448f18cf1800b96a65a1a';
        break;
      case 'recraft':
        modelName =
          'recraft-ai/recraft-v3:00d0868ae04f3a6e8bd152f81b191d0c16562c3a39a878c2a074623bfd06f7d7';
        break;
      case 'proteus':
        modelName =
          'datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48';
        break;
      case 'sd-turbo':
        modelName =
          'stability-ai/stable-diffusion-3.5-large-turbo:c76327772f9c49cbd5b8f4dbddad19f05a6e8c7b8103b87b509180cfbecf4626';
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
        style, // Pass style for Recraft
        style_type, // Pass style_type for Ideogram
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

        // Recraft model may return images in different formats
        // It might return a URL directly or an object with a URL property
        if (model === 'recraft') {
          console.log(
            'Handling Recraft model response:',
            JSON.stringify(output)
          );

          // Try to find any URL in the output
          const findUrl = (obj) => {
            if (!obj) return null;
            if (typeof obj === 'string' && obj.startsWith('http')) return obj;
            if (Array.isArray(obj)) {
              for (const item of obj) {
                const url = findUrl(item);
                if (url) return url;
              }
            }
            if (typeof obj === 'object') {
              for (const key in obj) {
                const url = findUrl(obj[key]);
                if (url) return url;
              }
            }
            return null;
          };

          const imageUrl = findUrl(output);
          if (imageUrl) {
            return NextResponse.json({
              image_url: imageUrl,
              status: 'completed',
              model: model,
              nsfw_allowed: allowNsfw,
            });
          }
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
      }

      // Generic error fallback
      return NextResponse.json(
        {
          error: `Model error with '${modelName}': ${modelError.message}. Please try Flux Schnell which is the most reliable.`,
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
