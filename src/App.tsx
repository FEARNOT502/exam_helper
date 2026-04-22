import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { ThemeToggle } from './components/common/NavBar';
import { Dashboard } from './pages/Dashboard';
import { SetDetail } from './pages/SetDetail';
import { QuestionEditor } from './pages/QuestionEditor';
import { StudyMode } from './pages/StudyMode';
import { WrongNotes } from './pages/WrongNotes';

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Minimal fixed top bar with theme toggle */}
      <div className="fixed top-2 right-3 z-30">
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/set/:id" element={<SetDetail />} />
        <Route path="/set/:id/add" element={<QuestionEditor />} />
        <Route path="/set/:id/edit/:qid" element={<QuestionEditor />} />
        <Route path="/set/:id/study" element={<StudyMode />} />
        <Route path="/set/:id/wrong" element={<WrongNotes />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HashRouter>
          <AppLayout />
        </HashRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
