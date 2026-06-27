'use client';

import { useEffect, useState } from 'react';
import { getCountBySet } from '@/lib/supabase';

interface SetInfo { exam_set: string; count: number; }

export default function SetsPage() {
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCountBySet().then(data => {
      setSets(data.filter(s => !s.exam_set.includes('인프런')));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-gray-400 py-20 text-center">불러오는 중...</div>;
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← 홈으로
        </a>
        <h1 className="text-2xl font-bold text-orange-400 mt-1">기출 문제</h1>
        <p className="text-gray-400 text-sm mt-1">세트를 선택해 풀기 시작하세요</p>
      </div>

      <div className="grid gap-3">
        {sets.map(s => (
          <a
            key={s.exam_set}
            href={`/quiz?mode=set&set=${encodeURIComponent(s.exam_set)}`}
            className="group flex items-center justify-between p-5 rounded-xl border border-gray-700 bg-gray-900 hover:border-orange-500 hover:bg-gray-800 transition-all"
          >
            <div>
              <h2 className="font-semibold group-hover:text-orange-300 transition-colors">{s.exam_set}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{s.count}문제</p>
            </div>
            <span className="text-gray-600 group-hover:text-orange-400 transition-colors text-sm">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
