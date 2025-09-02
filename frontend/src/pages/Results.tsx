import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import QuizAPI from "../services/api";
import QuizStorageService from "../utils/quizStorage";
import ResultCard from "../components/ResultCard";
import { QuizResult, QuizStats } from "../types/quiz";

const Results: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState<string>("Quiz Results");
  const [localResult, setLocalResult] = useState<QuizResult | null>(null);

  // Try to get results from API first, fallback to localStorage
  const {
    data: apiResult,
    loading,
    error,
  } = useApi<QuizResult>(
    () => QuizAPI.getResults(Number(attemptId)),
    [attemptId]
  );

  // Load from localStorage if API fails
  useEffect(() => {
    if (attemptId) {
      // Get result from localStorage
      const storedResult = QuizStorageService.getResultByAttemptId(
        Number(attemptId)
      );
      if (storedResult) {
        setLocalResult(storedResult);
      }

      // Get attempt to find quiz title
      const attempt = QuizStorageService.getAttemptById(Number(attemptId));
      if (attempt) {
        // Try to get quiz details for title
        QuizAPI.getQuiz(attempt.quiz_id)
          .then((quiz) => {
            setQuizTitle(quiz.title);
          })
          .catch(() => {
            setQuizTitle(`Quiz ${attempt.quiz_id} Results`);
          });
      }
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const result = apiResult || localResult;

  if (!result) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-yellow-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Results not found
          </h3>
          <p className="text-yellow-700 mb-4">
            {error
              ? "Unable to load results from server. The results may not be available or there was a connection error."
              : "The quiz results could not be found. The quiz may not have been completed yet."}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Home
            </button>
            {error && (
              <button
                onClick={() => window.location.reload()}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ResultCard result={result} quizTitle={quizTitle} />

      {/* Additional Actions */}
      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z"
                />
              </svg>
              <div className="font-medium">Take Another Quiz</div>
              <div className="text-sm opacity-75">Explore more quizzes</div>
            </button>

            <button
              onClick={() => {
                const attempt = QuizStorageService.getAttemptById(
                  Number(attemptId)
                );
                if (attempt) {
                  navigate(`/quiz/${attempt.quiz_id}`);
                }
              }}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <div className="font-medium">Retake This Quiz</div>
              <div className="text-sm opacity-75">
                Try to improve your score
              </div>
            </button>

            <button
              onClick={() => {
                const stats = QuizStorageService.getUserStats();
                alert(
                  `Your Stats:\n\nTotal Attempts: ${stats.totalAttempts}\nCompleted: ${stats.completedAttempts}\nAverage Score: ${stats.averageScore}%\nPass Rate: ${stats.passRate}%`
                );
              }}
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <div className="font-medium">View Your Stats</div>
              <div className="text-sm opacity-75">See your progress</div>
            </button>
          </div>
        </div>

        {/* Share Results */}
        <div className="bg-gray-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Share Your Achievement
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const shareText = `I just completed "${quizTitle}" and scored ${Math.round(
                  result.percentage
                )}%! 🎉`;
                if (navigator.share) {
                  navigator.share({
                    title: "Quiz Results",
                    text: shareText,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(
                    shareText + ` ${window.location.href}`
                  );
                  alert("Results copied to clipboard!");
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Share Results
            </button>

            <button
              onClick={() => {
                // Print functionality
                window.print();
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Print Results
            </button>

            <button
              onClick={() => {
                // Export as text
                const exportText = `
Quiz Results - ${quizTitle}

Score: ${result.score} points (${Math.round(result.percentage)}%)
Questions: ${result.total_questions}
Time Taken: ${Math.floor(result.time_taken / 60)}:${(result.time_taken % 60)
                  .toString()
                  .padStart(2, "0")}
Status: ${result.is_passed ? "Passed" : "Failed"}

Correct Answers: ${result.correct_answers.length}
Incorrect Answers: ${result.incorrect_answers.length}
                `.trim();

                const blob = new Blob([exportText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `quiz_results_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Export Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
