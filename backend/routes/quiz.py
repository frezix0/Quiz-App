from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from logger import logger

from database import get_db
from crud import QuizCRUD, QuestionCRUD
from schemas import (
    QuizCreateRequest, QuizResponse, QuizUpdateRequest, QuizPublic,
    QuizWithQuestions, QuizStats, QuestionCreate, QuestionResponse, QuestionUpdate
)
from exceptions import QuizNotFoundException

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.get("/", response_model=List[QuizPublic])
def get_quizzes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        quizzes = QuizCRUD.get_quizzes(db, skip=skip, limit=limit, category=category)
        
        quiz_list = []
        for quiz in quizzes:
            quiz_data = quiz.__dict__.copy()
            quiz_data['question_count'] = len(quiz.questions)
            quiz_list.append(quiz_data)
        
        return quiz_list
    except Exception as e:
        logger.error(f"Error getting quizzes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{quiz_id}", response_model=QuizWithQuestions)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    try:
        quiz = QuizCRUD.get_quiz_with_questions(db, quiz_id)
        if not quiz:
            raise QuizNotFoundException(quiz_id)
        
        for question in quiz.questions:
            for option in question.options:
                option.is_correct = False
        return quiz
    except QuizNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error getting quiz {quiz_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/", response_model=QuizResponse)
def create_quiz(quiz: QuizCreateRequest, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating quiz: {quiz.title}")
        return QuizCRUD.create_quiz(db, quiz)
    except Exception as e:
        logger.error(f"Error creating quiz: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{quiz_id}", response_model=QuizResponse)
def update_quiz(
    quiz_id: int,
    quiz_update: QuizUpdateRequest,
    db: Session = Depends(get_db)
):
    try:
        updated_quiz = QuizCRUD.update_quiz(db, quiz_id, quiz_update)
        if not updated_quiz:
            raise QuizNotFoundException(quiz_id)
        return updated_quiz
    except QuizNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error updating quiz: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    try:
        if not QuizCRUD.delete_quiz(db, quiz_id):
            raise QuizNotFoundException(quiz_id)
        return {"message": "Quiz deleted successfully"}
    except QuizNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error deleting quiz: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{quiz_id}/stats", response_model=QuizStats)
def get_quiz_stats(quiz_id: int, db: Session = Depends(get_db)):
    try:
        from crud import QuizAttemptCRUD
        stats = QuizAttemptCRUD.get_quiz_stats(db, quiz_id)
        if not stats:
            raise QuizNotFoundException(quiz_id)
        return stats
    except QuizNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/categories/", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    try:
        return QuizCRUD.get_categories(db)
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{quiz_id}/question/", response_model=QuestionResponse)
def create_question(
    quiz_id: int,
    question: QuestionCreate,
    db: Session = Depends(get_db)
):
    try:
        quiz = QuizCRUD.get_quiz(db, quiz_id)
        if not quiz:
            raise QuizNotFoundException(quiz_id)
        
        return QuestionCRUD.create_question(db, quiz_id, question)
    except QuizNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error creating question: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/question/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: int,
    question_update: QuestionUpdate,
    db: Session = Depends(get_db)
):
    try:
        updated_question = QuestionCRUD.update_question(db, question_id, question_update)
        if not updated_question:
            raise HTTPException(status_code=404, detail="Question not found")
        return updated_question
    except Exception as e:
        logger.error(f"Error updating question: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
@router.delete("/question/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    try:
        if not QuestionCRUD.delete_question(db, question_id):
            raise HTTPException(status_code=404, detail="Question not found")
        return {"message": "Question deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting question: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")