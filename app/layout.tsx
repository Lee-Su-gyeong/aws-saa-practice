import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'AWS SAA 문제풀이',
  description: 'AWS Solutions Architect Associate 자격증 문제풀이 앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      {/* 테마 깜빡임 방지: 렌더 전에 dark 클래스 적용 */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}})()` }} />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <main className="max-w-3xl mx-auto px-4 py-6 md:py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
