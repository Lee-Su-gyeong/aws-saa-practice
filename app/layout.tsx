import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AWS SAA 문제풀이',
  description: 'AWS Solutions Architect Associate 자격증 문제풀이 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <header className="border-b border-gray-800 px-6 py-4">
          <a href="/" className="text-xl font-bold text-orange-400 hover:text-orange-300">
            AWS SAA 문제풀이
          </a>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
