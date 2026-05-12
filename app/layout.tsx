import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import CustomCursor from '../components/CustomCursor';

export const metadata: Metadata = {
  title: 'Hape Cloning',
  description: 'GSAP animated landing page',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
