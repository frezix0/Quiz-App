import { QuizAttempt, QuizResult } from '../types/quiz';
import TimeUtils from './timeUtils';

const USER_ATTEMPTS_KEY = 'userQuizAttempts';
const QUIZ_RESULTS_KEY = 'userQuizResults';

export class QuizStorageService {
// Quiz Attempts
  
  static saveAttempt(attempt: QuizAttempt): void {
    try {
      // Validate and normalize time_taken
      const normalizedAttempt = {
        ...attempt,
        time_taken: attempt.time_taken ? TimeUtils.validateTime(attempt.time_taken) : 0
      };

      const existingAttempts = this.getUserAttempts();
      const updatedAttempts = existingAttempts.filter(a => a.id !== attempt.id);
      updatedAttempts.push(normalizedAttempt);
      
      localStorage.setItem(USER_ATTEMPTS_KEY, JSON.stringify(updatedAttempts));
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  }

  static getUserAttempts(): QuizAttempt[] {
    try {
      const attempts = localStorage.getItem(USER_ATTEMPTS_KEY);
      return attempts ? JSON.parse(attempts) : [];
    } catch (error) {
      console.error('Error loading user attempts:', error);
      return [];
    }
  }

  static getAttemptById(attemptId: number): QuizAttempt | null {
    const attempts = this.getUserAttempts();
    return attempts.find(a => a.id === attemptId) || null;
  }

  static getAttemptsByQuizId(quizId: number): QuizAttempt[] {
    const attempts = this.getUserAttempts();
    return attempts.filter(a => a.quiz_id === quizId);
  }

  static hasCompletedQuiz(quizId: number): boolean {
    const attempts = this.getAttemptsByQuizId(quizId);
    return attempts.some(a => a.is_completed);
  }

  static getLatestAttemptForQuiz(quizId: number): QuizAttempt | null {
    const attempts = this.getAttemptsByQuizId(quizId);
    if (attempts.length === 0) return null;
    
    return attempts.reduce((latest, current) => {
      const latestDate = new Date(latest.started_at);
      const currentDate = new Date(current.started_at);
      return currentDate > latestDate ? current : latest;
    });
  }
  static completeAttempt(attemptId: number, finalAnswers: any[]): boolean {
  try {
    const attempts = this.getUserAttempts();
    const attemptIndex = attempts.findIndex(a => a.id === attemptId);
    
    if (attemptIndex === -1) return false;
    
    const attempt = attempts[attemptIndex];
    const elapsedTime = TimeUtils.getElapsedTimeFromStart(attempt.started_at);
    
    attempts[attemptIndex] = {
      ...attempt,
      is_completed: true,
      completed_at: new Date().toISOString(),
      time_taken: TimeUtils.validateTime(elapsedTime),
    };
    
    localStorage.setItem(USER_ATTEMPTS_KEY, JSON.stringify(attempts));
    return true;
  } catch (error) {
    console.error('Error completing attempt:', error);
    return false;
  }
}
  static getIncompleteAttempt(quizId: number): QuizAttempt | null {
    const attempts = this.getAttemptsByQuizId(quizId);
    return attempts.find(a => !a.is_completed) || null;
  }

// Quiz Results
  
  static saveResult(result: QuizResult): void {
    try {
      // Validate and normalize time_taken
      const normalizedResult = {
        ...result,
        time_taken: TimeUtils.validateTime(result.time_taken)
      };

      const existingResults = this.getUserResults();
      const updatedResults = existingResults.filter(r => r.attempt_id !== result.attempt_id);
      updatedResults.push(normalizedResult);
      
      localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(updatedResults));
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  }

  static getUserResults(): QuizResult[] {
    try {
      const results = localStorage.getItem(QUIZ_RESULTS_KEY);
      return results ? JSON.parse(results) : [];
    } catch (error) {
      console.error('Error loading user results:', error);
      return [];
    }
  }

  static getResultByAttemptId(attemptId: number): QuizResult | null {
    const results = this.getUserResults();
    return results.find(r => r.attempt_id === attemptId) || null;
  }

// Statistics
  
  static getUserStats() {
    const attempts = this.getUserAttempts();
    const completedAttempts = attempts.filter(a => a.is_completed);
    
    if (completedAttempts.length === 0) {
      return {
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        passRate: 0,
        totalTimeSpent: 0,
        averageTimePerQuiz: 0,
        favoriteCategory: null,
        recentActivity: []
      };
    }

    const totalScore = completedAttempts.reduce((sum, a) => sum + a.score, 0);
    const totalPossibleScore = completedAttempts.reduce((sum, a) => sum + a.total_questions, 0);
    const averageScore = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
    
    const passedAttempts = completedAttempts.filter(a => {
      const percentage = a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0;
      return percentage >= 60;
    });
    
    const passRate = completedAttempts.length > 0 ? (passedAttempts.length / completedAttempts.length) * 100 : 0;
    
    // Calculate time statistics
    const totalTimeSpent = completedAttempts.reduce((sum, a) => {
      return sum + TimeUtils.validateTime(a.time_taken || 0);
    }, 0);
    
    const averageTimePerQuiz = completedAttempts.length > 0 ? totalTimeSpent / completedAttempts.length : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = attempts.filter(a => new Date(a.started_at) >= sevenDaysAgo);

    return {
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
      totalTimeSpent,
      averageTimePerQuiz: Math.round(averageTimePerQuiz),
      recentActivity: recentActivity.length
    };
  }

// Time related utilites
  static getAttemptElapsedTime(attempt: QuizAttempt): number {
    if (attempt.is_completed && attempt.time_taken) {
      return TimeUtils.validateTime(attempt.time_taken);
    }
    
    return TimeUtils.getElapsedTimeFromStart(attempt.started_at);
  }

  static updateAttemptTimeTaken(attemptId: number, timeTaken: number): boolean {
    try {
      const attempts = this.getUserAttempts();
      const attemptIndex = attempts.findIndex(a => a.id === attemptId);
      
      if (attemptIndex === -1) return false;
      
      attempts[attemptIndex].time_taken = TimeUtils.validateTime(timeTaken);
      localStorage.setItem(USER_ATTEMPTS_KEY, JSON.stringify(attempts));
      return true;
    } catch (error) {
      console.error('Error updating attempt time taken:', error);
      return false;
    }
  }

// Cleanup
  
  static clearUserData(): void {
    localStorage.removeItem(USER_ATTEMPTS_KEY);
    localStorage.removeItem(QUIZ_RESULTS_KEY);
  }

  static clearOldAttempts(daysOld: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const attempts = this.getUserAttempts();
    const recentAttempts = attempts.filter(a => new Date(a.started_at) >= cutoffDate);
    
    const results = this.getUserResults();
    const recentAttemptIds = recentAttempts.map(a => a.id);
    const recentResults = results.filter(r => recentAttemptIds.includes(r.attempt_id));
    
    localStorage.setItem(USER_ATTEMPTS_KEY, JSON.stringify(recentAttempts));
    localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(recentResults));
  }
}

export default QuizStorageService;