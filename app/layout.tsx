'use client';
import './globals.css';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toasts, removeToast } = useToast();

  return (
    <html lang="en">
      <head>
        <title>Gymbro</title>
        <meta name="description" content="Track your workouts effectively" />
      </head>
      <body className="bg-dark text-light min-h-screen">
        {children}
        <ToastContainer 
          toasts={toasts.map(toast => ({ ...toast, onClose: removeToast }))} 
          onClose={removeToast} 
        />
      </body>
    </html>
  );
}