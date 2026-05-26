import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useQuestions, useResponses } from '../hooks/useSurveys';
import type { Question } from '../types';

export default function ResultsDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: survey } = useSurvey(id!);
  const { data: questions } = useQuestions(id!);
  const { data: responses } = useResponses(id!);

  const getAnswersForQuestion = (questionId: string) =>
    (responses ?? []).flatMap((r: any) =>
      r.answers.filter((a: any) => a.questionId === questionId).map((a: any) => a.value)
    );

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>
        ← Back to surveys
      </button>
      <h1>{survey?.title} — Results</h1>
      <p style={{ color: '#6b7280' }}>{responses?.length ?? 0} responses total</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem' }}>
        {questions?.map((q: Question) => {
          const answers = getAnswersForQuestion(q.id);
          return (
            <div key={q.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 1rem' }}>{q.text}</h3>
              <QuestionResults question={q} answers={answers} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionResults({ question, answers }: { question: Question; answers: any[] }) {
  if (answers.length === 0) return <p style={{ color: '#9ca3af' }}>No answers yet.</p>;

  if (question.type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {answers.map((a, i) => (
          <div key={i} style={{ padding: '0.5rem 0.75rem', background: '#f9fafb', borderRadius: 6, fontSize: '0.9rem' }}>
            {a}
          </div>
        ))}
      </div>
    );
  }

  if (question.type === 'rating') {
    const avg = (answers.reduce((s, a) => s + Number(a), 0) / answers.length).toFixed(1);
    const counts = [1,2,3,4,5].map(n => ({ n, count: answers.filter(a => Number(a) === n).length }));
    return (
      <div>
        <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Average: {avg} / 5</div>
        {counts.map(({ n, count }) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ width: 20 }}>{n}</span>
            <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 4, height: 20 }}>
              <div style={{ width: `${(count / answers.length) * 100}%`, background: '#2563eb', height: '100%', borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{count}</span>
          </div>
        ))}
      </div>
    );
  }

  // multiple_choice and yes_no — count occurrences
  const counts = [...new Set(answers)].map(opt => ({
    opt, count: answers.filter(a => a === opt).length,
  }));
  return (
    <div>
      {counts.map(({ opt, count }) => (
        <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span style={{ width: 60, fontSize: '0.9rem' }}>{opt}</span>
          <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 4, height: 20 }}>
            <div style={{ width: `${(count / answers.length) * 100}%`, background: '#059669', height: '100%', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{count}</span>
        </div>
      ))}
    </div>
  );
}