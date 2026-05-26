import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useQuestions, useSubmitResponse } from '../hooks/useSurveys';
import type { Question } from '../types';

export default function ResponseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: survey } = useSurvey(id!);
  const { data: questions } = useQuestions(id!);
  const submitResponse = useSubmitResponse(id!);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = (questionId: string, value: string | string[] | number) =>
    setAnswers(prev => ({ ...prev, [questionId]: value }));

  const handleSubmit = async () => {
    const payload = {
      answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
    };
    await submitResponse.mutateAsync(payload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2>Thank you for your response!</h2>
        <button onClick={() => navigate('/')} style={btnStyle('#2563eb')}>Back to surveys</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1>{survey?.title}</h1>
      {survey?.description && <p style={{ color: '#6b7280' }}>{survey.description}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        {questions?.map((q: Question) => (
          <QuestionField key={q.id} question={q}
            value={answers[q.id]}
            onChange={val => setAnswer(q.id, val)} />
        ))}
      </div>

      <button onClick={handleSubmit} disabled={submitResponse.isPending}
        style={{ ...btnStyle('#2563eb'), marginTop: '2rem', padding: '0.75rem 2rem', fontSize: '1rem' }}>
        {submitResponse.isPending ? 'Submitting...' : 'Submit response'}
      </button>
    </div>
  );
}

function QuestionField({ question, value, onChange }: {
  question: Question;
  value: string | string[] | number | undefined;
  onChange: (val: string | string[] | number) => void;
}) {
  return (
    <div>
      <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
        {question.text}
        {question.required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>

      {question.type === 'text' && (
        <textarea rows={3} value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }} />
      )}

      {question.type === 'rating' && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => onChange(n)}
              style={{ ...btnStyle(value === n ? '#2563eb' : '#e5e7eb'),
                color: value === n ? '#fff' : '#111', width: 44, height: 44 }}>
              {n}
            </button>
          ))}
        </div>
      )}

      {question.type === 'yes_no' && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['Yes', 'No'].map(opt => (
            <button key={opt} onClick={() => onChange(opt)}
              style={{ ...btnStyle(value === opt ? '#2563eb' : '#e5e7eb'),
                color: value === opt ? '#fff' : '#111', padding: '0.5rem 1.5rem' }}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {question.options?.map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name={question.id} value={opt}
                checked={value === opt} onChange={() => onChange(opt)} />
              {opt}
            </label>
          ))}
        </div>
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