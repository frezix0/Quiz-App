import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import QuizAPI from '../services/api';
import QuizCard from '../components/QuizCard';
import QuizStatusCard from '../components/QuizStatusCard';
import { Quiz, QuizAttempt } from '../types/quiz';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [userAttempts, setUserAttempts] = useState<QuizAttempt[]>([]);
  const [attemptQuizMap, setAttemptQuizMap] = useState<Map<number, string>>(new Map());

  const { data: quizzes, loading: quizzesLoading, error: quizzesError } = useApi<Quiz[]>(
    () => QuizAPI.getQuizzes({ category: selectedCategory || undefined }),
    [selectedCategory]
  );

  const { data: categories } = useApi<string[]>(
    () => QuizAPI.getCategories(),
    []
  );

  // Load user attempts from localStorage
  useEffect(() => {
    const attempts = localStorage.getItem('userQuizAttempts');
    if (attempts) {
      try {
        const parsedAttempts = JSON.parse(attempts) as QuizAttempt[];
        setUserAttempts(parsedAttempts);
        
        // Create a map of quiz titles for attempts
        const quizTitleMap = new Map<number, string>();
        parsedAttempts.forEach(attempt => {
          // We'll need to fetch quiz titles separately or store them with attempts
          quizTitleMap.set(attempt.quiz_id, `Quiz ${attempt.quiz_id}`);
        });
        setAttemptQuizMap(quizTitleMap);
      } catch (error) {
        console.error('Error parsing user attempts:', error);
        localStorage.removeItem('userQuizAttempts');
      }
    }
  }, []);

  // Update quiz titles in the map when quizzes are loaded
  useEffect(() => {
    if (quizzes && userAttempts.length > 0) {
      const newQuizMap = new Map<number, string>();
      userAttempts.forEach(attempt => {
        const quiz = quizzes.find(q => q.id === attempt.quiz_id);
        newQuizMap.set(attempt.quiz_id, quiz?.title || `Quiz ${attempt.quiz_id}`);
      });
      setAttemptQuizMap(newQuizMap);
    }
  }, [quizzes, userAttempts]);

  // Filter recent attempts (last 30 days)
  const recentAttempts = userAttempts.filter(attempt => {
    const attemptDate = new Date(attempt.started_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return attemptDate >= thirtyDaysAgo;
  }).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (quizzesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
            <div className="mt-2 text-sm text-red-700">
              {quizzesError}
              <br />
              <br />
              <strong>Possible solutions:</strong>
              <ul className="mt-2 list-disc list-inside">
                <li>Make sure your backend API is running on port 8000</li>
                <li>Check if CORS is configured properly</li>
                <li>Verify the API base URL in your environment settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to QuizApp
          </h1>
          <p className="text-xl mb-6">
            Challange your knowledge with our interactive quizzes.
          </p>
        </div>
      </div>
      {/* Features Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Why Choose QuizApp?</h3>
          <p className="text-gray-600">Discover the features that make learning fun and effective</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Diverse Topics</h4>
            <p className="text-gray-600">From science to history, explore quizzes across multiple categories and difficulty levels.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Feedback</h4>
            <p className="text-gray-600">Get instant results and detailed explanations to learn from your mistakes.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm8 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-19 0c0-6.065 4.935-11 11-11v2c-4.962 0-9 4.038-9 9 0 2.481 1.009 4.731 2.639 6.361l-1.414 1.414.015.014c-2-1.994-3.24-4.749-3.24-7.789z"/>
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h4>
            <p className="text-gray-600">Monitor your performance and see how you improve over time with detailed analytics.</p>
          </div>
        </div>
      </div>

      {/* User Quiz History */}
      {recentAttempts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Recent Quiz History</h2>
            <button
              onClick={() => {
                localStorage.removeItem('userQuizAttempts');
                setUserAttempts([]);
                setAttemptQuizMap(new Map());
              }}
              className="text-sm text-gray-500 hover:text-red-700"
            >
              Clear History
            </button>
          </div>
          
          <div className="grid gap-4 mb-8">
            {recentAttempts.slice(0, 5).map((attempt) => (
              <QuizStatusCard
                key={attempt.id}
                attempt={attempt}
                quizTitle={attemptQuizMap.get(attempt.quiz_id) || `Quiz ${attempt.quiz_id}`}
              />
            ))}
          </div>
          
          {recentAttempts.length > 5 && (
            <div className="text-center">
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View All History ({recentAttempts.length} attempts)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>
          
          {categories && categories.length > 0 && (
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Grid */}
      {quizzes && quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes available</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCategory 
              ? `No quizzes found in the "${selectedCategory}" category.`
              : 'There are currently no quizzes available. Check back later or contact the administrator.'
            }
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Show All Quizzes
            </button>
          )}
        </div>
      )}
      
      {/* Quick Stats */}
      {quizzes && quizzes.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{quizzes.length}</div>
              <div className="text-blue-100">Available Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {quizzes.reduce((total, quiz) => total + quiz.question_count, 0)}
              </div>
              <div className="text-blue-100">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{userAttempts.length}</div>
              <div className="text-blue-100">Your Attempts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;