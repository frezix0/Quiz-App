import React from 'react';
import { Question, UserAnswer } from '../types/quiz';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer?: UserAnswer;
  onAnswerChange: (answer: UserAnswer) => void;
  showResults?: boolean;
  correctAnswer?: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  showResults = false,
  correctAnswer,
}) => {
  const handleOptionSelect = (optionId: number) => {
    if (showResults) return; // Disable selection in results mode
    
    const answer: UserAnswer = {
      question_id: question.id,
      selected_option_id: optionId,
    };
    onAnswerChange(answer);
  };

  const handleTextAnswerChange = (text: string) => {
    if (showResults) return; // Disable editing in results mode
    
    const answer: UserAnswer = {
      question_id: question.id,
      text_answer: text,
    };
    onAnswerChange(answer);
  };

  const isSelected = (optionId: number) => {
    return userAnswer?.selected_option_id === optionId;
  };

  const getOptionClassName = (optionId: number) => {
    let className = "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ";
    
    if (showResults) {
      if (correctAnswer === optionId) {
        className += "border-green-500 bg-green-50 text-green-800 ";
      } else if (isSelected(optionId)) {
        className += "border-red-500 bg-red-50 text-red-800 ";
      } else {
        className += "border-gray-200 bg-gray-50 text-gray-600 ";
      }
    } else {
      if (isSelected(optionId)) {
        className += "border-blue-500 bg-blue-50 text-blue-800 ";
      } else {
        className += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 ";
      }
    }
    
    return className;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </span>
        {question.points > 1 && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {question.points} Points
          </span>
        )}
      </div>

      {/* Question Text */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {question.question_text}
      </h2>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.question_type === 'text' ? (
          // Text Answer
          <textarea
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            rows={4}
            placeholder="Enter your answer here..."
            value={userAnswer?.text_answer || ''}
            onChange={(e) => handleTextAnswerChange(e.target.value)}
            disabled={showResults}
          />
        ) : (
          // Multiple Choice / True False
          question.options
            .sort((a, b) => a.option_order - b.option_order)
            .map((option) => (
              <div
                key={option.id}
                className={getOptionClassName(option.id)}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {question.question_type === 'true_false' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-current">
                        {isSelected(option.id) && (
                          <div className="w-2 h-2 bg-current rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border-2 border-current">
                        {isSelected(option.id) && (
                          <div className="w-2 h-2 bg-current rounded-sm mx-auto mt-0.5"></div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="flex-1 font-medium">{option.option_text}</span>
                  {showResults && correctAnswer === option.id && (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Explanation (only shown in results mode) */}
      {showResults && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Explanation</h4>
              <div className="mt-1 text-sm text-blue-700">
                {question.explanation}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;