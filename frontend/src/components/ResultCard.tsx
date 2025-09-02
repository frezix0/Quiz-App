import React from 'react';
import { Link } from 'react-router-dom';
import { QuizResult } from '../types/quiz';

interface ResultCardProps {
  result: QuizResult;
  quizTitle: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, quizTitle }) => {
  // PERBAIKAN: Consistent time formatting - handle only seconds
  const formatTime = (seconds: number) => {
    // Pastikan selalu dalam detik dan valid
    const actualSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(actualSeconds / 60);
    const secs = actualSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number, isPassed: boolean) => {
    if (isPassed) {
      if (percentage >= 90) return "Excellent work!";
      if (percentage >= 80) return "Great job!";
      return "Well done!";
    } else {
      return "Keep studying and try again!";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Result Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Complete!
          </h1>
          <h2 className="text-xl text-gray-600 mb-6">{quizTitle}</h2>
          
          {/* Score Circle */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - result.percentage / 100)}`}
                className={getScoreColor(result.percentage)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                {Math.round(result.percentage)}%
              </span>
            </div>
          </div>
          
          <p className={`text-lg font-semibold ${getScoreColor(result.percentage)}`}>
            {getScoreMessage(result.percentage, result.is_passed)}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {result.score}
            </div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {result.correct_answers.length}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {result.total_questions}
            </div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(result.time_taken)}
            </div>
            <div className="text-sm text-gray-600">Time Taken</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
          >
            Take Another Quiz
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Retake Quiz
          </button>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-6">
        {/* Correct Answers */}
        {result.correct_answers.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Correct Answers ({result.correct_answers.length})
            </h3>
            <div className="space-y-4">
              {result.correct_answers.map((answer, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="font-medium text-gray-900 mb-2">{answer.question}</div>
                  <div className="text-green-700">Your answer: {answer.user_answer}</div>
                  {answer.explanation && (
                    <div className="text-sm text-gray-600 mt-2 italic">
                      {answer.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incorrect Answers */}
        {result.incorrect_answers.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Incorrect Answers ({result.incorrect_answers.length})
            </h3>
            <div className="space-y-4">
              {result.incorrect_answers.map((answer, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-red-100">
                  <div className="font-medium text-gray-900 mb-2">{answer.question}</div>
                  <div className="text-red-700 mb-1">Your answer: {answer.user_answer}</div>
                  <div className="text-green-700">Correct answer: {answer.correct_answer}</div>
                  {answer.explanation && (
                    <div className="text-sm text-gray-600 mt-2 italic">
                      {answer.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;