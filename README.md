# Quiz App

A feature-rich and extensible quiz application built with **TypeScript**, **Python**, and a modern tech stack. The Quiz App allows users to create, take, and manage quizzes with support for multiple question types, scoring, and analytics. Perfect for educators, students, and anyone interested in interactive learning!

---

## Features

- **Create Quizzes**: Intuitive interface to build quizzes with various question formats (multiple choice, true/false, etc.).
- **Take Quizzes**: Engaging quiz experience with real-time feedback and scoring.
- **User Authentication**: Secure login/logout system for personalized quiz management.
- **Progress Tracking**: View history, scores, and analytics of completed quizzes.
- **Admin Panel**: Manage users, quizzes, and review statistics.
- **Responsive Design**: Works seamlessly across desktop and mobile devices.

---

## Tech Stack

- **Frontend**: TypeScript, JavaScript, HTML, CSS
- **Backend**: Python (FastAPI/Django/Flask, depending on implementation)
- **Database**: PostgreSQL (PLpgSQL)
- **Other**: RESTful APIs, JWT Authentication

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
    cd Quiz-App
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
    - Run migration scripts (see `/backend/migrations`).

5. **Configure Environment Variables:**
    - Copy `.env.example` to `.env` and fill in required values.

6. **Run the Application:**
    - Start backend server:
        ```bash
        python backend/app.py
        ```
    - Start frontend:
        ```bash
        npm start
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
├── backend/        # Python backend (API, models, migrations)
├── frontend/       # TypeScript/React frontend
├── database/       # SQL scripts, schema, migrations
├── public/         # Static files
└── README.md
```

---

## Acknowledgments

- [TypeScript](https://www.typescriptlang.org/)
- [Python](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [React](https://react.dev/) (if applicable)

---

## Contact

For questions or feedback, open an issue or contact [frezix0](https://github.com/frezix0).
