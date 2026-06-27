'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getConceptById } from '@/lib/concepts';
import { ConceptPDF } from '@/types';

export default function ConceptViewerPage() {
  const { id } = useParams();
  const [concept, setConcept] = useState<ConceptPDF | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getConceptById(Number(id)).then(data => {
      setConcept(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="text-gray-400 py-20 text-center">불러오는 중...</div>;
  }

  if (!concept) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-400">PDF를 찾을 수 없습니다.</p>
        <a href="/concepts" className="text-orange-400 underline">목록으로</a>
      </div>
    );
  }

  const pdfUrl = `/concepts/${encodeURIComponent(concept.filename)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <a href="/concepts" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← 목록으로
          </a>
          <h1 className="text-xl font-bold mt-1">{concept.title}</h1>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-orange-300 transition-all"
        >
          새 탭에서 열기 ↗
        </a>
      </div>

      <iframe
        src={pdfUrl}
        className="w-full rounded-lg border border-gray-700"
        style={{ height: 'calc(100vh - 160px)' }}
        title={concept.title}
      />
    </div>
  );
}
