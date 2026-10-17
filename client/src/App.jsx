import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import CandidatesList from './pages/Candidates/CandidatesList';
import CandidateDetail from './pages/Candidates/CandidateDetail';
import JobsList from './pages/Jobs/JobsList';
import JobDetail from './pages/Jobs/JobDetail';
import Pipeline from './pages/Pipeline/Pipeline';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
