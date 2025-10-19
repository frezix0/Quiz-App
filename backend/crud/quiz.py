from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from logger import logger
from models import Quiz, Question, AnswerOption
from schemas import QuizCreateRequest, QuizUpdateRequest
from exceptions import QuizNotFoundException

class QuizCRUD:
    @staticmethod
    def create_quiz(db: Session, quiz: QuizCreateRequest) -> Quiz:
        try:
            db_quiz = Quiz(
                title=quiz.title,
                description=quiz.description,
                category=quiz.category,
                difficulty_level=quiz.difficulty_level,
                time_limit=quiz.time_limit,
                is_active=quiz.is_active
            )
            db.add(db_quiz)
            db.flush()  # Get ID
            
            if quiz.questions and len(quiz.questions) > 0:
                for question_data in quiz.questions:
                    db_question = Question(
                        quiz_id=db_quiz.id,
                        question_text=question_data.question_text,
                        question_type=question_data.question_type,
                        points=question_data.points,
                        explanation=question_data.explanation
                    )
                    db.add(db_question)
                    db.flush()
                    
                    # Add options
                    for option_data in question_data.options:
                        db_option = AnswerOption(
                            question_id=db_question.id,
                            option_text=option_data.option_text,
                            is_correct=option_data.is_correct,
                            option_order=option_data.option_order
                        )
                        db.add(db_option)
            
            db.commit()
            db.refresh(db_quiz)
            logger.info(f"Created quiz {db_quiz.id} dengan {len(quiz.questions) if quiz.questions else 0} questions")
            return db_quiz
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating quiz: {str(e)}")
            raise

    @staticmethod
    def get_quiz(db: Session, quiz_id: int) -> Optional[Quiz]:
        try:
            return db.query(Quiz).filter(Quiz.id == quiz_id).first()
        except Exception as e:
            logger.error(f"Error fetching quiz {quiz_id}: {str(e)}")
            raise

    @staticmethod
    def get_quiz_with_questions(db: Session, quiz_id: int) -> Optional[Quiz]:
        try:
            return db.query(Quiz).options(
                joinedload(Quiz.questions).joinedload(Question.options)
            ).filter(Quiz.id == quiz_id).first()
        except Exception as e:
            logger.error(f"Error fetching quiz with questions {quiz_id}: {str(e)}")
            raise

    @staticmethod
    def get_quizzes(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None
    ) -> List[Quiz]:
        try:
            query = db.query(Quiz).filter(Quiz.is_active == True)
            if category:
                query = query.filter(Quiz.category == category)
            return query.offset(skip).limit(limit).all()
        except Exception as e:
            logger.error(f"Error fetching quizzes: {str(e)}")
            raise

    @staticmethod
    def get_categories(db: Session) -> List[str]:
        try:
            categories = db.query(Quiz.category).filter(
                Quiz.category.isnot(None),
                Quiz.is_active == True
            ).distinct().all()
            return [cat[0] for cat in categories if cat[0]]
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            raise

    @staticmethod
    def update_quiz(db: Session, quiz_id: int, quiz_update: QuizUpdateRequest) -> Optional[Quiz]:
        try:
            db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
            if not db_quiz:
                return None
            
            update_data = quiz_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_quiz, field, value)
            
            db.commit()
            db.refresh(db_quiz)
            logger.info(f"Updated quiz {quiz_id}")
            return db_quiz
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating quiz {quiz_id}: {str(e)}")
            raise

    @staticmethod
    def delete_quiz(db: Session, quiz_id: int) -> bool:
        try:
            db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
            if not db_quiz:
                return False
            
            db.delete(db_quiz)
            db.commit()
            logger.info(f"Deleted quiz {quiz_id}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting quiz {quiz_id}: {str(e)}")
            raise