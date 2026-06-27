import { supabase } from './supabase';
import { ConceptPDF } from '@/types';

export async function getAllConcepts(): Promise<ConceptPDF[]> {
  const { data, error } = await supabase
    .from('concepts')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data as ConceptPDF[]) ?? [];
}

export async function getConceptById(id: number): Promise<ConceptPDF | null> {
  const { data, error } = await supabase
    .from('concepts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as ConceptPDF;
}
