import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveys, useCreateSurvey, useDeleteSurvey } from '../hooks/useSurveys';
import type { Survey } from '../types';

export default function SurveyList() {
  const navigate = useNavigate();
  const { data: surveys, isLoading } = useSurveys();
  const createSurvey = useCreateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const survey = await createSurvey.mutateAsync({ title: newTitle.trim() });
      setNewTitle('');
      setCreating(false);
      navigate(`/surveys/${survey.id}/edit`);
    } catch (err) {
      alert(`Failed to create survey: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this survey?')) return;
    try {
      await deleteSurvey.mutateAsync(id);
    } catch (err) {
      alert(`Failed to delete survey: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (isLoading) return <p>Loading surveys...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>My Surveys</h1>
        <button onClick={() => setCreating(true)} style={btnStyle('#2563eb')}>
          + New Survey
        </button>
      </div>

      {creating && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <input
            autoFocus
            placeholder="Survey title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            style={inputStyle}
          />
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCreate} style={btnStyle('#2563eb')}>Create</button>
            <button onClick={() => setCreating(false)} style={btnStyle('#6b7280')}>Cancel</button>
          </div>
        </div>
      )}

      {surveys?.length === 0 && <p style={{ color: '#6b7280' }}>No surveys yet. Create one above.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {surveys?.map((survey: Survey) => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            onEdit={() => navigate(`/surveys/${survey.id}/edit`)}
            onRespond={() => navigate(`/surveys/${survey.id}/respond`)}
            onResults={() => navigate(`/surveys/${survey.id}/results`)}
            onDelete={() => handleDelete(survey.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SurveyCard({ survey, onEdit, onRespond, onResults, onDelete }: {
  survey: Survey;
  onEdit: () => void;
  onRespond: () => void;
  onResults: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 600 }}>{survey.title}</div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 2 }}>
          {survey.isPublished ? '🟢 Published' : '⚪ Draft'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onEdit}    style={btnStyle('#2563eb')}>Edit</button>
        <button onClick={onRespond} style={btnStyle('#059669')}>Respond</button>
        <button onClick={onResults} style={btnStyle('#7c3aed')}>Results</button>
        <button onClick={onDelete}  style={btnStyle('#dc2626')}>Delete</button>
      </div>
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