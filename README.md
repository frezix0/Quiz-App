# Quiz App

A feature-rich and extensible quiz application built with **TypeScript**, **Python**, and a modern tech stack. The Quiz App allows users to create, take, and manage quizzes with support for multiple question types, scoring, and analytics. Perfect for educators, students, and anyone interested in interactive learning!

---

## Features

- **Create Quizzes**: Intuitive interface to build quizzes with various question formats (multiple choice, true/false, etc.).
- **Take Quizzes**: Engaging quiz experience with real-time feedback and scoring.
- **Progress Tracking**: View history, scores, and analytics of completed quizzes.
- **Admin Panel**: Manage users, quizzes, and review statistics.
- **Responsive Design**: Works seamlessly across desktop and mobile devices.

---

## Tech Stack

- **Frontend**: TypeScript
- **Backend**: Python (FastAPI)
- **Database**: PostgreSQL (PLpgSQL)

---

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.8+
- PostgreSQL

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/frezix0/Quiz-App.git
    ```

2. **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3. **Install Backend Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Set up the Database:**
    - Create a PostgreSQL database.
    - Run sample data (see `/backend/sample_data.py`).


5. **Run the Application:**
    - Start backend server:
        ```bash
        python main.py
        ```
    - Start frontend:
        ```bash
        npm run dev
        ```

---

## Usage

- Create a new quiz or take existing quizzes.
- View your progress and statistics on your dashboard.
- Admins can manage quizzes and users via the admin panel.

---

## Folder Structure

```
Quiz-App/
├── backend/                  # Python/FastAPI Backend
│   ├── config.py             # Application and Database Configuration
│   ├── database.py           # SQLAlchemy Engine and Session Setup
│   ├── exceptions.py         # Custom HTTP Exceptions
│   ├── logger.py             # Logging Configuration
│   ├── main.py               # FastAPI Entry Point, CORS, and Routers
│   ├── models.py             # SQLAlchemy Model Definition (Quiz, Question, etc.)
│   ├── requirements.txt      # Python Dependencies
│   ├── schemas.py            # Pydantic Schemas for API Requests/Responses
│   ├── sample_data.py        # Script to create sample data in the database
│   ├── crud/                 # Create, Read, Update, Delete (CRUD) Operations
│   │   ├── attempt.py        # CRUD logic for QuizAttempt and UserAnswer
│   │   ├── question.py       # CRUD logic for Question and AnswerOption
│   │   └── quiz.py           # CRUD logic for Quiz
│   └── routes/               # API Endpoints Definition (Routers)
│       ├── attempt.py        # Routes for starting/submitting quiz attempts
│       ├── health.py         # Health check and root endpoint
│       └── quiz.py           # Routes for Quiz and Question management
├── database/                 # SQL scripts for database setup
│   └── init.sql              # PostgreSQL table creation script
├── frontend/                 # React/TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx           # Main component and React Router Setup
│   │   ├── main.tsx          # Application entry point (ReactDOM)
│   │   ├── config/
│   │   │   └── env.ts        # Environment configuration (API URL, Cache Time, etc.)
│   │   ├── components/       # Reusable UI Components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Layout.tsx    # Navigation and Footer
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── QuizCard.tsx
│   │   │   ├── QuizStatusCard.tsx
│   │   │   └── ResultCard.tsx
│   │   ├── hooks/            # Custom React Hooks
│   │   │   ├── useApi.ts     # Hook for data fetching, caching, and async actions
│   │   │   └── useQuiz.ts    # Hook for quiz state management (navigation, timer)
│   │   ├── pages/            # Main application pages
│   │   │   ├── AdminPanel.tsx      # Quiz Management and Statistics Dashboard
│   │   │   ├── Home.tsx            # Quiz List and Filtering Page
│   │   │   ├── QuestionManagement.tsx # Manage questions for a specific quiz
│   │   │   ├── Quiz.tsx            # Quiz taking page
│   │   │   └── Results.tsx         # Quiz results page
│   │   ├── services/
│   │   │   └── api.ts        # Axios service layer for interacting with the FastAPI backend
│   │   ├── styles/
│   │   │   └── global.css    # Tailwind CSS base/components/utilities and global styling
│   │   ├── types/
│   │   │   └── quiz.ts       # TypeScript Type Definitions for Quiz, Question, etc.
│   │   └── utils/            # Utility functions
│   │       ├── quizStorage.ts # Utility for managing local storage (attempts, results)
│   │       ├── timeUtils.ts   # Utility for formatting and calculating time
│   │       └── validators.ts  # Utility for input validation checks
│   └── vite.config.ts        # Vite Configuration (proxy setup, build options, alias)
├── package.json              # Frontend Dependencies (React, Vite, etc.)
├── package-lock.json
└── README.md        # Documentation QuizApp
```

---

## Acknowledgments

- [TypeScript](https://www.typescriptlang.org/)
- [Python](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [React](https://react.dev/)


