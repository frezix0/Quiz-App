import { useState, useEffect, useCallback, useRef } from 'react';
import { UserAnswer, QuizState } from '../types/quiz';

interface UseQuizProps {
  totalQuestions: number;
  timeLimit?: number; // in seconds
  onTimeUp?: () => void;
}

export function useQuiz({ totalQuestions, timeLimit, onTimeUp }: UseQuizProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: new Map(),
    timeRemaining: timeLimit || 0,
    isSubmitted: false,
  });

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // calculation logic
  const calculateElapsedTime = useCallback((): number => {
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const calculateRemainingTime = useCallback((): number => {
  if (!timeLimit || timeLimit <= 0) return 0;
  const elapsed = calculateElapsedTime();
  return Math.max(0, timeLimit - elapsed);
  }, [timeLimit, calculateElapsedTime]);

  // Get elapsed time
  const getElapsedTime = useCallback((): number => {
  return calculateElapsedTime();
  }, [calculateElapsedTime]);
  
  // Get real-time remaining untuk timed quiz
  const getRealTimeRemaining = useCallback((): number => {
    return calculateRemainingTime();
  }, [calculateRemainingTime]);

  // Timer effect
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timeLimit && timeLimit > 0 && !quizState.isSubmitted) {
      timerRef.current = setInterval(() => {
        const remaining = calculateRemainingTime();
        
        setQuizState(prev => ({
          ...prev,
          timeRemaining: remaining
        }));

        // Time up check
        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeout(() => onTimeUp?.(), 100);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLimit, quizState.isSubmitted, onTimeUp, calculateRemainingTime]);

  // Navigation functions
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: index }));
    }
  }, [totalQuestions]);

  const goToNextQuestion = useCallback(() => {
    setQuizState(prev => {
      const nextIndex = Math.min(prev.currentQuestionIndex + 1, totalQuestions - 1);
      return { ...prev, currentQuestionIndex: nextIndex };
    });
  }, [totalQuestions]);

  const goToPreviousQuestion = useCallback(() => {
    setQuizState(prev => {
      const prevIndex = Math.max(prev.currentQuestionIndex - 1, 0);
      return { ...prev, currentQuestionIndex: prevIndex };
    });
  }, []);

  // Answer management
  const setAnswer = useCallback((questionId: number, answer: UserAnswer) => {
    setQuizState(prev => {
      const newAnswers = new Map(prev.answers);
      newAnswers.set(questionId, answer);
      return { ...prev, answers: newAnswers };
    });
  }, []);

  const getAnswer = useCallback((questionId: number): UserAnswer | undefined => {
    return quizState.answers.get(questionId);
  }, [quizState.answers]);

  const getAllAnswers = useCallback((): UserAnswer[] => {
    return Array.from(quizState.answers.values());
  }, [quizState.answers]);

  // Progress tracking
  const getProgress = useCallback(() => {
    const answeredQuestions = quizState.answers.size;
    return {
      answered: answeredQuestions,
      total: totalQuestions,
      percentage: (answeredQuestions / totalQuestions) * 100,
    };
  }, [quizState.answers.size, totalQuestions]);

  const isCurrentQuestionAnswered = useCallback(() => {
    const currentQuestionId = quizState.currentQuestionIndex + 1;
    return quizState.answers.has(currentQuestionId);
  }, [quizState.currentQuestionIndex, quizState.answers]);

  // Quiz state management
  const markAsSubmitted = useCallback(() => {
    setQuizState(prev => ({ ...prev, isSubmitted: true }));
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    startTimeRef.current = Date.now();
    
    setQuizState({
      currentQuestionIndex: 0,
      answers: new Map(),
      timeRemaining: timeLimit || 0,
      isSubmitted: false,
    });
  }, [timeLimit]);

  // Time formatting utility
  const formatTime = useCallback((seconds: number) => {
    const actualSeconds = Math.floor(seconds);
    const mins = Math.floor(actualSeconds / 60);
    const secs = actualSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Check if quiz can be submitted
  const canSubmit = useCallback(() => {
    return quizState.answers.size > 0;
  }, [quizState.answers.size]);

  // Check if all questions are answered
  const isComplete = useCallback(() => {
    return quizState.answers.size === totalQuestions;
  }, [quizState.answers.size, totalQuestions]);

  return {
    // State
    currentQuestionIndex: quizState.currentQuestionIndex,
    timeRemaining: quizState.timeRemaining,
    isSubmitted: quizState.isSubmitted,
    
    // Navigation
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    
    // Answer management
    setAnswer,
    getAnswer,
    getAllAnswers,
    
    // Progress tracking
    getProgress,
    isCurrentQuestionAnswered,
    
    // Time tracking
    getElapsedTime,
    
    // Quiz state management
    markAsSubmitted,
    resetQuiz,
    
    // Utilities
    formatTime,
    canSubmit,
    isComplete,
    
    // Computed values
    isFirstQuestion: quizState.currentQuestionIndex === 0,
    isLastQuestion: quizState.currentQuestionIndex === totalQuestions - 1,
    hasTimeLimit: timeLimit !== undefined && timeLimit > 0,
  };
}