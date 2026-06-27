-- AWS SAA 문제풀이 앱 Supabase 스키마
-- Supabase 대시보드 → SQL Editor → 이 파일 내용 붙여넣기 → Run

create table if not exists questions (
  id          bigint generated always as identity primary key,
  question    text not null,
  options     jsonb not null,
  answer      varchar(10) not null,
  explanation text,
  category    varchar(50),
  exam_set    varchar(100),
  created_at  timestamptz default now()
);

-- 로그인 없이 읽기 가능하도록 RLS 설정
alter table questions enable row level security;
create policy "public read" on questions for select using (true);
create policy "insert allowed" on questions for insert with check (true);
create policy "delete allowed" on questions for delete using (true);

-- ── 개념 공부 PDF ──────────────────────────────
create table if not exists concepts (
  id          bigint generated always as identity primary key,
  title       text not null,
  filename    text not null unique,
  description text,
  created_at  timestamptz default now()
);

alter table concepts enable row level security;
create policy "public read concepts" on concepts for select using (true);
create policy "insert concepts" on concepts for insert with check (true);
create policy "update concepts" on concepts for update using (true);
create policy "delete concepts" on concepts for delete using (true);
