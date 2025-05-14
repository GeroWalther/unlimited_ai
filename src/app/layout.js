import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './components/ClientProviders';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'VisionX AI',
  description:
    'Create stunning NSFW AI images, digital art, novel covers, and character illustrations with VisionX AI. Generate immersive AI novels in multiple languages with our advanced AI writing platform.',
  keywords: [
    'AI images',
    'NSFW AI',
    'digital art',
    'AI art',
    'AI art generator',
    'AI art generator NSFW',
    'AI art generator uncensored',
    'AI art generator fantasy',
    'AI art generator story',
    'AI art generator novel',
    'AI novels',
    'character illustrations',
    'AI character design',
    'Cover art',
    'Cover illustrations',
    'Cover art generator',
    'Cover illustrations generator',
    'Cover art generator NSFW',
    'Cover illustrations generator NSFW',
    'Cover art generator uncensored',
    'AI writing',
    'AI art generator',
    'AI NSFW novels',
    'AI story generator',
    'fantasy art',
    'uncensored AI images',
    'AI art uncensored',
    'AI art generator uncensored',
    'AI art generator NSFW',
    'AI art generator fantasy',
    'AI art generator story',
    'AI art generator novel',
    'AI art generator character',
    'AI art generator illustration',
    'AI art generator cover',
    'AI art generator cover uncensored',
    'AI art generator cover fantasy',
    'AI art generator cover story',
    'AI art generator cover novel',
    'AI art generator cover character',
    'AI art generator cover illustration',
  ],
  author: 'VisionX AI',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'VisionX AI',
    description:
      'Create stunning NSFW AI images, digital art, novel covers, and character illustrations with VisionX AI. Generate immersive AI novels in multiple languages with our advanced AI writing platform.',
    url: 'https://vision-x.gw-intech.com/',
    siteName: 'VisionX AI',
    images: [
      {
        url: 'https://vision-x.gw-intech.com/ai-art.webp',
        width: 1024,
        height: 1024,
        alt: 'VisionX AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VisionX AI',
    description:
      'Create stunning NSFW AI images, digital art, novels, and character illustrations with our advanced AI platform',
    site: '@visionxai',
    creator: '@visionxai',
    images: ['https://vision-x.gw-intech.com/ai-art.webp'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
