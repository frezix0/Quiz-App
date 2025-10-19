import React, { useState } from 'react';
import { useApi, useAsyncAction } from '../hooks/useApi';
import QuizAPI from '../services/api';
import { Quiz, QuizStats, QuizCreateRequest } from '../types/quiz';
import { useNavigate } from "react-router-dom";
import TimeUtils from '../utils/timeUtils';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'easy' as const,
    time_limit: 0
  });

  const { data: quizzes, loading: quizzesLoading, refetch, error: quizzesError } = useApi<Quiz[]>(
    () => QuizAPI.getQuizzes(),
    []
  );

  const { data: stats, loading: statsLoading } = useApi<QuizStats | null>(
    () => selectedQuizId ? QuizAPI.getQuizStats(selectedQuizId) : Promise.resolve(null),
    [selectedQuizId]
  );

  const { execute: createQuiz, loading: creatingQuiz, error: createError } = useAsyncAction();
  const { execute: deleteQuiz, loading: deletingQuiz } = useAsyncAction();

  // Handle create new quiz
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuiz.title.trim()) {
      alert('Quiz title is required');
      return;
    }

    try {
      const quizData: QuizCreateRequest = {
        title: newQuiz.title.trim(),
        description: newQuiz.description.trim() || undefined,
        category: newQuiz.category.trim() || undefined,
        difficulty_level: newQuiz.difficulty_level,
        time_limit: newQuiz.time_limit,
        questions: []
      };

      const createdQuiz = await createQuiz(QuizAPI.createQuiz, quizData);

      if (createdQuiz) {
        // Reset form
        setNewQuiz({
          title: '',
          description: '',
          category: '',
          difficulty_level: 'easy',
          time_limit: 0
        });
        setShowCreateForm(false);

        // Redirect ke halaman add questions
        navigate(`/admin/quiz/${createdQuiz.id}/questions`);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleDeleteQuiz = async (quizId: number, quizTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
      return;
    }

    try {
      await deleteQuiz(QuizAPI.deleteQuiz, quizId);
      refetch();
      alert('Quiz deleted successfully!');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz.');
    }
  };

  const handleExportStats = () => {
    if (!quizzes || quizzes.length === 0) {
      alert('No quiz data to export');
      return;
    }

    const csvContent = [
      ['Quiz ID', 'Title', 'Category', 'Difficulty', 'Questions', 'Time Limit'],
      ...quizzes.map(quiz => [
        quiz.id.toString(),
        quiz.title,
        quiz.category || 'General',
        quiz.difficulty_level,
        quiz.question_count.toString(),
        quiz.time_limit.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quiz_statistics.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (quizzesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">Connection Error</h3>
        <p className="text-red-700 mt-2">{quizzesError}</p>
        <button
          onClick={refetch}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-xl">Manage quizzes and view statistics</p>
      </div>

      {/* Error Display */}
      {createError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Failed to create quiz</h3>
          <p className="text-red-700 mt-1">{createError}</p>
        </div>
      )}

      {/* Create Quiz Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Quiz</h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewQuiz({
                  title: '',
                  description: '',
                  category: '',
                  difficulty_level: 'easy',
                  time_limit: 0
                });
              }}
              className="text-gray-400 hover:text-gray-600"
              disabled={creatingQuiz}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreateQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                required
                value={newQuiz.title}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quiz title"
                disabled={creatingQuiz}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newQuiz.description}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter quiz description"
                disabled={creatingQuiz}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={newQuiz.category}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Science"
                  disabled={creatingQuiz}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={newQuiz.difficulty_level}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creatingQuiz}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (min)</label>
                <input
                  type="number"
                  min="0"
                  value={newQuiz.time_limit === 0 ? '' : newQuiz.time_limit / 60}
                  onChange={(e) => {
                    const minutes = e.target.value === '' ? 0 : Number(e.target.value);
                    setNewQuiz(prev => ({ ...prev, time_limit: minutes * 60 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0 for no limit"
                  disabled={creatingQuiz}
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4 border-t">
              <button
                type="submit"
                disabled={creatingQuiz || !newQuiz.title.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingQuiz ? 'Creating...' : 'Create & Add Questions'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewQuiz({
                    title: '',
                    description: '',
                    category: '',
                    difficulty_level: 'easy',
                    time_limit: 0
                  });
                }}
                disabled={creatingQuiz}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
        </div>

        {quizzes && quizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                      {quiz.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {quiz.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        quiz.difficulty_level === 'easy'
                          ? 'bg-green-100 text-green-800'
                          : quiz.difficulty_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {quiz.difficulty_level.charAt(0).toUpperCase() + quiz.difficulty_level.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quiz.question_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quiz.time_limit > 0 ? `${Math.floor(quiz.time_limit / 60)} min` : 'No limit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedQuizId(quiz.id)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Stats
                        </button>
                        <button
                          onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')}
                          className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => navigate(`/admin/quiz/${quiz.id}/questions`)}
                          className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded hover:bg-purple-50"
                        >
                          Questions
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                          disabled={deletingQuiz}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-sm font-medium text-gray-900">No quizzes found</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create New Quiz
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      {selectedQuizId && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quiz Statistics</h2>
            <button onClick={() => setSelectedQuizId(null)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {statsLoading ? (
            <div className="flex justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : stats ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{stats.quiz_title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total_attempts}</div>
                  <div className="text-sm text-gray-600">Total Attempts</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.average_score.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pass_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{TimeUtils.formatTime(stats.average_time)}</div>
                  <div className="text-sm text-gray-600">Average Time</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No statistics available.</p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create New Quiz
          </button>
          <button
            onClick={refetch}
            disabled={quizzesLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {quizzesLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button
            onClick={handleExportStats}
            disabled={!quizzes || quizzes.length === 0}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Export Statistics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;