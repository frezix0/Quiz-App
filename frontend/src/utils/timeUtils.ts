import { QuizAttempt } from "../types/quiz";

export class TimeUtils {
  /**
   * Format waktu dari detik ke format MM:SS
   * Fungsi ini menjadi single source of truth untuk format waktu
   */
  static formatTime(seconds: number): string {
    if (seconds < 0 || isNaN(seconds)) return '0:00';
    
    const actualSeconds = Math.floor(seconds);
    const mins = Math.floor(actualSeconds / 60);
    const secs = actualSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate elapsed time dari start timestamp
   * Fungsi ini menjadi single source untuk menghitung elapsed time
   */
  static getElapsedTimeFromStart(startTimestamp: string | Date): number {
    const startTime = new Date(startTimestamp).getTime();
    const currentTime = Date.now();
    return Math.floor((currentTime - startTime) / 1000);
  }

  /**
   * Calculate elapsed time dari start dan end timestamp
   */
  static getElapsedTimeBetween(startTimestamp: string | Date, endTimestamp: string | Date): number {
    const startTime = new Date(startTimestamp).getTime();
    const endTime = new Date(endTimestamp).getTime();
    return Math.floor((endTime - startTime) / 1000);
  }
  /**
 * Calculate average time dari array attempts
 */
static calculateAverageTime(attempts: QuizAttempt[]): number {
  const completedAttempts = attempts.filter(a => a.is_completed && a.time_taken);
  
  if (completedAttempts.length === 0) return 0;
  
  const totalTime = completedAttempts.reduce((sum, attempt) => {
    return sum + this.validateTime(attempt.time_taken || 0);
  }, 0);
  
  return Math.round(totalTime / completedAttempts.length);
}
  /**
   * Get remaining time untuk timed quiz
   */
  static getRemainingTime(startTimestamp: string | Date, timeLimit: number): number {
    const elapsed = this.getElapsedTimeFromStart(startTimestamp);
    return Math.max(0, timeLimit - elapsed);
  }

  /**
   * Validate time value - pastikan selalu positif dan dalam range yang wajar
   */
  static validateTime(seconds: number): number {
    if (isNaN(seconds) || seconds < 0) return 0;
    // Max 24 hours (86400 seconds) untuk quiz
    return Math.min(seconds, 86400);
  }

  /**
   * Format time untuk display dengan context
   */
  static formatTimeWithContext(seconds: number, context: 'elapsed' | 'remaining' | 'total' = 'total'): string {
    const formattedTime = this.formatTime(seconds);
    
    switch (context) {
      case 'elapsed':
        return `${formattedTime} elapsed`;
      case 'remaining':
        return seconds <= 0 ? 'Time up!' : `${formattedTime} remaining`;
      default:
        return formattedTime;
    }
  }

  /**
   * Check if time is critical (less than 5 minutes for countdown)
   */
  static isCriticalTime(seconds: number): boolean {
    return seconds > 0 && seconds <= 300; // 5 minutes
  }

  /**
   * Get time display class for styling
   */
  static getTimeDisplayClass(seconds: number, context: 'remaining' | 'elapsed' = 'elapsed'): string {
    if (context === 'remaining' && this.isCriticalTime(seconds)) {
      return 'text-red-600 font-bold';
    }
    return 'text-gray-900';
  }
}

export default TimeUtils;