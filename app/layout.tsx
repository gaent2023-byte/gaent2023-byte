import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GSOR — Global Supplier Opinion Report & Risk Intelligence',
  description:
    'Enterprise platform to search, verify, assess, and generate professional Supplier Opinion Reports with AI-assisted risk intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
