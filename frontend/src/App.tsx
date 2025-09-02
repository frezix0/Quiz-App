import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import AdminPanel from './pages/AdminPanel';
import QuestionManagement from './pages/QuestionManagement';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/results/:attemptId" element={<Results />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/quiz/:quizId/questions" element={<QuestionManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;