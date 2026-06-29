import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSurvey, useQuestions, useSubmitResponse } from '../hooks/useSurveys';
import type { Question } from '../types';
import './ResponseForm.css';

export default function ResponseForm() {
  const { id } = useParams<{ id: string }>();
  const { data: survey } = useSurvey(id!);
  const { data: questions } = useQuestions(id!);
  const submitResponse = useSubmitResponse(id!);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      document.body.classList.add('response-submitted');
    } else {
      document.body.classList.remove('response-submitted');
    }

    return () => {
      document.body.classList.remove('response-submitted');
    };
  }, [submitted]);

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
      <div className="response-form-submitted">
        <div className="response-form-submitted-icon">✅</div>
        <h2>Thank you for your response!</h2>
      </div>
    );
  }

  return (
    <div className="response-form-page">
      <h1>{survey?.title}</h1>
      {survey?.description && <p className="response-form-description">{survey.description}</p>}

      <div className="response-form-fields">
        {questions?.map((q: Question) => (
          <QuestionField key={q.id} question={q}
            value={answers[q.id]}
            onChange={val => setAnswer(q.id, val)} />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitResponse.isPending}
        className="response-form-submit"
      >
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
  const checkboxValues = Array.isArray(value) ? value : [];

  return (
    <div className="response-form-question">
      <label className="response-form-label">
        {question.text}
        {question.required && <span className="response-form-required"> *</span>}
      </label>

      {question.type === 'text' && (
        <textarea
          rows={3}
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          className="response-form-textarea"
        />
      )}

      {question.type === 'rating' && (
        <div className="response-form-rating-row">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={value === n ? 'response-form-rating-btn response-form-rating-btn--active' : 'response-form-rating-btn'}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {question.type === 'yes_no' && (
        <div className="response-form-yesno-row">
          {['Yes', 'No'].map(opt => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={value === opt ? 'response-form-yesno-btn response-form-yesno-btn--active' : 'response-form-yesno-btn'}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.type === 'multiple_choice' && (
        <div className="response-form-options-column">
          {question.options?.map(opt => (
            <label key={opt} className="response-form-option-label">
              <input type="radio" name={question.id} value={opt}
                checked={value === opt} onChange={() => onChange(opt)} />
              {opt}
            </label>
          ))}
        </div>
      )}

      {question.type === 'checkbox' && (
        <div className="response-form-options-column">
          {question.options?.map(opt => (
            <label key={opt} className="response-form-option-label">
              <input
                type="checkbox"
                value={opt}
                checked={checkboxValues.includes(opt)}
                onChange={e => {
                  if (e.target.checked) {
                    onChange([...checkboxValues, opt]);
                  } else {
                    onChange(checkboxValues.filter(v => v !== opt));
                  }
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
