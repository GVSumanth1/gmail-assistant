import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gmail Assistant',
  description: 'AI-powered email classification with Kanban board',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
