from sqlalchemy.orm import Session
from . import models, schemas
import uuid
from datetime import datetime, timedelta
import os

REFRESH_TOKEN_EXPIRE_DAYS = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS")

def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(id=user.id, email=user.email, name=user.name)
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

# CRUD操作の関数を作成（crud.py）
def create_refresh_token(db: Session, user_id: str):
    token = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(days=30)
    refresh_token = models.RefreshToken(token=token, user_id=user_id, expires_at=expires_at)
    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)
    return refresh_token

def get_refresh_token(db: Session, token: str):
    return db.query(models.RefreshToken).filter(models.RefreshToken.token == token).first()

def delete_refresh_token(db: Session, token: str):
    db.query(models.RefreshToken).filter(models.RefreshToken.token == token).delete()
    db.commit()
