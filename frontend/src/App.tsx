import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import ResponseForm from './pages/ResponseForm';
import ResultsDashboard from './pages/ResultsDashboard';
import './App.css';

// The survey shown on the home page ("/").
const HOME_SURVEY_ID = '508da17a-d0e3-4329-89f2-4266ebc91438';

export default function App() {
  // The public survey-taking page has no navbar (no admin Dashboard link).
  const isRespondPage = useLocation().pathname.endsWith('/respond');

  return (
    <div className="app-shell">
      {!isRespondPage && (
        <header className="app-header">
          <Link to="/" className="brand-link" aria-label="Survey App home">
            <span className="brand-mark" aria-hidden="true">S</span>
            Survey App
          </Link>
          <nav className="app-nav" aria-label="Primary navigation">
            <Link to="/dashboard">Dashboard</Link>
          </nav>
        </header>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to={`/surveys/${HOME_SURVEY_ID}/respond`} replace />} />
          <Route path="/dashboard" element={<SurveyList />} />
          <Route path="/surveys/:id/edit" element={<SurveyBuilder />} />
          <Route path="/surveys/:id/respond" element={<ResponseForm />} />
          <Route path="/surveys/:id/results" element={<ResultsDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
