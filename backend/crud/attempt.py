from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime
from logger import logger

from models import Quiz, Question, AnswerOption, QuizAttempt, UserAnswer
from schemas import QuizAttemptCreate, UserAnswerCreate, QuizResult, QuizStats, AnswerDetail
from exceptions import AttemptNotFoundException, QuizNotFoundException, QuizAlreadyCompletedException

class QuizAttemptCRUD:
    @staticmethod
    def create_attempt(db: Session, attempt: QuizAttemptCreate) -> QuizAttempt:
        try:
            quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
            if not quiz:
                raise QuizNotFoundException(attempt.quiz_id)
            
            question_count = db.query(Question).filter(
                Question.quiz_id == attempt.quiz_id
            ).count()
            
            db_attempt = QuizAttempt(
                quiz_id=attempt.quiz_id,
                participant_name=attempt.participant_name,
                participant_email=attempt.participant_email,
                total_questions=question_count
            )
            db.add(db_attempt)
            db.commit()
            db.refresh(db_attempt)
            logger.info(f"Created attempt dengan id {db_attempt.id}")
            return db_attempt
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating attempt: {str(e)}")
            raise
    
    @staticmethod
    def get_attempt(db: Session, attempt_id: int) -> Optional[QuizAttempt]:
        try:
            return db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
        except Exception as e:
            logger.error(f"Error fetching attempt {attempt_id}: {str(e)}")
            raise
    
    @staticmethod
    def submit_answers(
        db: Session,
        attempt_id: int,
        answers: List[UserAnswerCreate]
    ) -> QuizAttempt:
        try:
            attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
            if not attempt:
                raise AttemptNotFoundException(attempt_id)
            
            if attempt.is_completed:
                raise QuizAlreadyCompletedException()
            
            score = 0
            
            for answer_data in answers:
                is_correct = False
                
                if answer_data.selected_option_id:
                    option = db.query(AnswerOption).filter(
                        AnswerOption.id == answer_data.selected_option_id
                    ).first()
                    
                    if option and option.is_correct:
                        is_correct = True
                        question = db.query(Question).filter(
                            Question.id == answer_data.question_id
                        ).first()
                        if question:
                            score += question.points
                
                db_answer = UserAnswer(
                    attempt_id=attempt_id,
                    question_id=answer_data.question_id,
                    selected_option_id=answer_data.selected_option_id,
                    text_answer=answer_data.text_answer,
                    is_correct=is_correct
                )
                db.add(db_answer)
            
            attempt.score = score
            attempt.completed_at = datetime.utcnow()
            attempt.is_completed = True
            
            db.commit()
            db.refresh(attempt)
            logger.info(f"Submitted answers untuk attempt {attempt_id}")
            return attempt
        except Exception as e:
            db.rollback()
            logger.error(f"Error submitting answers untuk attempt {attempt_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_quiz_results(db: Session, attempt_id: int) -> Optional[QuizResult]:
        try:
            attempt = db.query(QuizAttempt).options(
                joinedload(QuizAttempt.user_answers).joinedload(UserAnswer.question),
                joinedload(QuizAttempt.user_answers).joinedload(UserAnswer.selected_option)
            ).filter(QuizAttempt.id == attempt_id).first()
            
            if not attempt:
                raise AttemptNotFoundException(attempt_id)
            
            correct_answers = []
            incorrect_answers = []
            
            for user_answer in attempt.user_answers:
                correct_option_text = None
                for option in user_answer.question.options:
                    if option.is_correct:
                        correct_option_text = option.option_text
                        break
                
                answer_detail = AnswerDetail(
                    question=user_answer.question.question_text,
                    user_answer=user_answer.selected_option.option_text if user_answer.selected_option else user_answer.text_answer or "Tidak dijawab",
                    correct_answer=correct_option_text,
                    explanation=user_answer.question.explanation
                )
                
                if user_answer.is_correct:
                    correct_answers.append(answer_detail)
                else:
                    incorrect_answers.append(answer_detail)
            
            max_score = sum(q.points for q in db.query(Question).filter(
                Question.quiz_id == attempt.quiz_id
            ).all())
            
            percentage = (attempt.score / max_score * 100) if max_score > 0 else 0
            
            return QuizResult(
                attempt_id=attempt.id,
                score=attempt.score,
                total_questions=attempt.total_questions,
                percentage=round(percentage, 2),
                time_taken=attempt.time_taken,
                is_passed=percentage >= 60,
                correct_answers=correct_answers,
                incorrect_answers=incorrect_answers
            )
        except Exception as e:
            logger.error(f"Error getting results untuk attempt {attempt_id}: {str(e)}")
            raise
        
    @staticmethod
    def get_quiz_stats(db: Session, quiz_id: int) -> Optional[QuizStats]:
        try:
            quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
            if not quiz:
                raise QuizNotFoundException(quiz_id)
            
            attempts = db.query(QuizAttempt).filter(
                and_(QuizAttempt.quiz_id == quiz_id, QuizAttempt.is_completed == True)
            ).all()
            
            if not attempts:
                return QuizStats(
                    quiz_id=quiz_id,
                    quiz_title=quiz.title,
                    total_attempts=0,
                    average_score=0.0,
                    pass_rate=0.0,
                    average_time=0.0
                )
            
            total_attempts = len(attempts)
            total_score = sum(attempt.score for attempt in attempts)
            max_possible_score = sum(q.points for q in quiz.questions)
            
            if max_possible_score > 0:
                average_score = (total_score / total_attempts / max_possible_score * 100)
                passed_attempts = sum(
                    1 for attempt in attempts 
                    if (attempt.score / max_possible_score * 100) >= 60
                )
            else:
                average_score = 0
                passed_attempts = 0
            
            pass_rate = (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0
            average_time = sum(attempt.time_taken for attempt in attempts) / total_attempts
            
            logger.info(f"Retrieved stats untuk quiz {quiz_id}")
            
            return QuizStats(
                quiz_id=quiz_id,
                quiz_title=quiz.title,
                total_attempts=total_attempts,
                average_score=round(average_score, 2),
                pass_rate=round(pass_rate, 2),
                average_time=round(average_time, 2)
            )
        except Exception as e:
            logger.error(f"Error getting quiz stats {quiz_id}: {str(e)}")
            raise
    
    @staticmethod
    def delete_attempt(db: Session, attempt_id: int) -> bool:
        try:
            attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
            if not attempt:
                return False
            
            db.delete(attempt)
            db.commit()
            logger.info(f"Deleted attempt dengan id {attempt_id}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting attempt {attempt_id}: {str(e)}")
            raise
    
    @staticmethod
    def update_time_taken(db: Session, attempt_id: int, time_taken: int) -> Optional[QuizAttempt]:
        try:
            attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
            if not attempt:
                raise AttemptNotFoundException(attempt_id)
            
            if attempt.is_completed:
                raise QuizAlreadyCompletedException()
            
            attempt.time_taken = time_taken
            db.commit()
            db.refresh(attempt)
            logger.info(f"Updated time_taken untuk attempt {attempt_id}")
            return attempt
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating time_taken untuk attempt {attempt_id}: {str(e)}")
            raise