'use client';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Question } from '@/types';
import { getAllQuestions, getQuestionsBySet, getQuestionsByIds } from '@/lib/supabase';
import { getWrongAnswerIds, addWrongAnswerId, removeWrongAnswerId } from '@/lib/localStorage';
import QuestionCard from '@/components/QuestionCard';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode') ?? 'all'; // 'all' | 'set' | 'wrong'
  const setName = searchParams.get('set') ?? '';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ id: number; correct: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        let qs: Question[];
        if (mode === 'wrong') {
          const ids = getWrongAnswerIds();
          if (ids.length === 0) { router.replace('/'); return; }
          qs = await getQuestionsByIds(ids);
        } else if (mode === 'set' && setName) {
          qs = await getQuestionsBySet(setName);
        } else {
          qs = await getAllQuestions();
        }
        setQuestions(shuffle(qs));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : '문제를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mode, setName, router]);

  const handleNext = useCallback(
    (isCorrect: boolean) => {
      const q = questions[index];
      const newResults = [...results, { id: q.id, correct: isCorrect }];
      setResults(newResults);

      if (isCorrect) removeWrongAnswerId(q.id);
      else addWrongAnswerId(q.id);

      if (index + 1 >= questions.length) {
        const correct = newResults.filter((r) => r.correct).length;
        const setParam = setName ? `&set=${encodeURIComponent(setName)}` : '';
        router.push(`/results?total=${questions.length}&correct=${correct}&mode=${mode}${setParam}`);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [index, questions, results, mode, setName, router]
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400">문제를 불러오는 중...</div>;
  }
  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-400">{error}</p>
        <a href="/" className="text-orange-400 underline">홈으로</a>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-400">문제가 없습니다.</p>
        <a href="/" className="text-orange-400 underline">홈으로</a>
      </div>
    );
  }

  return (
    <QuestionCard
      question={questions[index]}
      index={index}
      total={questions.length}
      onNext={handleNext}
    />
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 py-20 text-center">로딩 중...</div>}>
      <QuizContent />
    </Suspense>
  );
}
