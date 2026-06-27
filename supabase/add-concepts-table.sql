-- concepts 테이블 추가
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run

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
