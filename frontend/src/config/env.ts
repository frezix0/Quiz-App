export const ENV = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    API_TIMEOUT: 30000,

    // App Configuration
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Quiz App',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

    // Feature Flags
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE !== 'false',

    // Debug
    DEBUG: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV,

    // Validation Rules
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_QUIZ_TITLE_LENGTH: 255,
        MAX_QUESTION_LENGTH: 2000,
        MAX_OPTION_LENGTH: 500,
        MIN_OPTIONS_FOR_MULTIPLE_CHOICE: 2,
        MAX_OPTIONS_FOR_MULTIPLE_CHOICE: 10,
    },

    // UI Configuration
    UI: {
        TOAST_DURATION: 3000,
        DEBOUNCE_DELAY: 300,
        ANIMATION_DURATION: 300,
    },

    // Cache Configuration
    CACHE: {
        QUIZ_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
        CATEGORIES_CACHE_TIME: 30 * 60 * 1000, // 30 minutes
    },
} as const;

// Log configuration in development
if (ENV.DEBUG) {
    console.log('Environment Configuration:', ENV);
}