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
    <div className="space-y-8 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-orange-400">개념 공부</h1>
        <p className="text-gray-400 mt-1 text-sm">PDF를 브라우저에서 바로 열어볼 수 있습니다.</p>
      </div>

      {concepts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-gray-500">등록된 개념 PDF가 없습니다.</p>
          <p className="text-xs text-gray-600">
            node scripts/register-concept.js &lt;PDF경로&gt; "제목"
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {concepts.map((c, i) => (
            <a
              key={c.id}
              href={`/concepts/${c.id}`}
              className="group flex items-center justify-between p-5 rounded-xl border border-gray-700 bg-gray-900 hover:border-orange-500 hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="font-semibold group-hover:text-orange-300 transition-colors">
                    {c.title}
                  </h2>
                  {c.description && (
                    <p className="text-sm text-gray-400 mt-0.5">{c.description}</p>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-500 group-hover:text-orange-400 transition-colors shrink-0">
                열기 →
              </span>
            </a>
          ))}
        </div>
      )}

      <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-300 transition-colors">
        ← 홈으로
      </a>
    </div>
  );
}
