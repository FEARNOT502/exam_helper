import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ExamSetsProvider } from './context/ExamSetsContext';
import { ToastContainer } from './components/common/Toast';
import { Topbar } from './components/common/Topbar';
import { Dashboard } from './pages/Dashboard';
import { SetDetail } from './pages/SetDetail';
import { QuestionEditor } from './pages/QuestionEditor';
import { StudyMode } from './pages/StudyMode';
import { WrongNotes } from './pages/WrongNotes';
import { PracticeMode } from './pages/PracticeMode';
import { Statistics } from './pages/Statistics';
import { Login } from './pages/Login';
import { Privacy } from './pages/Privacy';
import { Guide } from './pages/Guide';

function AppLayout() {
  return (
    <div className="eh-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/stats" element={<Statistics />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/set/:id" element={<SetDetail />} />
        <Route path="/set/:id/add" element={<QuestionEditor />} />
        <Route path="/set/:id/edit/:qid" element={<QuestionEditor />} />
        <Route path="/set/:id/study" element={<StudyMode />} />
        <Route path="/set/:id/wrong" element={<WrongNotes />} />
        <Route path="/set/:id/practice" element={<PracticeMode />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ExamSetsProvider>
            <HashRouter>
              <AppLayout />
            </HashRouter>
          </ExamSetsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
