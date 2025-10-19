import axios from 'axios';
import { ENV } from '../config/env';
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
} from '../types/quiz';

// Create API instance
const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    if (ENV.DEBUG) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (ENV.DEBUG) {
      console.log(`[API] Response:`, response.status, response.data);
    }
    return response;
  },
  (error) => {
    const message = handleApiError(error);
    console.error('[API] Error:', message);
    return Promise.reject(error);
  }
);

function handleApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your internet connection.';
  }

  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const { status, data } = error.response;

  // Type-safe error response handling
  const errorData = data as any;
  const errorMessage = errorData?.detail || errorData?.message || errorData?.error;

  switch (status) {
    case 400:
      return errorMessage || 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please log in again.';
    case 403:
      return 'Access denied.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Resource conflict. Please try again.';
    case 422:
      return errorMessage || 'Invalid data provided.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
      return 'Service temporarily unavailable.';
    default:
      return errorMessage || `Error: ${status} ${error.response.statusText}`;
  }
}

export class QuizAPI {
// Quiz Management

  static async getQuizzes(params?: {
    skip?: number;
    limit?: number;
    category?: string;
  }): Promise<Quiz[]> {
    const response = await api.get<Quiz[]>('/quiz/', { params });
    return response.data;
  }

  static async getQuiz(quizId: number): Promise<QuizWithQuestions> {
    const response = await api.get<QuizWithQuestions>(`/quiz/${quizId}`);
    return response.data;
  }

  static async createQuiz(quizData: QuizCreateRequest): Promise<Quiz> {
    const response = await api.post<Quiz>('/quiz/', quizData);
    return response.data;
  }

  static async updateQuiz(quizId: number, quizData: QuizUpdateRequest): Promise<Quiz> {
    const response = await api.put<Quiz>(`/quiz/${quizId}`, quizData);
    return response.data;
  }

  static async deleteQuiz(quizId: number): Promise<void> {
    await api.delete(`/quiz/${quizId}`);
  }

  static async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/quiz/categories/');
    return response.data;
  }

  static async getQuizStats(quizId: number): Promise<QuizStats> {
    const response = await api.get<QuizStats>(`/quiz/${quizId}/stats`);
    return response.data;
  }

// Question Management

  static async createQuestion(params: {
    quizId: number;
    questionData: QuestionCreateRequest;
  }): Promise<Question> {
    const { quizId, questionData } = params;
    const response = await api.post<Question>(`/quiz/${quizId}/question/`, questionData);
    return response.data;
  }

  static async updateQuestion(
    questionId: number,
    questionData: Partial<QuestionCreateRequest>
  ): Promise<Question> {
    const response = await api.put<Question>(`/question/${questionId}`, questionData);
    return response.data;
  }

  static async deleteQuestion(questionId: number): Promise<void> {
    const response = await api.delete(`/question/${questionId}`);
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Deletion failed with status: ${response.status}`);
    }
  }

  static async getQuestion(questionId: number): Promise<Question> {
    const response = await api.get<Question>(`/question/${questionId}`);
    return response.data;
  }

// Quiz Attempts

  static async startAttempt(attemptData: QuizAttemptCreate): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>('/attempt/', attemptData);
    return response.data;
  }

  static async getAttempt(attemptId: number): Promise<QuizAttempt> {
    const response = await api.get<QuizAttempt>(`/attempt/${attemptId}`);
    return response.data;
  }

  static async submitAnswers(attemptId: number, answers: UserAnswerSubmit): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>(`/attempt/${attemptId}/submit`, answers);
    return response.data;
  }

  static async getResults(attemptId: number): Promise<QuizResult> {
    const response = await api.get<QuizResult>(`/attempt/${attemptId}/results`);
    return response.data;
  }

  static async updateTimeTaken(attemptId: number, timeTaken: number): Promise<void> {
    await api.put<void>(`/attempt/${attemptId}/time`, { time_taken: timeTaken });
  }
}

export default QuizAPI;