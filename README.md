# AWS SAA 문제풀이 앱

AWS Solutions Architect Associate 자격증 문제풀이 웹앱입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **DB**: Supabase (PostgreSQL)
- **배포**: Vercel

---

## 1. Supabase 설정

### 1-1. 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 접속 → 로그인 → **New Project**
2. 프로젝트 이름, 비밀번호 설정 후 생성 (약 1~2분 소요)

### 1-2. questions 테이블 생성

Supabase 대시보드 → **SQL Editor** → 아래 SQL 실행:

```sql
create table questions (
  id          bigint generated always as identity primary key,
  question    text not null,
  options     jsonb not null,
  answer      varchar(1) not null,
  explanation text,
  category    varchar(50),
  created_at  timestamptz default now()
);

-- 전체 공개 읽기 허용 (로그인 불필요)
alter table questions enable row level security;
create policy "public read" on questions for select using (true);
```

### 1-3. API 키 확인

**Project Settings → API** 에서:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (PDF 임포트 전용, 절대 노출 금지)

---

## 2. 로컬 개발 환경 설정

```bash
# 패키지 설치
npm install

# 환경변수 파일 생성
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase 키 입력
```

### .env.local 예시

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
# 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## 3. PDF 문제 임포트

### PDF 형식 (각 문제가 아래 형식이어야 합니다)

```
1. Which service provides managed Kubernetes?
A. ECS
B. EKS
C. ECR
D. Fargate
Answer: B
Explanation: Amazon EKS is a managed Kubernetes service.

2. What does S3 stand for?
...
```

### 임포트 실행

```bash
npm run import-pdf -- ./my-questions.pdf
```

성공 시 콘솔에 `🎉 N개 문제가 저장되었습니다!` 출력.

---

## 4. Vercel 배포

### 4-1. GitHub에 코드 Push

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/<유저명>/<레포명>.git
git push -u origin main
```

### 4-2. Vercel에서 배포

1. [https://vercel.com](https://vercel.com) → **Add New Project**
2. GitHub 레포 선택
3. **Environment Variables** 탭에서 아래 두 개 추가:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

> `SUPABASE_SERVICE_ROLE_KEY`는 Vercel에 넣지 마세요 (로컬 스크립트 전용).

4. **Deploy** 클릭

---

## 5. 화면 구성

| 경로 | 설명 |
|------|------|
| `/` | 홈 — 전체/오답 풀기 버튼 |
| `/quiz?mode=all` | 전체 문제 랜덤 풀기 |
| `/quiz?mode=wrong` | 오답 문제만 풀기 |
| `/results` | 결과 화면 |

---

## 6. 오답 관리 방식

- 로그인 없이 브라우저 `localStorage` 사용
- 오답 → `aws_saa_wrong_answers` 키에 `[id, ...]` 형태로 저장
- 정답 맞추면 자동으로 오답 목록에서 제거

---

## 파일 구조

```
app/
  layout.tsx       # 루트 레이아웃
  page.tsx         # 홈
  globals.css
  quiz/
    page.tsx       # 문제 풀기
  results/
    page.tsx       # 결과
components/
  QuestionCard.tsx # 문제 카드 (보기 선택 + 해설)
  OptionButton.tsx # 보기 버튼
lib/
  supabase.ts      # Supabase 클라이언트 + 쿼리 함수
  localStorage.ts  # 오답 관리
scripts/
  import-pdf.ts    # PDF → Supabase 임포트 스크립트
types/
  index.ts         # TypeScript 타입 정의
```
