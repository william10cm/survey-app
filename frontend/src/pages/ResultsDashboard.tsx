import { useParams, useNavigate } from 'react-router-dom';
import { useSurvey, useQuestions, useResponses } from '../hooks/useSurveys';
import type { Question } from '../types';
import './ResultsDashboard.css';

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
    <div className="results-page">
      <button className="results-back" onClick={() => navigate('/')}>
        ← Back to surveys
      </button>
      <h1>{survey?.title} — Results</h1>
      <p className="results-total">{responses?.length ?? 0} responses total</p>

      <div className="results-list">
        {questions?.map((q: Question) => {
          const answers = getAnswersForQuestion(q.id);
          return (
            <div key={q.id} className="results-card">
              <h3 className="results-card-title">{q.text}</h3>
              <QuestionResults question={q} answers={answers} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionResults({ question, answers }: { question: Question; answers: any[] }) {
  if (answers.length === 0) return <p className="results-empty">No answers yet.</p>;

  if (question.type === 'text') {
    return (
      <div className="results-text-list">
        {answers.map((a, i) => (
          <div key={i} className="results-text-item">
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
        <div className="results-average">Average: {avg} / 5</div>
        {counts.map(({ n, count }) => (
          <div key={n} className="results-row">
            <span className="results-index">{n}</span>
            <progress className="results-progress results-progress--rating" value={count} max={answers.length} />
            <span className="results-count">{count}</span>
          </div>
        ))}
      </div>
    );
  }

  // multiple_choice, checkbox, and yes_no — count occurrences
  const normalizedAnswers = answers.flatMap(a => Array.isArray(a) ? a : [a]);
  const counts = [...new Set(normalizedAnswers)].map(opt => ({
    opt,
    count: normalizedAnswers.filter(a => a === opt).length,
  }));
  return (
    <div>
      {counts.map(({ opt, count }) => (
        <div key={opt} className="results-row">
          <span className="results-option">{opt}</span>
          <progress className="results-progress results-progress--choice" value={count} max={normalizedAnswers.length} />
          <span className="results-count">{count}</span>
        </div>
      ))}
    </div>
  );
}