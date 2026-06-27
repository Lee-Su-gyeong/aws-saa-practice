import { createClient } from '@supabase/supabase-js';
import { Question } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllExamSets(): Promise<string[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('exam_set')
    .order('exam_set', { ascending: true });

  if (error) return [];
  const sets = [...new Set((data ?? []).map((r: { exam_set: string }) => r.exam_set))];
  return sets.filter(Boolean).sort();
}

export async function getAllQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Question[]) ?? [];
}

export async function getQuestionsBySet(examSet: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_set', examSet)
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Question[]) ?? [];
}

export async function getQuestionsByIds(ids: number[]): Promise<Question[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('id', ids);

  if (error) throw new Error(error.message);
  return (data as Question[]) ?? [];
}

export async function getCountBySet(): Promise<{ exam_set: string; count: number }[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('exam_set');

  if (error) return [];

  const countMap = new Map<string, number>();
  for (const row of data ?? []) {
    const s = row.exam_set ?? '미분류';
    countMap.set(s, (countMap.get(s) ?? 0) + 1);
  }

  const extractNum = (s: string) => parseInt(s.match(/\d+/)?.[0] ?? '0', 10);

  return [...countMap.entries()]
    .map(([exam_set, count]) => ({ exam_set, count }))
    .sort((a, b) => extractNum(a.exam_set) - extractNum(b.exam_set));
}

export async function getTotalCount(): Promise<number> {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count ?? 0;
}
