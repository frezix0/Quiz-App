from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime

from models import Quiz, Question, AnswerOption, QuizAttempt, UserAnswer
import schemas
from schemas import QuestionCreate

class QuizCRUD:
    @staticmethod
    def get_quiz(db: Session, quiz_id: int) -> Optional[Quiz]:
        return db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    @staticmethod
    def get_quiz_with_questions(db: Session, quiz_id: int) -> Optional[Quiz]:
        return db.query(Quiz).options(
            joinedload(Quiz.questions).joinedload(Question.options)
        ).filter(Quiz.id == quiz_id).first()
    
    @staticmethod
    def get_quizzes(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[Quiz]:
        query = db.query(Quiz).filter(Quiz.is_active == True)
        if category:
            query = query.filter(Quiz.category == category)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def create_quiz(db: Session, quiz: schemas.QuizCreate) -> Quiz:
        db_quiz = Quiz(
            title=quiz.title,
            description=quiz.description,
            category=quiz.category,
            difficulty_level=quiz.difficulty_level,
            time_limit=quiz.time_limit,
            is_active=quiz.is_active
        )
        db.add(db_quiz)
        db.flush()  # Get the quiz ID
        
        # Add questions
        for question_data in quiz.questions:
            db_question = Question(
                quiz_id=db_quiz.id,
                question_text=question_data.question_text,
                question_type=question_data.question_type,
                points=question_data.points,
                explanation=question_data.explanation
            )
            db.add(db_question)
            db.flush()  # Get the question ID
            
            # Add answer options
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
        return db_quiz
    
    @staticmethod
    def update_quiz(db: Session, quiz_id: int, quiz_update: schemas.QuizUpdate) -> Optional[Quiz]:
        db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not db_quiz:
            return None
        
        update_data = quiz_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_quiz, field, value)
        
        db.commit()
        db.refresh(db_quiz)
        return db_quiz
    
    @staticmethod
    def delete_quiz(db: Session, quiz_id: int) -> bool:
        db_quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if db_quiz:
            db.delete(db_quiz)
            db.commit()
            return True
        return False

class QuizAttemptCRUD:
    @staticmethod
    def create_attempt(db: Session, attempt: schemas.QuizAttemptCreate) -> QuizAttempt:
        # Get quiz to get total questions
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")
        
        question_count = db.query(Question).filter(Question.quiz_id == attempt.quiz_id).count()
        
        db_attempt = QuizAttempt(
            quiz_id=attempt.quiz_id,
            participant_name=attempt.participant_name,
            participant_email=attempt.participant_email,
            total_questions=question_count
        )
        db.add(db_attempt)
        db.commit()
        db.refresh(db_attempt)
        return db_attempt
    
    @staticmethod
    def get_attempt(db: Session, attempt_id: int) -> Optional[QuizAttempt]:
        return db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    
    @staticmethod
    def submit_answers(db: Session, attempt_id: int, answers: List[schemas.UserAnswerCreate]) -> QuizAttempt:
        attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
        if not attempt:
            raise ValueError("Attempt not found")
        
        if attempt.is_completed:
            raise ValueError("Quiz already completed")
        
        score = 0
        
        for answer_data in answers:
            # Check if answer is correct
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
            
            # Save user answer
            db_answer = UserAnswer(
                attempt_id=attempt_id,
                question_id=answer_data.question_id,
                selected_option_id=answer_data.selected_option_id,
                text_answer=answer_data.text_answer,
                is_correct=is_correct
            )
            db.add(db_answer)
        
        # Update attempt
        attempt.score = score
        attempt.completed_at = datetime.utcnow()
        attempt.is_completed = True
        
        db.commit()
        db.refresh(attempt)
        return attempt
    
    @staticmethod
    def get_quiz_results(db: Session, attempt_id: int) -> Optional[schemas.QuizResult]:
        attempt = db.query(QuizAttempt).options(
            joinedload(QuizAttempt.user_answers).joinedload(UserAnswer.question),
            joinedload(QuizAttempt.user_answers).joinedload(UserAnswer.selected_option)
        ).filter(QuizAttempt.id == attempt_id).first()
        
        if not attempt:
            return None
        
        correct_answers = []
        incorrect_answers = []
        
        for user_answer in attempt.user_answers:
            answer_info = {
                "question": user_answer.question.question_text,
                "user_answer": user_answer.selected_option.option_text if user_answer.selected_option else user_answer.text_answer,
                "correct_answer": None,
                "explanation": user_answer.question.explanation
            }
            
            # Find correct answer
            for option in user_answer.question.options:
                if option.is_correct:
                    answer_info["correct_answer"] = option.option_text
                    break
            
            if user_answer.is_correct:
                correct_answers.append(answer_info)
            else:
                incorrect_answers.append(answer_info)
        
        percentage = (attempt.score / sum(q.points for q in db.query(Question).filter(Question.quiz_id == attempt.quiz_id).all())) * 100 if attempt.total_questions > 0 else 0
        
        return schemas.QuizResult(
            attempt_id=attempt.id,
            score=attempt.score,
            total_questions=attempt.total_questions,
            percentage=percentage,
            time_taken=attempt.time_taken,
            is_passed=percentage >= 60,  # 60% passing grade
            correct_answers=correct_answers,
            incorrect_answers=incorrect_answers
        )
    
    @staticmethod
    def get_quiz_stats(db: Session, quiz_id: int) -> Optional[schemas.QuizStats]:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return None
        
        attempts = db.query(QuizAttempt).filter(
            and_(QuizAttempt.quiz_id == quiz_id, QuizAttempt.is_completed == True)
        ).all()
        
        if not attempts:
            return schemas.QuizStats(
                quiz_id=quiz_id,
                quiz_title=quiz.title,
                total_attempts=0,
                average_score=0,
                pass_rate=0,
                average_time=0
            )
        
        total_attempts = len(attempts)
        total_score = sum(attempt.score for attempt in attempts)
        max_possible_score = sum(q.points for q in quiz.questions)
        
        average_score = (total_score / total_attempts / max_possible_score * 100) if max_possible_score > 0 else 0
        passed_attempts = sum(1 for attempt in attempts if (attempt.score / max_possible_score * 100) >= 60)
        pass_rate = (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0
        average_time = sum(attempt.time_taken for attempt in attempts) / total_attempts if total_attempts > 0 else 0
        
        return schemas.QuizStats(
            quiz_id=quiz_id,
            quiz_title=quiz.title,
            total_attempts=total_attempts,
            average_score=average_score,
            pass_rate=pass_rate,
            average_time=average_time
        )
    
class QuestionCRUD:
    @staticmethod
    def create_question(db: Session, quiz_id: int, question: QuestionCreate):
        # Create question
        db_question = Question(
            quiz_id=quiz_id,
            question_text=question.question_text,
            question_type=question.question_type,
            points=question.points,
            explanation=question.explanation
        )
        db.add(db_question)
        db.flush()
        
        # Create options
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
        return db_question
    
    @staticmethod
    def delete_question(db: Session, question_id: int) -> bool:
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            return False
        
        # Delete options first
        db.query(AnswerOption).filter(AnswerOption.question_id == question_id).delete()
        db.delete(question)
        db.commit()
        return True