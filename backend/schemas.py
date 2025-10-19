from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Enums
class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class QuestionType(str, Enum):
    multiple_choice = "multiple_choice"
    true_false = "true_false"
    text = "text"

# Answer Option
class AnswerOptionCreate(BaseModel):
    option_text: str = Field(..., min_length=1, max_length=500)
    is_correct: bool = False
    option_order: int = Field(default=0, ge=0)

class AnswerOptionResponse(AnswerOptionCreate):
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

# Questions
class QuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=5, max_length=2000)
    question_type: QuestionType = QuestionType.multiple_choice
    points: int = Field(default=1, ge=1, le=100)
    explanation: Optional[str] = Field(default=None)
    options: List[AnswerOptionCreate] = Field(default_factory=list)
    class Config:
        from_attributes = True

class QuestionResponse(QuestionCreate):
    id: int
    quiz_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionPublic(BaseModel):
    id: int
    question_text: str
    question_type: QuestionType
    points: int
    explanation: Optional[str] = None
    options: List[AnswerOptionPublic] = []
    
    class Config:
        from_attributes = True

# Quizes
class QuizCreateRequest(BaseModel):
    """Schema untuk create quiz"""
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    category: Optional[str] = Field(default=None, max_length=100)
    difficulty_level: DifficultyLevel = DifficultyLevel.medium
    time_limit: int = Field(default=0, ge=0)
    is_active: bool = True
    questions: List[QuestionCreate] = Field(default_factory=list)  # ✅ Optional

class QuizUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3)
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: Optional[DifficultyLevel] = None
    time_limit: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None

class QuizResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: DifficultyLevel
    time_limit: int
    is_active: bool
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
    is_active: bool
    
    class Config:
        from_attributes = True

class QuizWithQuestions(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: DifficultyLevel
    time_limit: int
    is_active: bool
    questions: List[QuestionPublic] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Quiz Attempts
class QuizAttemptCreate(BaseModel):
    quiz_id: int = Field(..., gt=0)
    participant_name: Optional[str] = Field(default=None, max_length=255)
    participant_email: Optional[EmailStr] = None

class QuizAttemptResponse(QuizAttemptCreate):
    id: int
    score: int = 0
    total_questions: int = 0
    time_taken: int = 0
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_completed: bool = False
    
    class Config:
        from_attributes = True

# User Answers
class UserAnswerCreate(BaseModel):
    question_id: int = Field(..., gt=0)
    selected_option_id: Optional[int] = Field(default=None, gt=0)
    text_answer: Optional[str] = Field(default=None, max_length=1000)

class UserAnswerResponse(UserAnswerCreate):
    id: int
    attempt_id: int
    is_correct: bool
    answered_at: datetime
    
    class Config:
        from_attributes = True

class UserAnswerSubmit(BaseModel):
    answers: List[UserAnswerCreate] = Field(min_items=1)

# Results
class AnswerDetail(BaseModel):
    question: str
    user_answer: str
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

class QuizResult(BaseModel):
    attempt_id: int
    score: int
    total_questions: int
    percentage: float = Field(..., ge=0, le=100)
    time_taken: int
    is_passed: bool
    correct_answers: List[AnswerDetail] = []
    incorrect_answers: List[AnswerDetail] = []

class QuizStats(BaseModel):
    quiz_id: int
    quiz_title: str
    total_attempts: int = 0
    average_score: float = 0.0
    pass_rate: float = 0.0
    average_time: float = 0.0