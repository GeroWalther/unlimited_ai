import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ClientProviders from './components/ClientProviders';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Unlimited AI',
  description:
    'Unlimited AI - the AI platform for creating NSFW AI images, digital art. Novel covers, illustrations) character creation (OC, fantasy and more)',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
