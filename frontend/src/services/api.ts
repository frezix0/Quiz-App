// api.ts

import axios from "axios";
import {
  Quiz,
  QuizWithQuestions,
  QuizAttempt,
  QuizAttemptCreate,
  UserAnswerSubmit,
  QuizResult,
  QuizStats,
  QuizCreateRequest,
  QuizUpdateRequest,
  Question,
  QuestionCreateRequest,
} from "../types/quiz";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class QuizAPI {
  // =================== QUIZ MANAGEMENT ===================

  // Get all quizzes
  static async getQuizzes(params?: {
    skip?: number;
    limit?: number;
    category?: string;
  }): Promise<Quiz[]> {
    const response = await api.get<Quiz[]>("/quiz/", { params });
    return response.data;
  }

  // Get quiz with questions
  static async getQuiz(quizId: number): Promise<QuizWithQuestions> {
    const response = await api.get<QuizWithQuestions>(`/quiz/${quizId}`);
    return response.data;
  }

  // Create new quiz
  static async createQuiz(quizData: QuizCreateRequest): Promise<Quiz> {
    const response = await api.post<Quiz>("/quiz/", quizData);
    return response.data;
  }

  // Update quiz
  static async updateQuiz(
    quizId: number,
    quizData: QuizUpdateRequest
  ): Promise<Quiz> {
    const response = await api.put<Quiz>(`/quiz/${quizId}`, quizData);
    return response.data;
  }

  // Delete quiz
  static async deleteQuiz(quizId: number): Promise<void> {
    await api.delete(`/quiz/${quizId}`);
  }

  // Get quiz categories
  static async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>("/quiz/categories/");
    return response.data;
  }
// Get quiz statistics
static async getQuizStats(quizId: number): Promise<QuizStats> {
    const response = await api.get<QuizStats>(`/quiz/${quizId}/stats`);
    return response.data;
}
  // =================== QUESTION MANAGEMENT ===================

  // Create new question for a quiz
  static async createQuestion(params: {
    quizId: number;
    questionData: QuestionCreateRequest;
  }): Promise<Question> {
    const { quizId, questionData } = params;
    const response = await api.post<Question>(
      `/quiz/${quizId}/question/`,
      questionData
    );
    return response.data;
  }

  // Update question
  static async updateQuestion(
    questionId: number,
    questionData: Partial<QuestionCreateRequest>
  ): Promise<Question> {
    const response = await api.put<Question>(
      `/question/${questionId}`,
      questionData
    );
    return response.data;
  }

  // Delete question
  static async deleteQuestion(questionId: number): Promise<void> {
    try {
      console.log(`Attempting to delete question ${questionId}`);

      const response = await api.delete(`/question/${questionId}`);

      console.log(`Question ${questionId} deletion response:`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      if (response.status === 200 || response.status === 204) {
        console.log(
          `Question ${questionId} deleted successfully with status ${response.status}`
        );
        return;
      } else {
        console.warn(
          `Unexpected response status ${response.status} for deletion`
        );
        throw new Error(`Deletion failed with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error(`Failed to delete question ${questionId}:`, error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 404:
            console.log(
              `Question ${questionId} not found, considering as already deleted`
            );
            return;

          case 409:
            throw new Error(
              "Cannot delete question: it may be referenced in existing quiz attempts or have other dependencies"
            );

          case 403:
            throw new Error(
              "Access denied: you do not have permission to delete this question"
            );

          default:
            const errorMessage =
              data?.detail ||
              data?.message ||
              `Server returned status ${status}`;
            throw new Error(errorMessage);
        }
      } else {
        throw error;
      }
    }
  }

  // Get single question with options
  static async getQuestion(questionId: number): Promise<Question> {
    const response = await api.get<Question>(`/question/${questionId}`);
    return response.data;
  }

  // Reorder questions in a quiz
  static async reorderQuestions(
    quizId: number,
    questionIds: number[]
  ): Promise<void> {
    await api.put(`/quiz/${quizId}/questions/reorder`, {
      question_ids: questionIds,
    });
  }

  // =================== QUIZ ATTEMPTS ===================

  // Start quiz attempt
  static async startAttempt(
    attemptData: QuizAttemptCreate
  ): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>("/attempt/", attemptData);
    return response.data;
  }

  // Get attempt details
  static async getAttempt(attemptId: number): Promise<QuizAttempt> {
    const response = await api.get<QuizAttempt>(`/attempt/${attemptId}`);
    return response.data;
  }

  // Submit quiz answers
  static async submitAnswers(
    attemptId: number,
    answers: UserAnswerSubmit
  ): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>(
      `/attempt/${attemptId}/submit`,
      answers
    );
    return response.data;
  }

  // Get quiz results
  static async getResults(attemptId: number): Promise<QuizResult> {
    const response = await api.get<QuizResult>(`/attempt/${attemptId}/results`);
    return response.data;
  }

  // Update time taken
  static async updateTimeTaken(
    attemptId: number,
    timeTaken: number
  ): Promise<void> {
    await api.put<void>(`/attempt/${attemptId}/time`, {
      time_taken: timeTaken,
    });
  }
}

export default QuizAPI;
