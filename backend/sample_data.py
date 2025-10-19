import os
from dotenv import load_dotenv
from database import SessionLocal, create_tables
from models import Quiz, Question, AnswerOption
from datetime import datetime

# Load environment variables
load_dotenv()

def create_sample_data():
    db = SessionLocal()
    
    try:
        print("🔄 Creating sample data...")
        
        # Check if data already exists
        existing_quiz = db.query(Quiz).first()
        if existing_quiz:
            print("⚠️  Sample data already exists. Skipping...")
            return
        
        # =================== QUIZ 1: JavaScript Fundamentals ===================
        quiz1 = Quiz(
            title="JavaScript Fundamentals",
            description="Test your knowledge of basic JavaScript concepts",
            category="Programming",
            difficulty_level="easy",
            time_limit=300,  # 5 minutes
            is_active=True
        )
        db.add(quiz1)
        db.flush()  # Get quiz ID
        
        # Questions for Quiz 1
        q1_1 = Question(
            quiz_id=quiz1.id,
            question_text="What is the correct way to declare a variable in JavaScript?",
            question_type="multiple_choice",
            points=1,
            explanation="'let' and 'const' are preferred over 'var' in modern JavaScript"
        )
        db.add(q1_1)
        db.flush()
        
        # Options untuk question 1
        AnswerOption(question_id=q1_1.id, option_text="var myVar;", is_correct=False, option_order=1)
        AnswerOption(question_id=q1_1.id, option_text="let myVar;", is_correct=True, option_order=2)
        AnswerOption(question_id=q1_1.id, option_text="variable myVar;", is_correct=False, option_order=3)
        AnswerOption(question_id=q1_1.id, option_text="declare myVar;", is_correct=False, option_order=4)
        
        # Question 2
        q1_2 = Question(
            quiz_id=quiz1.id,
            question_text="JavaScript adalah bahasa yang di-compile.",
            question_type="true_false",
            points=1,
            explanation="JavaScript adalah bahasa interpreted, bukan compiled"
        )
        db.add(q1_2)
        db.flush()
        
        AnswerOption(question_id=q1_2.id, option_text="True", is_correct=False, option_order=1)
        AnswerOption(question_id=q1_2.id, option_text="False", is_correct=True, option_order=2)
        
        # Question 3
        q1_3 = Question(
            quiz_id=quiz1.id,
            question_text="Apa output dari typeof null?",
            question_type="multiple_choice",
            points=2,
            explanation="Ini adalah quirk terkenal dalam JavaScript di mana typeof null mengembalikan 'object'"
        )
        db.add(q1_3)
        db.flush()
        
        AnswerOption(question_id=q1_3.id, option_text='"null"', is_correct=False, option_order=1)
        AnswerOption(question_id=q1_3.id, option_text='"undefined"', is_correct=False, option_order=2)
        AnswerOption(question_id=q1_3.id, option_text='"object"', is_correct=True, option_order=3)
        AnswerOption(question_id=q1_3.id, option_text='"boolean"', is_correct=False, option_order=4)
        
        # =================== QUIZ 2: React Advanced Concepts ===================
        quiz2 = Quiz(
            title="React Advanced Concepts",
            description="Advanced React patterns and hooks",
            category="Programming",
            difficulty_level="hard",
            time_limit=600,  # 10 minutes
            is_active=True
        )
        db.add(quiz2)
        db.flush()
        
        # Question 1
        q2_1 = Question(
            quiz_id=quiz2.id,
            question_text="Hook manakah yang digunakan untuk side effects di functional components?",
            question_type="multiple_choice",
            points=1,
            explanation="useEffect adalah hook untuk handling side effects"
        )
        db.add(q2_1)
        db.flush()
        
        AnswerOption(question_id=q2_1.id, option_text="useState", is_correct=False, option_order=1)
        AnswerOption(question_id=q2_1.id, option_text="useEffect", is_correct=True, option_order=2)
        AnswerOption(question_id=q2_1.id, option_text="useContext", is_correct=False, option_order=3)
        AnswerOption(question_id=q2_1.id, option_text="useReducer", is_correct=False, option_order=4)
        
        # Question 2
        q2_2 = Question(
            quiz_id=quiz2.id,
            question_text="React components harus selalu mengembalikan single element.",
            question_type="true_false",
            points=1,
            explanation="React components bisa mengembalikan fragments atau arrays sejak React 16"
        )
        db.add(q2_2)
        db.flush()
        
        AnswerOption(question_id=q2_2.id, option_text="True", is_correct=False, option_order=1)
        AnswerOption(question_id=q2_2.id, option_text="False", is_correct=True, option_order=2)
        
        # =================== QUIZ 3: General Knowledge ===================
        quiz3 = Quiz(
            title="General Knowledge",
            description="Mixed questions about various topics",
            category="General",
            difficulty_level="medium",
            time_limit=240,  # 4 minutes
            is_active=True
        )
        db.add(quiz3)
        db.flush()
        
        # Question 1
        q3_1 = Question(
            quiz_id=quiz3.id,
            question_text="Apa ibukota Indonesia?",
            question_type="multiple_choice",
            points=1,
            explanation="Jakarta adalah ibukota dan kota terbesar di Indonesia"
        )
        db.add(q3_1)
        db.flush()
        
        AnswerOption(question_id=q3_1.id, option_text="Bandung", is_correct=False, option_order=1)
        AnswerOption(question_id=q3_1.id, option_text="Jakarta", is_correct=True, option_order=2)
        AnswerOption(question_id=q3_1.id, option_text="Surabaya", is_correct=False, option_order=3)
        AnswerOption(question_id=q3_1.id, option_text="Medan", is_correct=False, option_order=4)
        
        # Question 2
        q3_2 = Question(
            quiz_id=quiz3.id,
            question_text="Tembok Besar Cina bisa dilihat dari luar angkasa dengan mata telanjang.",
            question_type="true_false",
            points=1,
            explanation="Ini adalah mitos. Tembok Besar Cina tidak bisa dilihat dari luar angkasa dengan mata telanjang"
        )
        db.add(q3_2)
        db.flush()
        
        AnswerOption(question_id=q3_2.id, option_text="True", is_correct=False, option_order=1)
        AnswerOption(question_id=q3_2.id, option_text="False", is_correct=True, option_order=2)
        
        # =================== QUIZ 4: Python Basics ===================
        quiz4 = Quiz(
            title="Python Basics",
            description="Introduction to Python programming",
            category="Programming",
            difficulty_level="easy",
            time_limit=420,  # 7 minutes
            is_active=True
        )
        db.add(quiz4)
        db.flush()
        
        # Question 1
        q4_1 = Question(
            quiz_id=quiz4.id,
            question_text="Apa output dari print(5 // 2) dalam Python?",
            question_type="multiple_choice",
            points=1,
            explanation="// adalah operator floor division yang mengembalikan integer"
        )
        db.add(q4_1)
        db.flush()
        
        AnswerOption(question_id=q4_1.id, option_text="2", is_correct=True, option_order=1)
        AnswerOption(question_id=q4_1.id, option_text="2.5", is_correct=False, option_order=2)
        AnswerOption(question_id=q4_1.id, option_text="3", is_correct=False, option_order=3)
        AnswerOption(question_id=q4_1.id, option_text="Error", is_correct=False, option_order=4)
        
        # Commit data
        db.commit()
        print(f"✅ Sample data created successfully!")
        print(f"   📚 Total Quizzes: 4")
        print(f"   ❓ Total Questions: 8")
        print(f"   ✓ Ready to use!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating sample data: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    try:
        print("🚀 Starting database setup...")
        print("=" * 50)
        
        # Create tables first
        print("📝 Creating database tables...")
        create_tables()
        print("✅ Tables created successfully!")
        
        # Create sample data
        print("📝 Populating sample data...")
        create_sample_data()
        
        print("=" * 50)
        print("✅ Database setup complete!")
        
    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        exit(1)