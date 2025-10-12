import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gym Tracker',
  description: 'Track your workouts effectively',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark text-light min-h-screen">{children}</body>
    </html>
  );
}