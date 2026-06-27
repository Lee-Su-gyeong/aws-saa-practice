import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ParsedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
}

/**
 * PDF 텍스트에서 문제를 파싱합니다.
 *
 * 지원 형식 예시:
 * --------------------------------------------------
 * 1. Which service provides managed Kubernetes?
 * A. ECS
 * B. EKS
 * C. ECR
 * D. Fargate
 * Answer: B
 * Explanation: Amazon EKS is a managed Kubernetes service.
 * --------------------------------------------------
 *
 * Answer/Correct Answer/정답: 모두 인식
 * Explanation/해설: 모두 인식
 */
function parseQuestions(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  // 문제 블록 분리: 번호. 로 시작하는 덩어리
  const blocks = text.split(/\n(?=\d+[\.\)]\s)/).filter((b) => b.trim().length > 0);

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 5) continue;

    // 문제 텍스트: 첫 번째 줄(번호 제거)
    const questionLine = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
    if (!questionLine) continue;

    // 보기: A. / B. / C. / D. 로 시작하는 줄
    const options: string[] = [];
    let answerLine = '';
    let explanationLines: string[] = [];
    let inExplanation = false;

    for (let i = 1; i < lines.length; i++) {
      const l = lines[i];

      if (/^[A-D][\.\)]\s/.test(l)) {
        options.push(l);
        continue;
      }

      if (/^(Answer|Correct Answer|정답)\s*[:：]\s*/i.test(l)) {
        answerLine = l.replace(/^(Answer|Correct Answer|정답)\s*[:：]\s*/i, '').trim();
        continue;
      }

      if (/^(Explanation|해설)\s*[:：]\s*/i.test(l)) {
        inExplanation = true;
        const rest = l.replace(/^(Explanation|해설)\s*[:：]\s*/i, '').trim();
        if (rest) explanationLines.push(rest);
        continue;
      }

      if (inExplanation) {
        explanationLines.push(l);
      }
    }

    if (options.length < 2 || !answerLine) continue;

    // 정답 문자 추출 (A, B, C, D 중 하나)
    const answerMatch = answerLine.match(/^[A-D]/i);
    if (!answerMatch) continue;
    const answer = answerMatch[0].toUpperCase();

    // 카테고리: 문제 텍스트에서 AWS 서비스 키워드 추출
    const category = detectCategory(questionLine);

    questions.push({
      question: questionLine,
      options,
      answer,
      explanation: explanationLines.join(' ').trim(),
      category,
    });
  }

  return questions;
}

function detectCategory(text: string): string {
  const keywords: [RegExp, string][] = [
    [/\bS3\b/i, 'S3'],
    [/\bEC2\b/i, 'EC2'],
    [/\bVPC\b/i, 'VPC'],
    [/\bIAM\b/i, 'IAM'],
    [/\bRDS\b/i, 'RDS'],
    [/\bLambda\b/i, 'Lambda'],
    [/\bCloudFront\b/i, 'CloudFront'],
    [/\bRoute\s*53\b/i, 'Route53'],
    [/\bDynamoDB\b/i, 'DynamoDB'],
    [/\bSQS\b/i, 'SQS'],
    [/\bSNS\b/i, 'SNS'],
    [/\bECS\b/i, 'ECS'],
    [/\bEKS\b/i, 'EKS'],
    [/\bElastiCache\b/i, 'ElastiCache'],
    [/\bRedshift\b/i, 'Redshift'],
    [/\bCloudWatch\b/i, 'CloudWatch'],
    [/\bCloudTrail\b/i, 'CloudTrail'],
    [/\bKMS\b/i, 'KMS'],
    [/\bELB|Load Balanc/i, 'ELB'],
    [/\bAuto Scal/i, 'Auto Scaling'],
    [/\bStorageGateway\b/i, 'Storage Gateway'],
    [/\bGlacier\b/i, 'S3 Glacier'],
    [/\bEFS\b/i, 'EFS'],
    [/\bEBS\b/i, 'EBS'],
  ];

  for (const [pattern, label] of keywords) {
    if (pattern.test(text)) return label;
  }
  return 'General';
}

async function importPdf(filePath: string) {
  console.log(`📄 파일 읽기: ${filePath}`);
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  console.log('🔍 문제 파싱 중...');
  const questions = parseQuestions(data.text);
  console.log(`✅ 파싱 완료: ${questions.length}문제`);

  if (questions.length === 0) {
    console.error('❌ 파싱된 문제가 없습니다. PDF 형식을 확인하세요.');
    process.exit(1);
  }

  console.log('💾 Supabase에 저장 중...');
  const { error } = await supabase.from('questions').insert(
    questions.map((q) => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      category: q.category,
    }))
  );

  if (error) {
    console.error('❌ 저장 실패:', error.message);
    process.exit(1);
  }

  console.log(`🎉 ${questions.length}개 문제가 저장되었습니다!`);
}

// 실행
const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('사용법: npx ts-node --project tsconfig.scripts.json scripts/import-pdf.ts <PDF 파일 경로>');
  process.exit(1);
}

importPdf(path.resolve(pdfPath));
