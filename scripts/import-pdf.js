/**
 * PDF → Supabase 임포트 스크립트
 * pdfjs-dist 위치 기반 텍스트 추출 → 띄어쓰기 복원
 * 기출 형식(실전문제풀이)과 인프런 형식(문제N / 해설) 자동 감지
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ──────────────────────────────────────────────
// pdfjs-dist 위치 기반 텍스트 추출
// ──────────────────────────────────────────────
async function extractTextFromPDF(filePath) {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const allLines = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent({ normalizeWhitespace: false });

    const lineMap = new Map();
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str) continue;
      const y = Math.round(item.transform[5]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y).push({ x: item.transform[4], width: item.width, str: item.str });
    }

    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);

    for (const y of sortedYs) {
      const items = lineMap.get(y).sort((a, b) => a.x - b.x);
      let lineText = '';
      let lastEndX = null;
      for (const item of items) {
        if (!item.str.trim()) continue;
        if (lastEndX !== null && item.x - lastEndX > 1.5) lineText += ' ';
        lineText += item.str;
        lastEndX = item.x + item.width;
      }
      const trimmed = lineText.trim();
      if (trimmed) allLines.push(trimmed);
    }

    allLines.push('§PAGE§');
  }

  return allLines.join('\n');
}

// ──────────────────────────────────────────────
// 공통 유틸
// ──────────────────────────────────────────────
function fixSpacing(text) {
  return text
    .replace(/([가-힣])([A-Za-z0-9(])/g, '$1 $2')
    .replace(/([A-Za-z0-9)])([가-힣])/g, '$1 $2')
    .replace(/([.。])([가-힣A-Za-z])/g, '$1 $2')
    .replace(/  +/g, ' ')
    .trim();
}

function detectCategory(text) {
  const keywords = [
    [/\bS3\b/i, 'S3'], [/\bEC2\b/i, 'EC2'], [/\bVPC\b/i, 'VPC'],
    [/\bIAM\b/i, 'IAM'], [/\bRDS\b/i, 'RDS'], [/\bLambda\b/i, 'Lambda'],
    [/\bCloudFront\b/i, 'CloudFront'], [/Route\s*53/i, 'Route53'],
    [/\bDynamoDB\b/i, 'DynamoDB'], [/\bSQS\b/i, 'SQS'], [/\bSNS\b/i, 'SNS'],
    [/\bECS\b/i, 'ECS'], [/\bEKS\b/i, 'EKS'], [/\bElastiCache\b/i, 'ElastiCache'],
    [/\bRedshift\b/i, 'Redshift'], [/\bCloudWatch\b/i, 'CloudWatch'],
    [/\bCloudTrail\b/i, 'CloudTrail'], [/\bKMS\b/i, 'KMS'],
    [/ELB|Load Balanc/i, 'ELB'], [/Auto Scal/i, 'Auto Scaling'],
    [/StorageGateway/i, 'Storage Gateway'], [/Glacier/i, 'S3 Glacier'],
    [/\bEFS\b/i, 'EFS'], [/\bEBS\b/i, 'EBS'],
    [/DirectConnect/i, 'Direct Connect'], [/DataSync/i, 'DataSync'],
    [/GlobalAccelerator|Global Accelerator/i, 'Global Accelerator'],
    [/GuardDuty/i, 'GuardDuty'], [/\bWAF\b/i, 'WAF'], [/Fargate/i, 'Fargate'],
    [/Cognito/i, 'Cognito'], [/Inspector/i, 'Inspector'], [/Macie/i, 'Macie'],
    [/EventBridge/i, 'EventBridge'], [/Snowball|Snowcone/i, 'Snow Family'],
  ];
  for (const [pattern, label] of keywords) {
    if (pattern.test(text)) return label;
  }
  return 'General';
}

// ──────────────────────────────────────────────
// 기출 형식 파서 (실전문제풀이 블록 방식)
// ──────────────────────────────────────────────
function parseBlock(rawBlock) {
  let text = rawBlock
    .replace(/QUESTION\s*\d+/g, '')
    .replace(/실전\s*문제풀이\s*\d*/g, '')
    .replace(/§PAGE§/g, '\n')
    .trim();

  if (!text) return null;

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const optStartRe = /^\(?([A-E])\)?[.\s]/;
  const answerLineRe = /^\(\s*(정답|X)/;

  let questionLines = [];
  let options = [];
  let curOpt = null;
  let state = 'question';

  for (const line of lines) {
    const optMatch = line.match(optStartRe);
    const isAnswerLine = answerLineRe.test(line);

    if (optMatch) {
      if (curOpt) options.push(curOpt);
      const letter = optMatch[1];
      const body = line.slice(optMatch[0].length);
      curOpt = { letter, textLines: [body], isCorrect: false, explanation: '' };
      state = 'option';
    } else if (isAnswerLine && curOpt) {
      const inner = line.replace(/^\(\s*/, '').replace(/\s*\)$/, '');
      curOpt.isCorrect = /^정답/.test(inner);
      const colonIdx = inner.indexOf(':');
      if (colonIdx >= 0) curOpt.explanation = inner.slice(colonIdx + 1).trim();
      state = 'answered';
    } else if (state === 'question') {
      questionLines.push(line);
    } else if (state === 'option' && curOpt) {
      curOpt.textLines.push(line);
    }
  }

  if (curOpt) options.push(curOpt);
  if (options.length < 2) return null;

  const correctOpts = options.filter(o => o.isCorrect);
  if (correctOpts.length === 0) return null;

  const question = fixSpacing(questionLines.join(' '));
  if (!question) return null;

  const answer = correctOpts.map(o => o.letter).join('');
  const explanation = options
    .filter(o => o.explanation)
    .map(o => `${o.isCorrect ? '✓' : '✗'} ${o.letter}. ${fixSpacing(o.explanation)}`)
    .join('\n');

  const formattedOptions = options.map(o => fixSpacing(`${o.letter}. ${o.textLines.join(' ')}`));
  const category = detectCategory(question + ' ' + formattedOptions.join(' '));

  return { question, options: formattedOptions, answer, explanation, category };
}

