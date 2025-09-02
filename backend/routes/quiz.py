from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from crud import (
    QuizCRUD, QuestionCRUD
) 
from schemas import (
    QuizCreate, QuizResponse, QuizUpdate, QuizPublic, 
    QuizWithQuestions, QuizStats, QuestionCreate, QuestionResponse, QuestionUpdate
)

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.get("/", response_model=List[QuizPublic])
def get_quizzes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of available quizzes"""
    quizzes = QuizCRUD.get_quizzes(db, skip=skip, limit=limit, category=category)
    
    # Add question count to each quiz
    quiz_list = []
    for quiz in quizzes:
        quiz_data = quiz.__dict__.copy()
        quiz_data['question_count'] = len(quiz.questions)
        quiz_list.append(quiz_data)
    
    return quiz_list

@router.get("/{quiz_id}", response_model=QuizWithQuestions)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get a specific quiz with questions"""
    quiz = QuizCRUD.get_quiz_with_questions(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Remove correct answer information from public response
    for question in quiz.questions:
        for option in question.options:
            option.is_correct = False  # Hide correct answers
    
    return quiz

@router.post("/", response_model=QuizResponse)
def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    """Create a new quiz (Admin only)"""
    try:
        return QuizCRUD.create_quiz(db, quiz)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{quiz_id}", response_model=QuizResponse)
def update_quiz(
    quiz_id: int, 
    quiz_update: QuizUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing quiz (Admin only)"""
    updated_quiz = QuizCRUD.update_quiz(db, quiz_id, quiz_update)
    if not updated_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return updated_quiz

@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Delete a quiz (Admin only)"""
    if not QuizCRUD.delete_quiz(db, quiz_id):
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {"message": "Quiz deleted successfully"}

@router.get("/{quiz_id}/stats", response_model=QuizStats)
def get_quiz_stats(quiz_id: int, db: Session = Depends(get_db)):
    """Get statistics for a specific quiz"""
    from crud import QuizAttemptCRUD
    stats = QuizAttemptCRUD.get_quiz_stats(db, quiz_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return stats

@router.get("/categories/", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Get list of available quiz categories"""
    from models import Quiz
    categories = db.query(Quiz.category).filter(
        Quiz.category.isnot(None), 
        Quiz.is_active == True
    ).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

@router.post("/{quiz_id}/question/", response_model=QuestionResponse)
def create_question(
    quiz_id: int,
    question: QuestionCreate,
    db: Session = Depends(get_db)
):
    """Create a new question for a quiz"""
    # Verify quiz exists
    quiz = QuizCRUD.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return QuestionCRUD.create_question(db, quiz_id, question)

@router.delete("/question/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    """Delete a question"""
    if not QuestionCRUD.delete_question(db, question_id):
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}