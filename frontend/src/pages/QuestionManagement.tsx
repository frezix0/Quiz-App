import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, useAsyncAction } from '../hooks/useApi';
import QuizAPI from '../services/api';
import { QuizWithQuestions, QuestionCreateRequest, QuestionType } from '../types/quiz';

const QuestionManagement: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice' as QuestionType,
    points: 1,
    explanation: '',
    options: [
      { option_text: '', is_correct: true, option_order: 1 },
      { option_text: '', is_correct: false, option_order: 3 },
      { option_text: '', is_correct: false, option_order: 2 },
      { option_text: '', is_correct: false, option_order: 4 }
    ]
  });

  const { data: quiz, loading: quizLoading, refetch, error: quizError } = useApi<QuizWithQuestions>(
    () => QuizAPI.getQuiz(Number(quizId)),
    [quizId]
  );

  const { execute: createQuestion, loading: creatingQuestion, error: createError } = useAsyncAction();
  const { execute: deleteQuestion, loading: deletingQuestion } = useAsyncAction();

  // Handle create new question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newQuestion.question_text.trim()) {
      alert('Question text is required');
      return;
    }

    // Validate based on question type
    if (newQuestion.question_type === 'multiple_choice') {
      const correctOptions = newQuestion.options.filter(opt => opt.is_correct);
      if (correctOptions.length !== 1) {
        alert('Please select exactly one correct answer for multiple choice questions');
        return;
      }

      const emptyOptions = newQuestion.options.filter(opt => !opt.option_text.trim());
      if (emptyOptions.length > 0) {
        alert('Please fill in all answer options');
        return;
      }
    }

    try {
      let questionData: QuestionCreateRequest;
      
      if (newQuestion.question_type === 'true_false') {
        // Handle true/false questions
        questionData = {
          question_text: newQuestion.question_text.trim(),
          question_type: newQuestion.question_type,
          points: newQuestion.points,
          explanation: newQuestion.explanation.trim() || undefined,
          options: [
            { option_text: 'True', is_correct: newQuestion.options[0]?.is_correct || false, option_order: 1 },
            { option_text: 'False', is_correct: newQuestion.options[1]?.is_correct || true, option_order: 2 }
          ]
        };
      } else if (newQuestion.question_type === 'text') {
        // Handle text questions (no options needed)
        questionData = {
          question_text: newQuestion.question_text.trim(),
          question_type: newQuestion.question_type,
          points: newQuestion.points,
          explanation: newQuestion.explanation.trim() || undefined,
          options: []
        };
      } else {
        // Handle multiple choice questions
        questionData = {
          question_text: newQuestion.question_text.trim(),
          question_type: newQuestion.question_type,
          points: newQuestion.points,
          explanation: newQuestion.explanation.trim() || undefined,
          options: newQuestion.options.map(opt => ({
            option_text: opt.option_text.trim(),
            is_correct: opt.is_correct,
            option_order: opt.option_order
          }))
        };
      }

      await createQuestion(QuizAPI.createQuestion, {
        quizId: Number(quizId),
        questionData
      });
      
      // Reset form and take new data
      resetForm();
      setShowCreateForm(false);
      await refetch();
      alert('Question added successfully!');
      
    } catch (error: any) {
      console.error('Error creating question:', error);
      alert(`Error: ${error.message || 'Failed to add question'}`);
    }
  };

  // Reset form helper
  const resetForm = () => {
    setNewQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      explanation: '',
      options: [
        { option_text: '', is_correct: true, option_order: 1 },
        { option_text: '', is_correct: false, option_order: 2 },
        { option_text: '', is_correct: false, option_order: 3 },
        { option_text: '', is_correct: false, option_order: 4 }
      ]
    });
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId: number, questionText: string) => {
    if (!confirm(`Are you sure you want to delete this question?\n\n"${questionText}"`)) {
      return;
    }

    try {
      console.log(`Attempting to delete question ${questionId}`);
      
      // delete function
      await deleteQuestion(QuizAPI.deleteQuestion, questionId);
      
      // take data from server
      await refetch();
      
      // notification success
      alert('Question deleted successfully!');
      
    } catch (error: any) {
      console.error('Error deleting question:', error);
      
      // hook error
      const errorMessage = error.message || 'Failed to delete question. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };


  // Update option text
  const updateOptionText = (index: number, text: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, option_text: text } : opt
      )
    }));
  };

  // Set correct answer
  const setCorrectAnswer = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        is_correct: i === index
      }))
    }));
  };

  // Handle question type change
  const handleQuestionTypeChange = (type: QuestionType) => {
    let options = newQuestion.options;
    
    if (type === 'true_false') {
      options = [
        { option_text: 'True', is_correct: true, option_order: 1 },
        { option_text: 'False', is_correct: false, option_order: 2 }
      ];
    } else if (type === 'text') {
      options = []; // No options for text questions
    } else {
      // Multiple choice - ensure we have 4 options
      options = [
        { option_text: '', is_correct: true, option_order: 1 },
        { option_text: '', is_correct: false, option_order: 2 },
        { option_text: '', is_correct: false, option_order: 3 },
        { option_text: '', is_correct: false, option_order: 4 }
      ];
    }
    
    setNewQuestion(prev => ({
      ...prev,
      question_type: type,
      options
    }));
  };

  if (quizLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizError || !quiz) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Quiz not found</h3>
          <p className="text-red-700 mb-4">{quizError || 'The requested quiz could not be found.'}</p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-2"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin Panel
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600">Manage questions for this quiz</p>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {quiz.difficulty_level.charAt(0).toUpperCase() + quiz.difficulty_level.slice(1)}
            </div>
            <div className="text-sm text-gray-600">Difficulty</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{quiz.category || 'General'}</div>
            <div className="text-sm text-gray-600">Category</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {quiz.time_limit > 0 ? `${Math.floor(quiz.time_limit / 60)} min` : 'No limit'}
            </div>
            <div className="text-sm text-gray-600">Time Limit</div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {createError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to create question</h3>
              <div className="mt-2 text-sm text-red-700">{createError}</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Question Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Question</h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
              disabled={creatingQuestion}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text <label className='text-red-700'>*</label>
              </label>
              <textarea
                required
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter your question here..."
                disabled={creatingQuestion}
              />
            </div>

            {/* Question Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={newQuestion.question_type}
                  onChange={(e) => handleQuestionTypeChange(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creatingQuestion}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="text">Text Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, points: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creatingQuestion}
                />
              </div>
            </div>

            {/* Answer Options for Multiple Choice */}
            {newQuestion.question_type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Answer Options <label className='text-red-700'>*</label> (Select the correct answer)
                </label>
                <div className="space-y-3">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={option.is_correct}
                        onChange={() => setCorrectAnswer(index)}
                        className="w-4 h-4 text-blue-600"
                        disabled={creatingQuestion}
                      />
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        required
                        value={option.option_text}
                        onChange={(e) => updateOptionText(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        disabled={creatingQuestion}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click the radio button to mark the correct answer
                </p>
              </div>
            )}

            {/* True/False Options */}
            {newQuestion.question_type === 'true_false' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Correct Answer <label className='text-red-700'>*</label>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="radio"
                      name="true_false_answer"
                      checked={newQuestion.options[0]?.is_correct || false}
                      onChange={() => {
                        setNewQuestion(prev => ({
                          ...prev,
                          options: [
                            { option_text: 'True', is_correct: true, option_order: 1 },
                            { option_text: 'False', is_correct: false, option_order: 2 }
                          ]
                        }));
                      }}
                      className="w-4 h-4 text-blue-600"
                      disabled={creatingQuestion}
                    />
                    <span className="text-sm font-medium text-gray-700">True</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="radio"
                      name="true_false_answer"
                      checked={newQuestion.options[1]?.is_correct || false}
                      onChange={() => {
                        setNewQuestion(prev => ({
                          ...prev,
                          options: [
                            { option_text: 'True', is_correct: false, option_order: 1 },
                            { option_text: 'False', is_correct: true, option_order: 2 }
                          ]
                        }));
                      }}
                      className="w-4 h-4 text-blue-600"
                      disabled={creatingQuestion}
                    />
                    <span className="text-sm font-medium text-gray-700">False</span>
                  </div>
                </div>
              </div>
            )}

            {/* Text Question Info */}
            {newQuestion.question_type === 'text' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">Text Answer Question</h4>
                    <div className="mt-1 text-sm text-yellow-700">
                      This question will allow participants to enter free text as their answer. Text answers require manual grading.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Explain why this is the correct answer..."
                disabled={creatingQuestion}
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={creatingQuestion || !newQuestion.question_text.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingQuestion ? 'Adding Question...' : 'Add Question'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                disabled={creatingQuestion}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Questions ({quiz.questions.length})</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={showCreateForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add Question
          </button>
        </div>

        {quiz.questions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                        Q{index + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.question_type.replace('_', ' ')} • {question.points} point{question.points > 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {question.question_text}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id, question.question_text)}
                    disabled={deletingQuestion}
                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                    title="Delete Question"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Question Options */}
                {question.options && question.options.length > 0 && (
                  <div className="space-y-2">
                    {question.options
                      .sort((a, b) => a.option_order - b.option_order)
                      .map((option, optIndex) => (
                        <div
                          key={option.id}
                          className="flex items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-50"
                        >
                          <span className="text-sm font-medium text-gray-700 w-8">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="flex-1 text-gray-900">{option.option_text}</span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Text Question Indicator */}
                {question.question_type === 'text' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      This is a text answer question. Participants will type their response in a text field.
                    </p>
                  </div>
                )}

                {/* Question Explanation */}
                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Explanation:</h4>
                    <p className="text-sm text-blue-700">{question.explanation}</p>
                  </div>
                )}
              </div>
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first question to get started with this quiz.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add First Question
            </button>
          </div>
        )}
      </div>

      {/* Preview Quiz */}
      {quiz.questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Preview</h2>
          <p className="text-gray-600 mb-4">
            Your quiz is ready! You can preview how it looks to participants.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Preview Quiz
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Admin Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;