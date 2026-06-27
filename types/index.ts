export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
  exam_set: string;
  created_at: string;
}

export interface UserAnswer {
  questionId: number;
  selected: string;
  isCorrect: boolean;
}

export interface QuizSession {
  questions: Question[];
  userAnswers: UserAnswer[];
  mode: string;
  completedAt: string;
}

export interface ConceptPDF {
  id: number;
  title: string;
  filename: string;
  description: string;
  created_at: string;
}
