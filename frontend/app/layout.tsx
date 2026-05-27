import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Create intelligent question papers with AI. Generate structured assessments in seconds.',
  keywords: ['AI', 'assessment', 'question paper', 'education', 'teacher tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} animated-bg min-h-screen`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#F0F0FF',
              border: '1px solid rgba(108, 99, 255, 0.3)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#43E97B', secondary: '#1A1A2E' },
            },
            error: {
              iconTheme: { primary: '#FF6584', secondary: '#1A1A2E' },
            },
          }}
        />
      </body>
    </html>
  );
}
