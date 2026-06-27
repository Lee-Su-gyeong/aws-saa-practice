/**
 * 개념 PDF 등록 스크립트
 * 사용법: node scripts/register-concept.js <PDF경로> "제목" ["설명"]
 *
 * PDF 파일을 public/concepts/ 폴더에 복사하고 Supabase에 등록합니다.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const conceptsDir = path.resolve(__dirname, '../public/concepts');

async function main() {
  const [, , pdfPath, title, description = ''] = process.argv;

  if (!pdfPath || !title) {
    console.error('사용법: node scripts/register-concept.js <PDF경로> "제목" ["설명"]');
    process.exit(1);
  }

  const absPath = path.resolve(pdfPath);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ 파일 없음: ${absPath}`);
    process.exit(1);
  }

  // public/concepts 디렉토리 생성
  if (!fs.existsSync(conceptsDir)) {
    fs.mkdirSync(conceptsDir, { recursive: true });
  }

  const filename = path.basename(absPath);
  const dest = path.join(conceptsDir, filename);

  // 파일 복사
  fs.copyFileSync(absPath, dest);
  console.log(`📁 복사 완료: public/concepts/${filename}`);

  // DB 등록 (중복이면 업데이트)
  const { data: existing } = await supabase
    .from('concepts')
    .select('id')
    .eq('filename', filename)
    .single();

  if (existing) {
    await supabase
      .from('concepts')
      .update({ title, description })
      .eq('id', existing.id);
    console.log(`✏️  업데이트: "${title}"`);
  } else {
    const { error } = await supabase
      .from('concepts')
      .insert({ title, filename, description });
    if (error) {
      console.error('❌ DB 등록 실패:', error.message);
      process.exit(1);
    }
    console.log(`✅ 등록 완료: "${title}"`);
  }
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
