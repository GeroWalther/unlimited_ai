import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './components/ClientProviders';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'VisionX AI',
  description:
    'Create stunning NSFW AI images, digital art, novel covers, and character illustrations with VisionX AI. Generate immersive AI novels in multiple languages with our advanced AI writing platform.',
  openGraph: {
    title: 'VisionX AI',
    description:
      'Create stunning NSFW AI images, digital art, novel covers, and character illustrations with VisionX AI. Generate immersive AI novels in multiple languages with our advanced AI writing platform.',
    images: [
      {
        url: '/ai-art.webp',
        width: 1200,
        height: 1200,
        alt: 'VisionX AI',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionX AI',
    description:
      'Create stunning NSFW AI images, digital art, novels, and character illustrations with our advanced AI platform',
    images: ['/ai-art.webp'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