// ──────────────────────────────────────────────
// 인프런 형식 파서 (문제N / 해설 구조)
// ──────────────────────────────────────────────
function parseInfreanQuestion(qRaw, eRaw) {
  // 텍스트 정규화: 줄바꿈 → 공백, 중복공백 제거
  const qFlat = qRaw.replace(/§PAGE§/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  const eFlat = eRaw.replace(/§PAGE§/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // ── 보기 분리 ──
  // 보기는 .?! 뒤에 바로 A. B. C. D. 등이 오는 패턴
  const parts = qFlat.split(/(?<=[.?!])\s*([A-E])\.\s*/);
  // parts = [questionText, 'A', 'optA', 'B', 'optB', ...]

  if (parts.length < 5) return null; // 최소 질문 + 4보기

  const questionText = fixSpacing(parts[0].trim());
  if (!questionText) return null;

  const options = [];
  for (let i = 1; i < parts.length - 1; i += 2) {
    const letter = parts[i];
    const text = fixSpacing(parts[i + 1].trim());
    if (letter && /^[A-E]$/.test(letter) && text) {
      options.push({ letter, text: `${letter}. ${text}`, isCorrect: false, explanation: '' });
    }
  }

  if (options.length < 2) return null;

  // ── 해설 파싱 ──
  let answer = '';

  if (eFlat) {
    const noHaeseol = eFlat.replace(/^해설\s*/, '');

    // 정답 추출: "정답 분석 (B):" 또는 "정답 분석 (A, C):"
    const ansMatch = noHaeseol.match(/정답\s*분석\s*\(([A-E](?:[,\s]+[A-E])*)\)/);
    if (ansMatch) {
      answer = ansMatch[1].replace(/[^A-E]/g, ''); // "A, C" → "AC"
    }

    // 정답 보기 해설 추출 (정답 분석 (X): ... 오답 분석: 사이)
    const correctExpMatch = noHaeseol.match(/정답\s*분석\s*\([^)]+\)\s*:(.+?)(?=오답\s*분석\s*:|$)/s);
    const correctExp = correctExpMatch
      ? fixSpacing(correctExpMatch[1].replace(/^[•·]\s*/, '').trim())
      : '';

    // 오답 해설 추출: "• (A) text"
    const wrongSection = noHaeseol.split(/오답\s*분석\s*:/)[1] || '';
    const wrongParts = wrongSection.split(/[•·]\s*(?=\([A-E]\))/);
    const wrongExpMap = {};
    for (const part of wrongParts) {
      const m = part.match(/^\(([A-E])\)\s*([\s\S]+)/);
      if (m) wrongExpMap[m[1]] = fixSpacing(m[2].trim());
    }

    // 각 보기에 해설 배정
    for (const opt of options) {
      const isCorrect = answer.includes(opt.letter);
      opt.isCorrect = isCorrect;
      if (isCorrect) {
        opt.explanation = correctExp;
      } else if (wrongExpMap[opt.letter]) {
        opt.explanation = wrongExpMap[opt.letter];
      }
    }
  }

  if (!answer) return null;

  const explanation = options
    .filter(o => o.explanation)
    .map(o => `${o.isCorrect ? '✓' : '✗'} ${o.letter}. ${o.explanation}`)
    .join('\n');

  const formattedOptions = options.map(o => o.text);
  const category = detectCategory(questionText + ' ' + formattedOptions.join(' '));

  return { question: questionText, options: formattedOptions, answer, explanation, category };
}

function parseInfreanText(text) {
  // "문제 N"으로 분리
  const blocks = text.split(/문제\s*\d+/).filter(b => b.trim().length > 5);

  const questions = [];
  for (const block of blocks) {
    // 해설 시작 위치 기준으로 문제/해설 분리
    const explIdx = block.search(/해설|정답\s*분석/);
    const qRaw = explIdx >= 0 ? block.slice(0, explIdx) : block;
    const eRaw = explIdx >= 0 ? block.slice(explIdx) : '';

    const q = parseInfreanQuestion(qRaw, eRaw);
    if (q) questions.push(q);
  }

  return questions;
}

// ──────────────────────────────────────────────
// 메인
// ──────────────────────────────────────────────
async function main() {
  const pdfPath = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');
  const clear = process.argv.includes('--clear');
  const setIdx = process.argv.indexOf('--set');
  const examSet = setIdx !== -1 ? process.argv[setIdx + 1] : '1차 기출';

  if (!pdfPath) {
    console.error('사용법: node scripts/import-pdf.js <PDF경로> --set "1차 기출" [--dry-run] [--clear]');
    process.exit(1);
  }

  console.log(`📂 기출 세트: ${examSet}`);
  console.log(`📄 PDF 읽는 중: ${path.basename(pdfPath)}`);
  const text = await extractTextFromPDF(path.resolve(pdfPath));
  console.log(`   텍스트 추출 완료 (${text.length}자)`);

  console.log('🔍 문제 파싱 중...');

  // 형식 자동 감지
  const isInfrean = /문제\s*\d+/.test(text);
  let questions = [];

  if (isInfrean) {
    console.log('   → 인프런 형식 감지');
    questions = parseInfreanText(text);
  } else {
    console.log('   → 기출 형식 감지');
    const blocks = text.split(/실전\s*문제풀이\s*\d*/).filter(b => b.trim());
    for (const block of blocks) {
      const q = parseBlock(block);
      if (q) questions.push(q);
    }
  }

  console.log(`✅ ${questions.length}개 문제 파싱 완료\n`);

  if (questions.length === 0) {
    console.error('❌ 파싱된 문제가 없습니다.');
    process.exit(1);
  }

  console.log('=== 파싱 결과 미리보기 (처음 3문제) ===');
  for (const q of questions.slice(0, 3)) {
    console.log(`Q: ${q.question.slice(0, 80)}`);
    console.log(`   보기1: ${q.options[0].slice(0, 70)}`);
    console.log(`   정답: ${q.answer} | 카테고리: ${q.category}`);
    console.log(`   해설: ${q.explanation.slice(0, 80) || '(없음)'}`);
    console.log('');
  }

  const multiAnswerQs = questions.filter(q => q.answer.length > 1);
  if (multiAnswerQs.length > 0) {
    console.log(`⚠️  다중정답 문제 ${multiAnswerQs.length}개: ${multiAnswerQs.map(q => q.answer).join(', ')}\n`);
  }

  if (dryRun) {
    console.log('🔍 --dry-run 모드: DB에 저장하지 않습니다.');
    return;
  }

  if (clear) {
    console.log('🗑️  기존 문제 삭제 중...');
    const { error: delErr } = await supabase.from('questions').delete().eq('exam_set', examSet);
    if (delErr) {
      console.error('❌ 삭제 실패:', delErr.message);
      process.exit(1);
    }
    console.log('   삭제 완료\n');
  }

  console.log('💾 Supabase에 저장 중...');
  const { error } = await supabase.from('questions').insert(
    questions.map(q => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      category: q.category,
      exam_set: examSet,
    }))
  );

  if (error) {
    console.error('❌ 저장 실패:', error.message);
    process.exit(1);
  }

  console.log(`🎉 ${questions.length}개 문제 저장 완료!`);
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
