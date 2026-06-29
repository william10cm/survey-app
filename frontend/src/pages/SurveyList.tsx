import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveys, useCreateSurvey, useDeleteSurvey } from '../hooks/useSurveys';
import heroImage from '../assets/survey-hero.png';
import type { Survey } from '../types';
import type { ReactNode } from 'react';
import './SurveyList.css';

type SurveyFilter = 'all' | 'published' | 'draft';

export default function SurveyList() {
  const navigate = useNavigate();
  const { data: surveys = [], isLoading, isError, error } = useSurveys();
  const createSurvey = useCreateSurvey();
  const deleteSurvey = useDeleteSurvey();
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<SurveyFilter>('all');

  const sortedSurveys = useMemo(
    () => [...surveys].sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt)),
    [surveys]
  );

  const filteredSurveys = useMemo(
    () =>
      sortedSurveys.filter((survey) => {
        if (filter === 'published') return survey.isPublished;
        if (filter === 'draft') return !survey.isPublished;
        return true;
      }),
    [filter, sortedSurveys]
  );

  const publishedCount = sortedSurveys.filter((survey) => survey.isPublished).length;
  const draftCount = sortedSurveys.length - publishedCount;

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;

    try {
      const survey = await createSurvey.mutateAsync({
        title,
        description: newDescription.trim() || undefined,
      });
      setNewTitle('');
      setNewDescription('');
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

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <p className="eyebrow">Survey workspace</p>
          <h1 id="home-title">Survey App</h1>
          <p className="home-hero__lead">
            Create polished surveys, publish response forms, and review results from one focused
            workspace.
          </p>
          <div className="home-hero__actions">
            <button className="button button--primary" onClick={() => setCreating(true)}>
              New survey
            </button>
            <a className="button button--secondary" href="#surveys">
              View surveys
            </a>
          </div>
        </div>

        <div className="home-hero__visual">
          <img src={heroImage} alt="Laptop showing survey responses and analytics" />
        </div>
      </section>

      <section className="stats-grid" aria-label="Survey overview">
        <StatCard label="Total surveys" value={isLoading ? '--' : sortedSurveys.length} />
        <StatCard label="Published" value={isLoading ? '--' : publishedCount} accent="teal" />
        <StatCard label="Drafts" value={isLoading ? '--' : draftCount} accent="amber" />
      </section>

      <section id="surveys" className="survey-workspace" aria-labelledby="surveys-title">
        <div className="section-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2 id="surveys-title">My Surveys</h2>
          </div>
          <button className="button button--primary" onClick={() => setCreating(true)}>
            New survey
          </button>
        </div>

        {creating && (
          <div className="create-panel">
            <div>
              <label htmlFor="survey-title">Survey title</label>
              <input
                id="survey-title"
                autoFocus
                placeholder="Customer onboarding feedback"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
              />
            </div>
            <div>
              <label htmlFor="survey-description">Description</label>
              <textarea
                id="survey-description"
                rows={3}
                placeholder="A short note for teammates or respondents"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
              />
            </div>
            <div className="create-panel__actions">
              <button
                className="button button--primary"
                onClick={handleCreate}
                disabled={!newTitle.trim() || createSurvey.isPending}
              >
                {createSurvey.isPending ? 'Creating...' : 'Create survey'}
              </button>
              <button
                className="button button--ghost"
                onClick={() => setCreating(false)}
                disabled={createSurvey.isPending}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="workspace-toolbar" aria-label="Survey filters">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </FilterButton>
          <FilterButton active={filter === 'published'} onClick={() => setFilter('published')}>
            Published
          </FilterButton>
          <FilterButton active={filter === 'draft'} onClick={() => setFilter('draft')}>
            Drafts
          </FilterButton>
        </div>

        {isLoading && <SurveySkeleton />}

        {isError && (
          <div className="empty-state" role="alert">
            <h3>Surveys could not load</h3>
            <p>{error instanceof Error ? error.message : 'Refresh the page and try again.'}</p>
          </div>
        )}

        {!isLoading && !isError && sortedSurveys.length === 0 && (
          <div className="empty-state">
            <h3>No surveys yet</h3>
            <p>Your first survey will appear here as soon as you create it.</p>
            <button className="button button--primary" onClick={() => setCreating(true)}>
              New survey
            </button>
          </div>
        )}

        {!isLoading && !isError && sortedSurveys.length > 0 && filteredSurveys.length === 0 && (
          <div className="empty-state">
            <h3>No {filter} surveys</h3>
            <p>Try a different status filter.</p>
          </div>
        )}

        {!isLoading && !isError && filteredSurveys.length > 0 && (
          <div className="survey-list">
            {filteredSurveys.map((survey) => (
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
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = 'blue',
}: {
  label: string;
  value: number | string;
  accent?: 'blue' | 'teal' | 'amber';
}) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={active ? 'filter-button filter-button--active' : 'filter-button'}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SurveyCard({
  survey,
  onEdit,
  onRespond,
  onResults,
  onDelete,
}: {
  survey: Survey;
  onEdit: () => void;
  onRespond: () => void;
  onResults: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="survey-card">
      <div className="survey-card__content">
        <div className="survey-meta">
          <span className={survey.isPublished ? 'status-pill status-pill--published' : 'status-pill'}>
            {survey.isPublished ? 'Published' : 'Draft'}
          </span>
          <span>{formatDate(survey.createdAt)}</span>
        </div>
        <h3>{survey.title}</h3>
        {survey.description && <p>{survey.description}</p>}
      </div>
      <div className="survey-card__actions" aria-label={`Actions for ${survey.title}`}>
        <button className="button button--small button--primary" onClick={onEdit}>
          Edit
        </button>
        <button className="button button--small button--success" onClick={onRespond}>
          Respond
        </button>
        <button className="button button--small button--secondary" onClick={onResults}>
          Results
        </button>
        <button className="button button--small button--danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

function SurveySkeleton() {
  return (
    <div className="survey-list" aria-label="Loading surveys">
      {[0, 1, 2].map((item) => (
        <div className="survey-card survey-card--loading" key={item}>
          <span />
          <strong />
          <p />
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function dateValue(value: string) {
  const date = new Date(value).getTime();
  return Number.isNaN(date) ? 0 : date;
}
