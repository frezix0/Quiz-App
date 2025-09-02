import React from 'react';
import { Link } from 'react-router-dom';
import { QuizAttempt } from '../types/quiz';
import TimeUtils from '../utils/timeUtils';
import QuizStorageService from '../utils/quizStorage';

interface QuizStatusCardProps {
  attempt: QuizAttempt;
  quizTitle: string;
}

const QuizStatusCard: React.FC<QuizStatusCardProps> = ({ attempt, quizTitle }) => {
  const getDisplayTime = () => {
    return QuizStorageService.getAttemptElapsedTime(attempt);
  };

  const getStatusColor = (isCompleted: boolean, score?: number, totalQuestions?: number) => {
    if (!isCompleted) return 'bg-yellow-100 text-yellow-800';
    
    const percentage = totalQuestions && totalQuestions > 0 ? (score || 0) / totalQuestions * 100 : 0;
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (isCompleted: boolean, score?: number, totalQuestions?: number) => {
    if (!isCompleted) return 'In Progress';
    
    const percentage = totalQuestions && totalQuestions > 0 ? (score || 0) / totalQuestions * 100 : 0;
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Passed';
    return 'Failed';
  };

  const percentage = attempt.total_questions > 0 ? (attempt.score / attempt.total_questions) * 100 : 0;
  const displayTime = getDisplayTime();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{quizTitle}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            attempt.is_completed,
            attempt.score,
            attempt.total_questions
          )}`}
        >
          {getStatusText(attempt.is_completed, attempt.score, attempt.total_questions)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {attempt.is_completed ? Math.round(percentage) : '--'}%
          </div>
          <div className="text-xs text-gray-500">Score</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {attempt.is_completed ? attempt.score || 0 : '--'}
          </div>
          <div className="text-xs text-gray-500">Points</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {attempt.total_questions || 0}
          </div>
          <div className="text-xs text-gray-500">Questions</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {TimeUtils.formatTime(displayTime)}
          </div>
          <div className="text-xs text-gray-500">
            {attempt.is_completed ? 'Total Time' : 'Elapsed'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          <span className="font-medium">Started:</span> {new Date(attempt.started_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
          {attempt.completed_at && (
            <>
              <br />
              <span className="font-medium">Completed:</span> {new Date(attempt.completed_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          {attempt.is_completed ? (
            <Link
              to={`/results/${attempt.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-xs font-medium text-center"
            >
              View Results
            </Link>
          ) : (
            <Link
              to={`/quiz/${attempt.quiz_id}?attempt=${attempt.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-xs font-medium text-center"
            >
              Continue Quiz
            </Link>
          )}
          
          <Link
            to={`/quiz/${attempt.quiz_id}`}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-xs font-medium text-center"
          >
            Start Fresh
          </Link>
        </div>
      </div>

      {/* Progress indicator for incomplete attempts */}
      {!attempt.is_completed && attempt.total_questions > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(percentage)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizStatusCard;