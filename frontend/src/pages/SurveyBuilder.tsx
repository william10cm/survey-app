import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useQuestions, useCreateQuestion, useUpdateSurvey } from '../hooks/useSurveys';
import type { Question } from '../types';
import './SurveyBuilder.css';

const QUESTION_TYPES = [
  { value: 'text', label: 'Text answer' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'yes_no', label: 'Yes / No' },
];

export default function SurveyBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: survey } = useSurvey(id!);
  const { data: questions } = useQuestions(id!);
  const updateSurvey = useUpdateSurvey(id!);
  const createQuestion = useCreateQuestion(id!);

  const [newQ, setNewQ] = useState({ text: '', type: 'text', required: false, options: '' });
  const [addingQ, setAddingQ] = useState(false);

  const handlePublish = () =>
    updateSurvey.mutate(
      { isPublished: !survey?.isPublished },
      { onError: (err) => alert(`Failed to update survey: ${err.message}`) }
    );

  const handleAddQuestion = async () => {
    if (!newQ.text.trim()) return;
    try {
      await createQuestion.mutateAsync({
        text: newQ.text.trim(),
        type: newQ.type as Question['type'],
        required: newQ.required,
        options: (newQ.type === 'multiple_choice' || newQ.type === 'checkbox')
          ? newQ.options.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        order: (questions?.length ?? 0) + 1,
      });
      setNewQ({ text: '', type: 'text', required: false, options: '' });
      setAddingQ(false);
    } catch (err) {
      alert(`Failed to add question: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="survey-builder-page">
      <button className="survey-builder-back" onClick={() => navigate('/')}>
        ← Back to surveys
      </button>

      <div className="survey-builder-header">
        <h1 className="survey-builder-title">{survey?.title ?? 'Loading...'}</h1>
        <button
          className={survey?.isPublished ? 'survey-builder-btn survey-builder-btn--muted' : 'survey-builder-btn survey-builder-btn--success'}
          onClick={handlePublish}
        >
          {survey?.isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <h2 className="survey-builder-subtitle">Questions ({questions?.length ?? 0})</h2>

      <div className="survey-builder-question-list">
        {questions?.map((q: Question, i: number) => (
          <div key={q.id} className="survey-builder-question-item">
            <div className="survey-builder-question-text">{i + 1}. {q.text}</div>
            <div className="survey-builder-question-meta">
              {QUESTION_TYPES.find(t => t.value === q.type)?.label}
              {q.required && ' · Required'}
              {q.options && ` · Options: ${q.options.join(', ')}`}
            </div>
          </div>
        ))}
      </div>

      {addingQ ? (
        <div className="survey-builder-form">
          <input
            autoFocus
            placeholder="Question text"
            value={newQ.text}
            onChange={e => setNewQ(p => ({ ...p, text: e.target.value }))}
            className="survey-builder-input"
          />
          <select
            value={newQ.type}
            onChange={e => setNewQ(p => ({ ...p, type: e.target.value }))}
            className="survey-builder-input"
          >
            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {(newQ.type === 'multiple_choice' || newQ.type === 'checkbox') && (
            <input
              placeholder="Options (comma-separated)"
              value={newQ.options}
              onChange={e => setNewQ(p => ({ ...p, options: e.target.value }))}
              className="survey-builder-input"
            />
          )}
          <label className="survey-builder-required">
            <input
              type="checkbox"
              checked={newQ.required}
              onChange={e => setNewQ(p => ({ ...p, required: e.target.checked }))}
            />
            Required
          </label>
          <div className="survey-builder-actions">
            <button className="survey-builder-btn survey-builder-btn--primary" onClick={handleAddQuestion}>Add question</button>
            <button className="survey-builder-btn survey-builder-btn--muted" onClick={() => setAddingQ(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="survey-builder-btn survey-builder-btn--primary" onClick={() => setAddingQ(true)}>+ Add question</button>
      )}
    </div>
  );
}