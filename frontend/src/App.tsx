import { Routes, Route, Link } from 'react-router-dom';
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import ResponseForm from './pages/ResponseForm';
import ResultsDashboard from './pages/ResultsDashboard';

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1rem' }}>
      <nav style={{ padding: '1rem 0', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <Link to="/" style={{ fontWeight: 600, fontSize: '1.2rem', textDecoration: 'none', color: '#111' }}>
          Survey App
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<SurveyList />} />
        <Route path="/surveys/:id/edit" element={<SurveyBuilder />} />
        <Route path="/surveys/:id/respond" element={<ResponseForm />} />
        <Route path="/surveys/:id/results" element={<ResultsDashboard />} />
      </Routes>
    </div>
  );
}