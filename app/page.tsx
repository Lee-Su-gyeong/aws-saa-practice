'use client';

import { useEffect, useState } from 'react';
import { getCountBySet, getTotalCount } from '@/lib/supabase';
import { getAllConcepts } from '@/lib/concepts';
import { getWrongAnswerCount } from '@/lib/localStorage';
import { ConceptPDF } from '@/types';

interface SetInfo { exam_set: string; count: number; }

export default function Home() {
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [concepts, setConcepts] = useState<ConceptPDF[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    getCountBySet().then(setSets);
    getTotalCount().then(setTotalCount);
    getAllConcepts().then(setConcepts);
    setWrongCount(getWrongAnswerCount());
  }, []);

  const kiChulSets = sets.filter(s => !s.exam_set.includes('인프런'));
  const infreanSets = sets.filter(s => s.exam_set.includes('인프런'));
  const kiChulTotal = kiChulSets.reduce((sum, s) => sum + s.count, 0);
  const infreanTotal = infreanSets.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-10 pt-4">
      <div>
        <h1 className="text-3xl font-bold text-orange-400">AWS SAA 문제풀이</h1>
        <p className="text-gray-400 mt-2">Solutions Architect Associate 자격증 대비</p>
        {totalCount !== null && (
          <p className="text-sm text-gray-500 mt-1">전체 {totalCount}문제</p>
        )}
      </div>

      {/* ── 기출 문제 ── */}
      {kiChulSets.length > 0 && (
        <Section title="기출 문제" icon="📝">
          <a
            href="/sets"
            className="group flex items-center justify-between p-5 rounded-xl border border-gray-700 bg-gray-900 hover:border-orange-500 hover:bg-gray-800 transition-all"
          >
            <div>
              <h3 className="font-semibold group-hover:text-orange-300 transition-colors">1차 ~ {kiChulSets.length}차 기출</h3>
              <p className="text-sm text-gray-400 mt-0.5">{kiChulTotal}문제 · {kiChulSets.length}개 세트</p>
            </div>
            <span className="text-gray-600 group-hover:text-orange-400 transition-colors text-sm">→</span>
          </a>
        </Section>
      )}

      {/* ── 인프런 예상 기출 ── */}
      {infreanSets.length > 0 && (
        <Section title="인프런 예상 기출" icon="🎓">
          {infreanSets.map(s => (
            <a
              key={s.exam_set}
              href={`/quiz?mode=set&set=${encodeURIComponent(s.exam_set)}`}
              className="group flex items-center justify-between p-5 rounded-xl border border-gray-700 bg-gray-900 hover:border-orange-500 hover:bg-gray-800 transition-all"
            >
              <div>
                <h3 className="font-semibold group-hover:text-orange-300 transition-colors">{s.exam_set}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{s.count}문제</p>
              </div>
              <span className="text-gray-600 group-hover:text-orange-400 transition-colors text-sm">→</span>
            </a>
          ))}
        </Section>
      )}

      {/* ── 모아 풀기 ── */}
      <Section title="모아 풀기" icon="🗂️">
        <a
          href="/quiz?mode=all"
          className="group flex items-center justify-between p-5 rounded-xl border border-gray-700 bg-gray-900 hover:border-orange-500 hover:bg-gray-800 transition-all"
        >
          <div>
            <h3 className="font-semibold group-hover:text-orange-300 transition-colors">전체 문제 풀기</h3>
            <p className="text-sm text-gray-400 mt-0.5">{totalCount ?? '...'}문제 · 전 세트 랜덤</p>
          </div>
          <span className="text-2xl">📚</span>
        </a>

        <a
          href={wrongCount > 0 ? '/quiz?mode=wrong' : '#'}
          className={`group flex items-center justify-between p-5 rounded-xl border transition-all ${
            wrongCount > 0
              ? 'border-gray-700 bg-gray-900 hover:border-red-500 hover:bg-gray-800'
              : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div>
            <h3 className={`font-semibold transition-colors ${wrongCount > 0 ? 'group-hover:text-red-300' : ''}`}>
              오답 문제 풀기
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {wrongCount > 0 ? `${wrongCount}문제` : '오답이 없습니다'}
            </p>
          </div>
          <span className="text-2xl">❌</span>
        </a>
      </Section>

      {/* ── 개념 공부 ── */}
      <Section title="개념 공부" icon="📖">
        <a
          href="/concepts"
          className="group flex items-center justify-between p-5 rounded-xl border border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-gray-800 transition-all"
        >
          <div>
            <h3 className="font-semibold group-hover:text-blue-300 transition-colors">개념 PDF 보기</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {concepts.length > 0 ? `${concepts.length}개 등록됨` : 'PDF를 등록해 브라우저에서 바로 열기'}
            </p>
          </div>
          <span className="text-2xl">📄</span>
        </a>
      </Section>

      <p className="text-xs text-gray-600 text-center">
        오답은 브라우저 localStorage에 저장됩니다 · 로그인 불필요
      </p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}
