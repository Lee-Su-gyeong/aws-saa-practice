'use client';

import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-lg md:text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
          AWS SAA 문제풀이
        </a>
        <button
          onClick={toggle}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl"
          aria-label="테마 전환"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
