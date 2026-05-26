import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useQuestions, useCreateQuestion, useUpdateSurvey } from '../hooks/useSurveys';
import type { Question } from '../types';

const QUESTION_TYPES = [
  { value: 'text', label: 'Text answer' },
  { value: 'multiple_choice', label: 'Multiple choice' },
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
        options: newQ.type === 'multiple_choice'
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
    <div>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
        ← Back to surveys
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>{survey?.title ?? 'Loading...'}</h1>
        <button onClick={handlePublish} style={btnStyle(survey?.isPublished ? '#6b7280' : '#059669')}>
          {survey?.isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Questions ({questions?.length ?? 0})</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {questions?.map((q: Question, i: number) => (
          <div key={q.id} style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div style={{ fontWeight: 500 }}>{i + 1}. {q.text}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>
              {QUESTION_TYPES.find(t => t.value === q.type)?.label}
              {q.required && ' · Required'}
              {q.options && ` · Options: ${q.options.join(', ')}`}
            </div>
          </div>
        ))}
      </div>

      {addingQ ? (
        <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: '1rem' }}>
          <input
            autoFocus placeholder="Question text"
            value={newQ.text} onChange={e => setNewQ(p => ({ ...p, text: e.target.value }))}
            style={{ ...inputStyle, marginBottom: '0.75rem' }}
          />
          <select value={newQ.type} onChange={e => setNewQ(p => ({ ...p, type: e.target.value }))}
            style={{ ...inputStyle, marginBottom: '0.75rem' }}>
            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {newQ.type === 'multiple_choice' && (
            <input placeholder="Options (comma-separated)"
              value={newQ.options} onChange={e => setNewQ(p => ({ ...p, options: e.target.value }))}
              style={{ ...inputStyle, marginBottom: '0.75rem' }} />
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input type="checkbox" checked={newQ.required}
              onChange={e => setNewQ(p => ({ ...p, required: e.target.checked }))} />
            Required
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAddQuestion} style={btnStyle('#2563eb')}>Add question</button>
            <button onClick={() => setAddingQ(false)} style={btnStyle('#6b7280')}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingQ(true)} style={btnStyle('#2563eb')}>+ Add question</button>
      )}
    </div>
  );
}

const btnStyle = (bg: string) => ({
  background: bg, color: '#fff', border: 'none',
  padding: '0.4rem 0.9rem', borderRadius: 6,
  cursor: 'pointer', fontSize: '0.875rem',
});

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db', borderRadius: 6,
  fontSize: '1rem', boxSizing: 'border-box',
};