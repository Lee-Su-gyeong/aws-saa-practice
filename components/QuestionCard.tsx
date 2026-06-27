'use client';

import { useState } from 'react';
import { Question } from '@/types';
import OptionButton from './OptionButton';

interface Props {
  question: Question;
  index: number;
  total: number;
  onNext: (isCorrect: boolean) => void;
}

// 120자 기준으로 문장 경계에서 줄바꿈 삽입
function formatQuestionText(text: string): string {
  if (text.length <= 120) return text;

  const sentences = text.split(/(?<=[.?!])\s+/);
  if (sentences.length <= 1) return text;

  const groups: string[] = [];
  let current = '';

  for (const s of sentences) {
    if (!current) {
      current = s;
    } else if (current.length >= 120) {
      groups.push(current);
      current = s;
    } else {
      current += ' ' + s;
    }
  }
  if (current) groups.push(current);

  return groups.join('\n');
}

function ExplanationBlock({ explanation }: { explanation: string }) {
  if (!explanation) return null;

  const lines = explanation.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="space-y-3 mt-2">
      {lines.map((line, i) => {
        const isCorrect = line.startsWith('✓');
        const isWrong = line.startsWith('✗');

        if (isCorrect) {
          return (
            <div key={i} className="flex gap-2 text-sm md:text-base leading-relaxed">
              <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
              <span className="text-green-700 dark:text-green-300">{line.slice(1).trim()}</span>
            </div>
          );
        }
        if (isWrong) {
          return (
            <div key={i} className="flex gap-2 text-sm md:text-base leading-relaxed">
              <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
              <span className="text-gray-500 dark:text-gray-400">{line.slice(1).trim()}</span>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{line}</p>
        );
      })}
    </div>
  );
}

export default function QuestionCard({ question, index, total, onNext }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const answerLetters = question.answer.split('');
  const isMulti = answerLetters.length > 1;

  const isCorrect =
    selected.length === answerLetters.length &&
    answerLetters.every((l) => selected.includes(l));

  function toggleOption(letter: string) {
    if (submitted) return;
    setSelected((prev) =>
      prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]
    );
  }

  function handleSubmit() {
    if (selected.length === 0) return;
    setSubmitted(true);
  }

  function handleNext() {
    onNext(isCorrect);
    setSelected([]);
    setSubmitted(false);
  }

  function getCorrectState(letter: string): boolean | null {
    if (!submitted) return null;
    return answerLetters.includes(letter);
  }

  return (
    <div className="space-y-5">
      {/* 진행 상태 */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium">{index + 1} / {total}</span>
        <div className="flex gap-2 items-center">
          {isMulti && (
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium">
              {answerLetters.length}개 선택
            </span>
          )}
          {question.category && (
            <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs font-medium">
              {question.category}
            </span>
          )}
        </div>
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
        <div
          className="bg-orange-400 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* 문제 */}
      <p className="text-base md:text-lg leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap pt-1">
        {formatQuestionText(question.question)}
      </p>

      {/* 다중선택 안내 */}
      {isMulti && !submitted && (
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          정답을 {answerLetters.length}개 선택하세요 ({selected.length}/{answerLetters.length} 선택됨)
        </p>
      )}

      {/* 보기 */}
      <div className="space-y-2.5">
        {question.options.map((opt) => {
          const letter = opt.charAt(0);
          const isSelected = selected.includes(letter);
          const correctState = getCorrectState(letter);
          return (
            <OptionButton
              key={opt}
              label={opt}
              selected={isSelected}
              correct={correctState}
              disabled={submitted}
              onClick={() => toggleOption(letter)}
            />
          );
        })}
      </div>

      {/* 해설 */}
      {submitted && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 md:p-5">
          <p className={`font-semibold text-base mb-3 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {isCorrect ? '✓ 정답입니다!' : `✗ 오답 — 정답: ${question.answer}`}
          </p>
          <ExplanationBlock explanation={question.explanation} />
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 pt-1">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="flex-1 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-white text-base transition-colors"
          >
            정답 확인
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-base transition-colors"
          >
            {index + 1 < total ? '다음 문제 →' : '결과 보기'}
          </button>
        )}
      </div>
    </div>
  );
}
