
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a fallback, Geist is primary
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono'; // Corrected import path
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GameGenius',
  description: 'Turn your game ideas into playable HTML5 games with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          inter.variable,
          'font-sans antialiased'
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
