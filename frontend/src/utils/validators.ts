import { ENV } from '../config/env';

export class Validators {
    // Validasi quiz title
    static isValidQuizTitle(title: string): boolean {
        const trimmed = title.trim();
        return trimmed.length >= 3 && trimmed.length <= ENV.VALIDATION.MAX_QUIZ_TITLE_LENGTH;
    }

    // Validasi question text
    static isValidQuestionText(text: string): boolean {
        const trimmed = text.trim();
        return trimmed.length >= 5 && trimmed.length <= ENV.VALIDATION.MAX_QUESTION_LENGTH;
    }

    // Validasi option text
    static isValidOptionText(text: string): boolean {
        const trimmed = text.trim();
        return trimmed.length >= 1 && trimmed.length <= ENV.VALIDATION.MAX_OPTION_LENGTH;
    }

    // Validasi email
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validasi multiple choice options
    static isValidMultipleChoiceOptions(options: { option_text: string; is_correct: boolean }[]): string | null {
        if (options.length < ENV.VALIDATION.MIN_OPTIONS_FOR_MULTIPLE_CHOICE) {
            return `Minimum ${ENV.VALIDATION.MIN_OPTIONS_FOR_MULTIPLE_CHOICE} options required`;
        }

        if (options.length > ENV.VALIDATION.MAX_OPTIONS_FOR_MULTIPLE_CHOICE) {
            return `Maximum ${ENV.VALIDATION.MAX_OPTIONS_FOR_MULTIPLE_CHOICE} options allowed`;
        }

        // Check if any option is empty
        if (options.some(opt => !opt.option_text.trim())) {
            return 'All options must have text';
        }

        // Check if exactly one is marked as correct
        const correctCount = options.filter(opt => opt.is_correct).length;
        if (correctCount !== 1) {
            return 'Exactly one option must be marked as correct';
        }

        return null;
    }

    // Validasi time limit
    static isValidTimeLimit(minutes: number): boolean {
        return minutes >= 0 && minutes <= 480; // Max 8 hours
    }

    // Validasi points
    static isValidPoints(points: number): boolean {
        return points >= 1 && points <= 100;
    }
}

export default Validators;