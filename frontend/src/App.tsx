import { Routes, Route, Link } from 'react-router-dom';
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import ResponseForm from './pages/ResponseForm';
import ResultsDashboard from './pages/ResultsDashboard';
import './App.css';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-link" aria-label="Survey App home">
          <span className="brand-mark" aria-hidden="true">S</span>
          Survey App
        </Link>
        <nav className="app-nav" aria-label="Primary navigation">
          <Link to="/">Dashboard</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<SurveyList />} />
          <Route path="/surveys/:id/edit" element={<SurveyBuilder />} />
          <Route path="/surveys/:id/respond" element={<ResponseForm />} />
          <Route path="/surveys/:id/results" element={<ResultsDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
