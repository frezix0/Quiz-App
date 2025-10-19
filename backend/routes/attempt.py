from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from logger import logger

from backend.database import get_db
from crud import QuizAttemptCRUD
from schemas import (
    QuizAttemptCreate, QuizAttemptResponse,
    UserAnswerSubmit, QuizResult
)
from exceptions import (
    AttemptNotFoundException, QuizAlreadyCompletedException,
    QuizNotFoundException
)

router = APIRouter(prefix="/attempt", tags=["attempt"])

@router.post("/", response_model=QuizAttemptResponse)
def start_quiz_attempt(
    attempt: QuizAttemptCreate,
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Starting quiz attempt untuk quiz_id: {attempt.quiz_id}")
        result = QuizAttemptCRUD.create_attempt(db, attempt)
        logger.info(f"Successfully created attempt dengan id: {result.id}")
        return result
    except QuizNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error starting quiz attempt: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{attempt_id}", response_model=QuizAttemptResponse)
def get_quiz_attempt(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    try:
        attempt = QuizAttemptCRUD.get_attempt(db, attempt_id)
        if not attempt:
            raise AttemptNotFoundException(attempt_id)
        return attempt
    except AttemptNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error getting attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{attempt_id}/submit", response_model=QuizAttemptResponse)
def submit_quiz_answers(
    attempt_id: int,
    answers: UserAnswerSubmit,
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Submitting answers untuk attempt_id: {attempt_id}")
        result = QuizAttemptCRUD.submit_answers(db, attempt_id, answers.answers)
        logger.info(f"Successfully submitted answers untuk attempt: {attempt_id}")
        return result
    except (AttemptNotFoundException, QuizAlreadyCompletedException):
        raise
    except Exception as e:
        logger.error(f"Error submitting answers untuk attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=400, detail="Error submitting answers")

@router.get("/{attempt_id}/results", response_model=QuizResult)
def get_quiz_results(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    try:
        result = QuizAttemptCRUD.get_quiz_results(db, attempt_id)
        if not result:
            raise AttemptNotFoundException(attempt_id)
        return result
    except AttemptNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error getting results untuk attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{attempt_id}/time")
def update_time_taken(
    attempt_id: int,
    time_data: dict,
    db: Session = Depends(get_db)
):
    try:
        time_taken = time_data.get('time_taken', 0)
        if not isinstance(time_taken, int) or time_taken < 0:
            raise ValueError("time_taken harus integer positif")
        
        QuizAttemptCRUD.update_time_taken(db, attempt_id, time_taken)
        
        return JSONResponse(
            status_code=200,
            content={"message": "Time berhasil diupdate"}
        )
    except AttemptNotFoundException:
        raise
    except QuizAlreadyCompletedException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating time untuk attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{attempt_id}")
def delete_quiz_attempt(
    attempt_id: int,
    db: Session = Depends(get_db)
):
    try:
        if not QuizAttemptCRUD.delete_attempt(db, attempt_id):
            raise AttemptNotFoundException(attempt_id)
        
        return JSONResponse(
            status_code=200,
            content={"message": "Quiz attempt berhasil dihapus"}
        )
    except AttemptNotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error deleting attempt {attempt_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")