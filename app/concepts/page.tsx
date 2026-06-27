'use client';

import { useEffect, useState } from 'react';
import { getAllConcepts } from '@/lib/concepts';
import { ConceptPDF } from '@/types';

export default function ConceptsPage() {
  const [concepts, setConcepts] = useState<ConceptPDF[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllConcepts().then(data => {
      setConcepts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-gray-400 py-20 text-center">불러오는 중...</div>;
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <a href="/" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          ← 홈으로
        </a>
        <h1 className="text-2xl font-bold text-orange-500 mt-1">개념 공부</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">PDF를 브라우저에서 바로 열어볼 수 있습니다.</p>
      </div>

      {concepts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-gray-500 dark:text-gray-400">등록된 개념 PDF가 없습니다.</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">
            node scripts/register-concept.js &lt;PDF경로&gt; &quot;제목&quot;
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {concepts.map(c => (
            <a
              key={c.id}
              href={`/concepts/${c.id}`}
              className="group flex items-center justify-between p-5 rounded-xl border
                bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700
                hover:border-blue-400 dark:hover:border-blue-500
                hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {c.title}
                  </h2>
                  {c.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{c.description}</p>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors shrink-0 ml-3">
                열기 →
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
