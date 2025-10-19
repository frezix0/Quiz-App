import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApi, useAsyncAction } from '../hooks/useApi';
import { useQuiz } from '../hooks/useQuiz';
import QuizAPI from '../services/api';
import QuizStorageService from '../utils/quizStorage';
import QuestionCard from '../components/QuestionCard';
import { QuizWithQuestions, QuizAttempt, UserAnswer, UserAnswerSubmit } from '../types/quiz';

const Quiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingAttemptId = searchParams.get('attempt');
  
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [participantInfo, setParticipantInfo] = useState({
    name: '',
    email: ''
  });
  const [showParticipantForm, setShowParticipantForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: quiz, loading: quizLoading, error: quizError } = useApi<QuizWithQuestions>(
    () => QuizAPI.getQuiz(Number(quizId)),
    [quizId]
  );

  const { execute: startAttempt } = useAsyncAction();

  // Initialize quiz hook after we have quiz data
  const quizHook = useQuiz({
    totalQuestions: quiz?.questions?.length || 0,
    timeLimit: quiz?.time_limit || 0,
    onTimeUp: handleTimeUp
  });

  // Check for existing incomplete attempt on load
  useEffect(() => {
    if (quizId) {
      const quizIdNum = Number(quizId);
      
      // Check if resuming existing attempt
      if (existingAttemptId) {
        const attempt = QuizStorageService.getAttemptById(Number(existingAttemptId));
        if (attempt && !attempt.is_completed) {
          setCurrentAttempt(attempt);
          setShowParticipantForm(false);
        }
      } else {
        // Check for any incomplete attempt for this quiz
        const incompleteAttempt = QuizStorageService.getIncompleteAttempt(quizIdNum);
        if (incompleteAttempt) {
          const resumeQuiz = window.confirm(
            'You have an incomplete attempt for this quiz. Would you like to resume it?'
          );
          
          if (resumeQuiz) {
            setCurrentAttempt(incompleteAttempt);
            setShowParticipantForm(false);
          }
        }
      }
    }
  }, [quizId, existingAttemptId]);

  function handleTimeUp() {
    if (currentAttempt && !quizHook.isSubmitted) {
      alert('Time is up! Your quiz will be submitted automatically.');
      handleSubmitQuiz();
    }
  }

  const handleStartQuiz = async () => {
    if (!quiz) return;

    try {
      const attemptData = {
        quiz_id: Number(quizId),
        participant_name: participantInfo.name.trim() || undefined,
        participant_email: participantInfo.email.trim() || undefined,
      };

      const attempt = await startAttempt(QuizAPI.startAttempt, attemptData);
      
      if (attempt) {
        setCurrentAttempt(attempt);
        setShowParticipantForm(false);
        
        // Save attempt to local storage
        QuizStorageService.saveAttempt(attempt);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleAnswerChange = (answer: UserAnswer) => {
    quizHook.setAnswer(answer.question_id, answer);
  };

const handleSubmitQuiz = async () => {
  if (!currentAttempt || quizHook.isSubmitted) return;

  try {
    setIsSubmitting(true);
    
    const answers = quizHook.getAllAnswers();
    const answerData: UserAnswerSubmit = { answers };

    const finalTimeTaken = quizHook.getElapsedTime();
    quizHook.markAsSubmitted();

    if (currentAttempt.id) {
      QuizStorageService.updateAttemptTimeTaken(currentAttempt.id, finalTimeTaken);
    }

    try {
      // Update time taken via API
      if (currentAttempt.id) {
        await QuizAPI.updateTimeTaken(currentAttempt.id, finalTimeTaken);
      }

      // Submit answers via API
      const completedAttempt = await QuizAPI.submitAnswers(currentAttempt.id, answerData);

      if (completedAttempt) {
        const updatedAttempt = {
          ...currentAttempt,
          ...completedAttempt,
          time_taken: finalTimeTaken, 
          is_completed: true,
          completed_at: new Date().toISOString()
        };
        
        QuizStorageService.saveAttempt(updatedAttempt);
        
        try {
          const results = await QuizAPI.getResults(currentAttempt.id);
          if (results) {
            const consistentResults = {
              ...results,
              time_taken: finalTimeTaken
            };
            QuizStorageService.saveResult(consistentResults);
          }
        } catch (resultsError) {
          console.error('Error fetching results, creating from local data:', resultsError);
          
          // Fallback
          const localResult = {
            attempt_id: currentAttempt.id,
            quiz_id: currentAttempt.quiz_id,
            score: currentAttempt.score || 0,
            total_questions: currentAttempt.total_questions || quiz?.questions.length || 0,
            percentage: currentAttempt.total_questions ? (currentAttempt.score || 0) / currentAttempt.total_questions * 100 : 0,
            time_taken: finalTimeTaken,
            is_passed: currentAttempt.total_questions ? (currentAttempt.score || 0) / currentAttempt.total_questions >= 0.6 : false,
            correct_answers: [],
            incorrect_answers: []
          };
          QuizStorageService.saveResult(localResult);
        }
      }
    } catch (apiError) {
      console.error('API submission failed, but local storage updated:', apiError);
    }

    // Navigate to results page
    navigate(`/results/${currentAttempt.id}`);
    
  } catch (error) {
    console.error('Error submitting quiz:', error);
    alert('Failed to submit quiz. Please try again.');
    quizHook.resetQuiz();
  } finally {
    setIsSubmitting(false);
  }
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
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show participant form if not started
  if (showParticipantForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 mb-6">{quiz.description}</p>
            )}
            
            {/* Quiz Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {quiz.difficulty_level.charAt(0).toUpperCase() + quiz.difficulty_level.slice(1)}
                </div>
                <div className="text-sm text-gray-600">Difficulty</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {quiz.time_limit > 0 ? `${Math.floor(quiz.time_limit / 60)} min` : 'No limit'}
                </div>
                <div className="text-sm text-gray-600">Time Limit</div>
              </div>
            </div>
          </div>

          {/* Participant Info Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={participantInfo.name}
                onChange={(e) => setParticipantInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={participantInfo.email}
                onChange={(e) => setParticipantInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Quiz Instructions</h4>
                  <div className="mt-1 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Answer all questions to the best of your ability</li>
                      <li>You can navigate between questions using the navigation buttons</li>
                      {quiz.time_limit > 0 && (
                        <li>You have {Math.floor(quiz.time_limit / 60)} minutes to complete the quiz</li>
                      )}
                      <li>Your progress will be saved automatically</li>
                      <li>Click "Submit Quiz" when you're ready to finish</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleStartQuiz}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Start Quiz
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz content
  if (!currentAttempt) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Starting quiz...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[quizHook.currentQuestionIndex];
  const progress = quizHook.getProgress();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {quizHook.hasTimeLimit && (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className={`font-mono text-lg ${quizHook.timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                {quizHook.formatTime(quizHook.timeRemaining)}
              </span>
            </div>
          )}
          {!quizHook.hasTimeLimit && (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-mono text-lg text-gray-900">
                {quizHook.formatTime(quizHook.getElapsedTime())}
              </span>
              <span className="text-sm text-gray-500">(elapsed)</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {progress.answered} of {progress.total} answered</span>
            <span>{Math.round(progress.percentage)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="mb-6">
          <QuestionCard
            question={currentQuestion}
            questionNumber={quizHook.currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            userAnswer={quizHook.getAnswer(currentQuestion.id)}
            onAnswerChange={handleAnswerChange}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={quizHook.goToPreviousQuestion}
            disabled={quizHook.isFirstQuestion}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {quizHook.isLastQuestion ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || !quizHook.canSubmit()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={quizHook.goToNextQuestion}
                disabled={quizHook.isLastQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Question Navigation</h3>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((_, index) => {
              const isAnswered = quizHook.getAnswer(quiz.questions[index].id) !== undefined;
              const isCurrent = index === quizHook.currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => quizHook.goToQuestion(index)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg border-2 transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isAnswered
                      ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Submit Option */}
      {progress.percentage > 50 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-yellow-800">Ready to submit?</h4>
              <p className="mt-1 text-sm text-yellow-700">
                You've answered {progress.answered} out of {progress.total} questions. 
                You can submit now or continue answering remaining questions.
              </p>
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm font-medium disabled:opacity-50"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;