from sqlalchemy.orm import Session
from typing import Generic, TypeVar, Type, List, Optional
from logger import logger

T = TypeVar('T')

class BaseCRUD(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model

    def get_by_id(self, db: Session, id: int) -> Optional[T]:
        try:
            return db.query(self.model).filter(self.model.id == id).first()
        except Exception as e:
            logger.error(f"Error fetching {self.model.__name__} dengan id {id}: {str(e)}")
            return

    def get_all(
            self, 
            db: Session, 
            skip: int = 0, 
            limit: int = 100
        ) -> List[T]:
        try:
            return db.query(self.model).offset(skip).limit(limit).all()
        except Exception as e:
            logger.error(f"Error fetching all {self.model.__name__} records: {str(e)}")
            raise

    def create(self, db: Session, obj: dict) -> T:
        try:
            db_obj = self.model(**obj)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            logger.info(f"Creating a new {self.model.__name__} dengan id {db_obj.id}")
            return db_obj
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating {self.model.__name__}: {str(e)}")
            raise

    def update(self, db: Session, id: int, obj: dict) -> Optional[T]:
        try:
            db_obj = self.get_by_id(db, id)
            if not db_obj:
                return None
            
            for key, value in obj.items():
                if value is not None:
                    setattr(db_obj, key, value)
            db.commit()
            db.refresh(db_obj)
            logger.info(f"Updated {self.model.__name__} dengan id: {db_obj.id}")
            return db_obj
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating {self.model.__name__} dengan id {id}: {str(e)}")
            raise

    def delete(self, db: Session, id: int) -> bool:
        try:
            db_obj = self.get_by_id(db, id)
            if not db_obj:
                return False
            db.delete(db_obj)
            db.commit()
            logger.info(f"Deleted {self.model.__name__} dengan id: {id}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting {self.model.__name__} dengan id {id}: {str(e)}")
            raise