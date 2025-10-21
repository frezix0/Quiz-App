import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Quiz, DifficultyLevel } from '../types/quiz';

interface QuizCardProps {
  quiz: Quiz;
}

const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  const colors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-800';
};

const formatTimeLimit = (timeLimit: number): string => {
  if (timeLimit === 0) return 'No time limit';
  const minutes = Math.floor(timeLimit / 60);
  const seconds = timeLimit % 60;
  return seconds === 0 ? `${minutes} min` : `${minutes}:${seconds.toString().padStart(2, '0')} min`;
};

const QuizCard: React.FC<QuizCardProps> = memo(({ quiz }) => {
  // Memoize computed values
  const difficultyLabel = useMemo(
    () => quiz.difficulty_level.charAt(0).toUpperCase() + quiz.difficulty_level.slice(1),
    [quiz.difficulty_level]
  );

  const timeLabel = useMemo(
    () => formatTimeLimit(quiz.time_limit),
    [quiz.time_limit]
  );

  const difficultyColorClass = useMemo(
    () => getDifficultyColor(quiz.difficulty_level),
    [quiz.difficulty_level]
  );

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {quiz.title}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColorClass}`}>
            {difficultyLabel}
          </span>
        </div>

        {quiz.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {quiz.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            {quiz.category && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                {quiz.category}
              </span>
            )}
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" height="15" width="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 13h10v1h-10v-1zm15-11v22h-20v-22h3c1.229 0 2.18-1.084 3-2h8c.82.916 1.771 2 3 2h3zm-11 1c0 .552.448 1 1 1s1-.448 1-1-.448-1-1-1-1 .448-1 1zm9 15.135c-1.073 1.355-2.448 2.763-3.824 3.865h3.824v-3.865zm0-14.135h-4l-2 2h-3.898l-2.102-2h-4v18h7.362c4.156 0 2.638-6 2.638-6s6 1.65 6-2.457v-9.543zm-13 12h5v-1h-5v1zm0-4h10v-1h-10v1zm0-2h10v-1h-10v1z"/>
              </svg>
              {quiz.question_count} Questions
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {timeLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            to={`/quiz/${quiz.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
          >
            Start Quiz
          </Link>
        </div>
      </div>
    </div>
  );
});

QuizCard.displayName = 'QuizCard';

export default QuizCard;