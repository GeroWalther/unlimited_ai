https://replicate.com/

NSFW-capable AI image generation app, built on Next.js, acting as a secure API gateway to Replicate.

This backend is designed to be:

- Stateless and scalable
- Secure (hides third-party API keys from users)
- Simple and focused (single API endpoint)
- Ready for future extensions

🔧 Project Role: What the Backend Does
Purpose Details
Secure Proxy Layer Forwards prompt requests to Replicate API, keeping the real key hidden
Prompt Preprocessing Validates and cleans user prompts
Request Monitoring Logs request info (IP, user-agent, prompt) for analytics
Rate Limiting Controls API usage (protects third-party quota)

🧱 Backend Architecture Components
📁 Directory Structure (Next.js)
/next-app/
├── app/
│ ├── api/
│ │ └── generate-image/
│ │ └── route.ts # API route handler
│ └── page.tsx # Frontend page
├── lib/
│ ├── replicate.ts # Replicate API client
│ └── validatePrompt.ts # Prompt validation logic
├── .env.local # REPLICATE_API_KEY
└── package.json

🔄 API Endpoint: /api/generate-image
Request:
POST /api/generate-image
Headers:
Content-Type: application/json
Body:
{
"prompt": "elegant nude woman, soft lighting, golden hour"
}

Backend Flow:

1. Next.js API route receives request
2. Prompt validation runs
3. Replicate API call is made
4. Image URL is returned to client

🧠 Core Logic: replicate.ts

```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export async function generateImage(prompt: string) {
  const output = await replicate.run('black-forest-labs/flux-schnell', {
    input: {
      prompt,
      width: 768,
      height: 1024,
      num_inference_steps: 30,
      guidance_scale: 7.5,
    },
  });

  return output;
}
```

✅ Prompt Validation Example

```typescript
export function validatePrompt(prompt: string): {
  isValid: boolean;
  error?: string;
} {
  const lowerPrompt = prompt.toLowerCase();

  // Basic content filtering
  if (
    lowerPrompt.includes('illegal') ||
    lowerPrompt.includes('non-consensual')
  ) {
    return { isValid: false, error: 'Prompt violates terms' };
  }

  return { isValid: true };
}
```

📜 Sample .env.local File

```
REPLICATE_API_KEY=your_replicate_token_here
```

🔁 Response Format

```json
{
  "image_url": "https://replicate.delivery/pb/somehash/output.png",
  "status": "completed"
}
```

✅ Summary: What the Backend Enables

- Simple, secure API gateway to Replicate
- Basic content filtering
- Ready for future enhancements
- Easy to deploy on Vercel
