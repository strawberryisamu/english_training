from sqlalchemy.orm import Session
from . import models, schemas

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(id=user.id, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_words(db: Session, user_id: str):
    return db.query(models.Word).filter(models.Word.owner_id == user_id).all()

def create_word(db: Session, word: schemas.WordCreate, user_id: str):
    db_word = models.Word(**word.dict(), owner_id=user_id)
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word
