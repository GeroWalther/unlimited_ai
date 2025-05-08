# Unlimited AI 🔞

A powerful NSFW-capable AI image generation app built on Next.js. Unlimited AI provides a secure API gateway to Replicate's AI models, specializing in high-quality artistic and NSFW content generation.

## 🌟 Features

- **Unrestricted Image Generation**: Creates high-quality NSFW and artistic images using state-of-the-art AI models
- **Streaming Response**: Real-time image streaming for faster feedback
- **Secure API Implementation**: Protects your Replicate API key while allowing full access to powerful models
- **Content Handling**: Basic prompt validation with customizable filtering options
- **Modern Tech Stack**: Built with Next.js, React Query, and Replicate's powerful AI models

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- A Replicate API key (get one at [replicate.com](https://replicate.com))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/unlimited-ai.git
   cd unlimited-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and add your Replicate API key:

   ```
   REPLICATE_API_KEY=your_replicate_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to start generating images!

## 🔧 How It Works

### Technical Architecture

- **Frontend**: React components with TanStack Query for API state management
- **API Routes**: Next.js API routes running on the server to securely proxy requests
- **AI Integration**: Direct integration with Replicate's Flux-Schnell model, optimized for NSFW content
- **Image Handling**: Binary image data streamed from Replicate, converted to base64 for immediate display

### API Flow

1. User submits a prompt through the frontend
2. The Next.js API validates the prompt
3. The request is securely forwarded to Replicate's API
4. Replicate streams image generation data in real-time
5. The API converts binary data to base64 and returns it to the frontend
6. The frontend displays the generated image immediately

## 🎯 Usage

Enter your desired prompt in the text input field and click "Generate Image". The AI will process your prompt and create an image based on your description. For best results:

- Be specific in your descriptions
- Include details about lighting, style, and mood
- Use adjectives to guide the artistic direction

## 🛠️ Customization

### Changing AI Models

You can modify the model used by editing `src/lib/replicate.js` and updating the model name:

```javascript
const output = await replicate.run('your-preferred-model', {
  // configuration
});
```

### Content Filtering

Adjust prompt validation in `src/lib/validatePrompt.js` to customize content filtering rules.

## 📝 To-Do / Roadmap

- [ ] Add user authentication
- [ ] Implement image history and saving
- [ ] Add additional model options
- [ ] Create gallery view of generated images
- [ ] Implement advanced prompt builder
- [ ] Add image-to-image capabilities

## 🙏 Acknowledgements

- [Replicate](https://replicate.com) for providing the AI model infrastructure
- [Next.js](https://nextjs.org) for the React framework
- [TanStack Query](https://tanstack.com/query) for data fetching and state management

## ⚠️ Disclaimer

This application is intended for artistic and creative purposes. Users are responsible for ensuring they comply with all relevant laws and regulations regarding AI-generated content in their jurisdiction.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
