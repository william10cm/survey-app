import { api } from './client';
import type { Survey, Question, Response } from '../../../shared/src/types';

export const surveysApi = {
  list: () =>
    api.get<Survey[]>('/surveys').then(r => r.data),

  get: (id: string) =>
    api.get<Survey>(`/surveys/${id}`).then(r => r.data),

  create: (data: { title: string; description?: string }) =>
    api.post<Survey>('/surveys', data).then(r => r.data),

  update: (id: string, data: Partial<Survey>) =>
    api.put<Survey>(`/surveys/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/surveys/${id}`).then(r => r.data),

  getQuestions: (surveyId: string) =>
    api.get<Question[]>(`/surveys/${surveyId}/questions`).then(r => r.data),

  createQuestion: (surveyId: string, data: Omit<Question, 'id' | 'surveyId'>) =>
    api.post<Question>(`/surveys/${surveyId}/questions`, data).then(r => r.data),

  deleteQuestion: (surveyId: string, questionId: string) =>
    api.delete(`/surveys/${surveyId}/questions/${questionId}`).then(r => r.data),

  submitResponse: (surveyId: string, data: { answers: Response['answers'] }) =>
    api.post(`/surveys/${surveyId}/responses`, data).then(r => r.data),

  getResponses: (surveyId: string) =>
    api.get(`/surveys/${surveyId}/responses`).then(r => r.data),
};