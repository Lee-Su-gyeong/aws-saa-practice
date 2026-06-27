const WRONG_ANSWERS_KEY = 'aws_saa_wrong_answers';

export function getWrongAnswerIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WRONG_ANSWERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addWrongAnswerId(id: number): void {
  const ids = getWrongAnswerIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(ids));
  }
}

export function removeWrongAnswerId(id: number): void {
  const ids = getWrongAnswerIds().filter((i) => i !== id);
  localStorage.setItem(WRONG_ANSWERS_KEY, JSON.stringify(ids));
}

export function clearWrongAnswers(): void {
  localStorage.removeItem(WRONG_ANSWERS_KEY);
}

export function getWrongAnswerCount(): number {
  return getWrongAnswerIds().length;
}
