'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getWrongAnswerCount } from '@/lib/localStorage';
import { useEffect, useState } from 'react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const total = Number(searchParams.get('total') ?? 0);
  const correct = Number(searchParams.get('correct') ?? 0);
  const mode = searchParams.get('mode') ?? 'all';
  const setName = searchParams.get('set') ?? '';
  const wrong = total - correct;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const [wrongCount, setWrongCount] = useState(0);
  useEffect(() => { setWrongCount(getWrongAnswerCount()); }, []);

  function getMessage() {
    if (percent >= 90) return '완벽합니다! 합격권입니다.';
    if (percent >= 75) return '잘 하고 있어요! 조금만 더 연습하세요.';
    if (percent >= 60) return '오답 문제를 위주로 복습해보세요.';
    return '기본 개념부터 다시 확인해보세요.';
  }

  const retryHref =
    mode === 'set' && setName
      ? `/quiz?mode=set&set=${encodeURIComponent(setName)}`
      : `/quiz?mode=${mode}`;

  const label =
    mode === 'set' && setName ? setName : mode === 'wrong' ? '오답 문제' : '전체 문제';

  return (
    <div className="space-y-6 pt-2">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">결과</h1>
      </div>

      {/* 점수 카드 */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center space-y-3">
        <div className="text-6xl font-bold text-orange-500">{percent}%</div>
        <div className="text-gray-700 dark:text-gray-300 text-base md:text-lg">
          {total}문제 중{' '}
          <span className="text-green-600 dark:text-green-400 font-semibold">{correct}개</span> 정답 ·{' '}
          <span className="text-red-500 dark:text-red-400 font-semibold">{wrong}개</span> 오답
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm">{getMessage()}</div>
      </div>

      {/* 누적 오답 */}
      {wrongCount > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">누적 오답 문제</p>
            <p className="text-lg font-semibold text-red-500 dark:text-red-400">{wrongCount}문제</p>
          </div>
          <a
            href="/quiz?mode=wrong"
            className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold text-white transition-colors shrink-0"
          >
            오답만 다시 풀기
          </a>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="grid gap-3">
        <a
          href={retryHref}
          className="block text-center py-4 rounded-xl bg-orange-500 hover:bg-orange-400 font-semibold text-white text-base transition-colors"
        >
          다시 풀기
        </a>
        <a
          href="/"
          className="block text-center py-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-base transition-colors"
        >
          홈으로
        </a>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-20 text-center">로딩 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
