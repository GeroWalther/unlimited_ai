'use client';
import ImageGenerator from './components/ImageGenerator';

export default function HomePage() {
  return (
    <main style={{ maxWidth: 600, margin: 'auto', padding: 32 }}>
      <h1>Unlimited AI</h1>
      <h3>NSFW AI Image Generator</h3>
      <ImageGenerator />
    </main>
  );
}
