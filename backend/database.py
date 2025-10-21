from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from config import settings
from logger import logger

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,
    pool_recycle=settings.DB_POOL_RECYCLE,
    echo=settings.SQLALCHEMY_ECHO,
    # Optimasi tambahan
    connect_args={
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000"
    }
)

# Create SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

# Drop tables (for testing)
def drop_tables():
    try:
        Base.metadata.drop_all(bind=engine)
        logger.warning("Database tables dropped successfully.")
    except Exception as e:
        logger.error(f"Error dropping database tables: {e}")
        raise

# Test database connection
def test_database_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection berhasil")
        return True
    except Exception as e:
        logger.error(f"Database connection gagal: {str(e)}")
        return False
    
# Initialize database (create tables if not exist)
def init_db():
    if test_database_connection():
        create_tables()
        return True
    return False