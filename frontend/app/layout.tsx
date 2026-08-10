import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI-Trader — Realtime Multi-Agent Stock Trading Platform',
  description: 'AI-driven stock trading intelligence with real-time price streaming, multi-agent debate mechanism, and intraday vs long-term stock recommendations.',
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
