import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import AdminPanel from './pages/AdminPanel';
import QuestionManagement from './pages/QuestionManagement';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz/:quizId" element={<Quiz />} />
            <Route path="/results/:attemptId" element={<Results />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/quiz/:quizId/questions" element={<QuestionManagement />} />
            {/* 404 Page */}
            <Route 
              path="*" 
              element={
                <div className="text-center py-12">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="text-gray-600 mt-2">Page not found</p>
                </div>
              } 
            />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;