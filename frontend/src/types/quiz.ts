export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple_choice' | 'true_false' | 'text';

export interface AnswerOption {
  id: number;
  option_text: string;
  is_correct?: boolean;
  option_order: number;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation?: string;
  options: AnswerOption[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty_level: DifficultyLevel;
  time_limit: number;
  question_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizWithQuestions extends Omit<Quiz, 'question_count'> {
  questions: Question[];
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  participant_name?: string;
  participant_email?: string;
  score: number;
  total_questions: number;
  time_taken: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
}

export interface UserAnswer {
  question_id: number;
  selected_option_id?: number;
  text_answer?: string;
}

export interface UserAnswerSubmit {
  answers: UserAnswer[];
}

export interface QuizResult {
  attempt_id: number;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;
  is_passed: boolean;
  correct_answers: Array<{
    question: string;
    user_answer: string;
    correct_answer?: string;
    explanation?: string;
  }>;
  incorrect_answers: Array<{
    question: string;
    user_answer: string;
    correct_answer?: string;
    explanation?: string;
  }>;
}

export interface QuizStats {
  quiz_id: number;
  quiz_title: string;
  total_attempts: number;
  average_score: number;
  pass_rate: number;
  average_time: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Map<number, UserAnswer>;
  timeRemaining: number;
  isSubmitted: boolean;
}

// Request/Response Types
export interface QuizCreateRequest {
  title: string;
  description?: string;
  category?: string;
  difficulty_level: DifficultyLevel;
  time_limit: number;
  is_active?: boolean;
  questions?: QuestionCreateRequest[];
}

export interface QuizUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  difficulty_level?: DifficultyLevel;
  time_limit?: number;
  is_active?: boolean;
}

export interface QuizAttemptCreate {
  quiz_id: number;
  participant_name?: string;
  participant_email?: string;
}


export interface QuestionCreateRequest {
  question_text: string;
  question_type: QuestionType;
  points: number;
  explanation?: string;
  options: AnswerOptionCreate[];
}

export interface AnswerOptionCreate {
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

export interface QuestionUpdateRequest {
  question_text?: string;
  question_type?: QuestionType;
  points?: number;
  explanation?: string;
  options?: AnswerOptionCreate[];
}

// User Statistics
export interface UserStats {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  passRate: number;
  totalTimeSpent: number;
  recentActivity: number;
}