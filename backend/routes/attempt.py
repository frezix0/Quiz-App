from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import List
import logging

from database import get_db
from crud import QuizAttemptCRUD, QuizCRUD, QuestionCRUD
from schemas import (
    QuizAttemptCreate, QuizAttemptResponse, 
    UserAnswerSubmit, QuizResult, QuestionCreate
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/attempt", tags=["attempt"])

@router.post("/", response_model=QuizAttemptResponse)
def start_quiz_attempt(
    attempt: QuizAttemptCreate,
    db: Session = Depends(get_db)
):
    """Start a new quiz attempt"""
    try:
        logger.info(f"Starting quiz attempt for quiz_id: {attempt.quiz_id}")
        result = QuizAttemptCRUD.create_attempt(db, attempt)
        logger.info(f"Successfully created attempt with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{attempt_id}", response_model=QuizAttemptResponse)
def get_quiz_attempt(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    """Get quiz attempt details"""
    try:
        attempt = QuizAttemptCRUD.get_attempt(db, attempt_id)
        if not attempt:
            raise HTTPException(status_code=404, detail="Quiz attempt not found")
        return attempt
    except Exception as e:
        logger.error(f"Error getting attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{attempt_id}/submit", response_model=QuizAttemptResponse)
def submit_quiz_answers(
    attempt_id: int,
    answers: UserAnswerSubmit,
    db: Session = Depends(get_db)
):
    """Submit answers for a quiz attempt"""
    try:
        logger.info(f"Submitting answers for attempt_id: {attempt_id}")
        result = QuizAttemptCRUD.submit_answers(db, attempt_id, answers.answers)
        logger.info(f"Successfully submitted answers for attempt: {attempt_id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error for attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error submitting answers for attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{attempt_id}/results", response_model=QuizResult)
def get_quiz_results(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    """Get results for a completed quiz attempt"""
    try:
        result = QuizAttemptCRUD.get_quiz_results(db, attempt_id)
        if not result:
            raise HTTPException(status_code=404, detail="Quiz results not found")
        return result
    except Exception as e:
        logger.error(f"Error getting results for attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{attempt_id}/time")
def update_time_taken(
    attempt_id: int,
    time_data: dict,
    db: Session = Depends(get_db)
):
    """Update time taken for an attempt"""
    try:
        attempt = QuizAttemptCRUD.get_attempt(db, attempt_id)
        if not attempt:
            raise HTTPException(status_code=404, detail="Quiz attempt not found")
        
        if attempt.is_completed:
            raise HTTPException(status_code=400, detail="Cannot update time for completed quiz")
        
        attempt.time_taken = time_data.get('time_taken', 0)
        db.commit()
        db.refresh(attempt)
        
        return JSONResponse(
            status_code=200,
            content={"message": "Time updated successfully"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating time for attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{attempt_id}")
def delete_quiz_attempt(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    """Delete a quiz attempt (Admin only)"""
    try:
        from models import QuizAttempt, UserAnswer
        
        attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
        if not attempt:
            raise HTTPException(status_code=404, detail="Quiz attempt not found")
        
        # Delete related user answers first
        db.query(UserAnswer).filter(UserAnswer.attempt_id == attempt_id).delete()
        
        # Delete the attempt
        db.delete(attempt)
        db.commit()
        
        return JSONResponse(
            status_code=200,
            content={"message": "Quiz attempt deleted successfully"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Add endpoint to handle question creation with better error handling
@router.post("/question/{quiz_id}", response_model=dict)
def create_question_with_error_handling(
    quiz_id: int,
    question: QuestionCreate,
    db: Session = Depends(get_db)
):
    """Create a new question for a quiz with improved error handling"""
    try:
        logger.info(f"Creating question for quiz_id: {quiz_id}")
        
        # Verify quiz exists
        quiz = QuizCRUD.get_quiz(db, quiz_id)
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Create the question
        result = QuestionCRUD.create_question(db, quiz_id, question)
        logger.info(f"Successfully created question with id: {result.id}")
        
        return JSONResponse(
            status_code=201,
            content={
                "message": "Question created successfully",
                "question_id": result.id,
                "question_text": result.question_text
            }
        )
    except HTTPException:
        raise
    except IntegrityError as e:
        logger.error(f"Database integrity error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail="Database constraint violation")
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        logger.error(f"Unexpected error creating question: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")