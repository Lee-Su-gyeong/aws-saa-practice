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

  return (
    <div className="space-y-10 pt-2">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-orange-500">AWS SAA 문제풀이</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">Solutions Architect Associate 자격증 대비</p>
        {totalCount !== null && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">전체 {totalCount}문제</p>
        )}
      </div>

      {/* ── 기출 문제 ── */}
      {kiChulSets.length > 0 && (
        <Section title="기출 문제" icon="📝">
          <NavCard
            href="/sets"
            title={`1차 ~ ${kiChulSets.length}차 기출`}
            subtitle={`${kiChulTotal}문제 · ${kiChulSets.length}개 세트`}
          />
        </Section>
      )}

      {/* ── 인프런 예상 기출 ── */}
      {infreanSets.length > 0 && (
        <Section title="인프런 예상 기출" icon="🎓">
          {infreanSets.map(s => (
            <NavCard
              key={s.exam_set}
              href={`/quiz?mode=set&set=${encodeURIComponent(s.exam_set)}`}
              title={s.exam_set}
              subtitle={`${s.count}문제`}
            />
          ))}
        </Section>
      )}

      {/* ── 모아 풀기 ── */}
      <Section title="모아 풀기" icon="🗂️">
        <NavCard
          href="/quiz?mode=all"
          title="전체 문제 풀기"
          subtitle={`${totalCount ?? '...'}문제 · 전 세트 랜덤`}
        />
        <NavCard
          href={wrongCount > 0 ? '/quiz?mode=wrong' : '#'}
          title="오답 문제 풀기"
          subtitle={wrongCount > 0 ? `${wrongCount}문제` : '오답이 없습니다'}
          disabled={wrongCount === 0}
          danger
        />
      </Section>

      {/* ── 개념 공부 ── */}
      <Section title="개념 공부" icon="📖">
        <NavCard
          href="/concepts"
          title="개념 PDF 보기"
          subtitle={concepts.length > 0 ? `${concepts.length}개 등록됨` : 'PDF를 등록해 브라우저에서 바로 열기'}
          accent="blue"
        />
      </Section>

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center pb-4">
        오답은 브라우저 localStorage에 저장됩니다 · 로그인 불필요
      </p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <span>{icon}</span>{title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function NavCard({
  href,
  title,
  subtitle,
  disabled = false,
  danger = false,
  accent = 'orange',
}: {
  href: string;
  title: string;
  subtitle: string;
  disabled?: boolean;
  danger?: boolean;
  accent?: 'orange' | 'blue';
}) {
  const hoverBorder = danger
    ? 'hover:border-red-400 dark:hover:border-red-500'
    : accent === 'blue'
    ? 'hover:border-blue-400 dark:hover:border-blue-500'
    : 'hover:border-orange-400 dark:hover:border-orange-500';

  const hoverTitle = danger
    ? 'group-hover:text-red-500 dark:group-hover:text-red-400'
    : accent === 'blue'
    ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
    : 'group-hover:text-orange-600 dark:group-hover:text-orange-300';

  return (
    <a
      href={href}
      className={`group flex items-center justify-between p-5 rounded-xl border transition-all
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-800
        ${hoverBorder}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <div>
        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 transition-colors ${hoverTitle}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <span className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-400 transition-colors text-sm shrink-0 ml-3">
        →
      </span>
    </a>
  );
}
