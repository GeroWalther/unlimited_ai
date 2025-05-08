import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './components/ClientProviders';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Unlimited AI',
  description:
    'Unlimited AI - the AI platform for creating NSFW AI images, digital art. Novel covers, illustrations) character creation (OC, fantasy and more)',
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
