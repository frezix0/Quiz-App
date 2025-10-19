from sqlalchemy.orm import Session
from typing import Optional
from logger import logger
from models import Question, AnswerOption
from schemas import QuestionCreate
from exceptions import QuestionNotFoundException

class QuestionCRUD:
    @staticmethod
    def create_question(db: Session, quiz_id: int, question: QuestionCreate) -> Question:
        try:
            db_question = Question(
                quiz_id=quiz_id,
                question_text=question.question_text,
                question_type=question.question_type,
                points=question.points,
                explanation=question.explanation
            )
            db.add(db_question)
            db.flush()
            
            if question.options and len(question.options) > 0:
                for opt in question.options:
                    db_option = AnswerOption(
                        question_id=db_question.id,
                        option_text=opt.option_text,
                        is_correct=opt.is_correct,
                        option_order=opt.option_order
                    )
                    db.add(db_option)
            
            db.commit()
            db.refresh(db_question)
            logger.info(f"Created question {db_question.id} untuk quiz {quiz_id}")
            return db_question
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating question: {str(e)}")
            raise

    @staticmethod
    def get_question(db: Session, question_id: int) -> Optional[Question]:
        try:
            return db.query(Question).filter(Question.id == question_id).first()
        except Exception as e:
            logger.error(f"Error fetching question {question_id}: {str(e)}")
            raise

    @staticmethod
    def delete_question(db: Session, question_id: int) -> bool:
        try:
            question = db.query(Question).filter(Question.id == question_id).first()
            if not question:
                return False
            
            # Delete options first
            db.query(AnswerOption).filter(AnswerOption.question_id == question_id).delete()
            db.delete(question)
            db.commit()
            logger.info(f"Deleted question {question_id}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting question {question_id}: {str(e)}")
            raise