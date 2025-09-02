from pydantic import BaseModel, EmailStr
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class QuestionType(str, Enum):
    multiple_choice = "multiple_choice"
    true_false = "true_false"
    text = "text"

# Answer Option Schemas
class AnswerOptionBase(BaseModel):
    option_text: str
    is_correct: bool = False
    option_order: int = 0

class AnswerOptionCreate(AnswerOptionBase):
    pass

class AnswerOptionResponse(AnswerOptionBase):
    id: int
    question_id: int
    
    class Config:
        from_attributes = True

class AnswerOptionPublic(BaseModel):
    id: int
    option_text: str
    option_order: int
    
    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType = QuestionType.multiple_choice
    points: int = 1
    explanation: Optional[str] = None

class QuestionCreate(QuestionBase):
    options: List[AnswerOptionCreate] = []

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    options: List[AnswerOptionResponse] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionPublic(QuestionBase):
    id: int
    options: List[AnswerOptionPublic] = []
    
    class Config:
        from_attributes = True

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: DifficultyLevel = DifficultyLevel.medium
    time_limit: int = 0
    is_active: bool = True

class QuizCreate(QuizBase):
    questions: List[QuestionCreate] = []

class QuizResponse(QuizBase):
    id: int
    questions: List[QuestionResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class QuizPublic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: DifficultyLevel
    time_limit: int
    question_count: int
    
    class Config:
        from_attributes = True

class QuizWithQuestions(QuizBase):
    id: int
    questions: List[QuestionPublic] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Quiz Attempt Schemas
class QuizAttemptBase(BaseModel):
    participant_name: Optional[str] = None
    participant_email: Optional[str] = None

class QuizAttemptCreate(QuizAttemptBase):
    quiz_id: int

class QuizAttemptResponse(QuizAttemptBase):
    id: int
    quiz_id: int
    score: int = 0
    total_questions: int = 0
    time_taken: int = 0
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_completed: bool = False
    
    class Config:
        from_attributes = True

# User Answer Schemas
class UserAnswerBase(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    text_answer: Optional[str] = None

class UserAnswerCreate(UserAnswerBase):
    pass

class UserAnswerResponse(UserAnswerBase):
    id: int
    attempt_id: int
    is_correct: bool
    answered_at: datetime
    
    class Config:
        from_attributes = True

class UserAnswerSubmit(BaseModel):
    answers: List[UserAnswerCreate]

# Result Schemas
class QuizResult(BaseModel):
    attempt_id: int
    score: int
    total_questions: int
    percentage: float
    time_taken: int
    is_passed: bool
    correct_answers: List[dict]
    incorrect_answers: List[dict]

class QuizStats(BaseModel):
    quiz_id: int
    quiz_title: str
    total_attempts: int
    average_score: float
    pass_rate: float
    average_time: float

# Update Schemas
class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: Optional[DifficultyLevel] = None
    time_limit: Optional[int] = None
    is_active: Optional[bool] = None

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    points: Optional[int] = None
    explanation: Optional[str] = None

class AnswerOptionCreate(BaseModel):
    option_text: str
    is_correct: bool
    option_order: int

class QuestionCreate(BaseModel):
    question_text: str
    question_type: str
    points: int = 1
    explanation: Optional[str] = None
    options: List[AnswerOptionCreate]

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    points: int
    explanation: Optional[str]
    options: List[dict]

    class Config:
        from_attributes = True