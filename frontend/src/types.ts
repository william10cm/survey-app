export interface Survey {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isPublished: boolean;
}

export interface Question {
  id: string;
  surveyId: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'yes_no';
  options?: string[];
  required: boolean;
  order: number;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface Response {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Answer[];
}