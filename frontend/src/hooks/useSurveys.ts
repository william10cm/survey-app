import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surveysApi } from '../api/survey';

export const useSurveys = () =>
  useQuery({ queryKey: ['surveys'], queryFn: surveysApi.list });

export const useSurvey = (id: string) =>
  useQuery({ queryKey: ['surveys', id], queryFn: () => surveysApi.get(id), enabled: !!id });

export const useQuestions = (surveyId: string) =>
  useQuery({ queryKey: ['questions', surveyId], queryFn: () => surveysApi.getQuestions(surveyId), enabled: !!surveyId });

export const useResponses = (surveyId: string) =>
  useQuery({ queryKey: ['responses', surveyId], queryFn: () => surveysApi.getResponses(surveyId), enabled: !!surveyId });

export const useCreateSurvey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: surveysApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }),
  });
};

export const useUpdateSurvey = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof surveysApi.update>[1]) => surveysApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys', id] }),
  });
};

export const useDeleteSurvey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: surveysApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }),
  });
};

export const useCreateQuestion = (surveyId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof surveysApi.createQuestion>[1]) =>
      surveysApi.createQuestion(surveyId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions', surveyId] }),
  });
};

export const useSubmitResponse = (surveyId: string) =>
  useMutation({
    mutationFn: (data: Parameters<typeof surveysApi.submitResponse>[1]) =>
      surveysApi.submitResponse(surveyId, data),
  });