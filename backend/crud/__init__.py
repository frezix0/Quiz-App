from crud.base import BaseCRUD
from crud.quiz import QuizCRUD
from crud.question import QuestionCRUD
from crud.attempt import QuizAttemptCRUD

__all__ = [
    "BaseCRUD",
    "QuizCRUD",
    "QuestionCRUD",
    "QuizAttemptCRUD"
]