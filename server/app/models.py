from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # Firebase UIDを使用
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    words = relationship("Word", back_populates="owner")

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)
    meaning = Column(Text)
    owner_id = Column(String, ForeignKey("users.id"))

    owner = relationship("User", back_populates="words")

class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey('users.id'))
    expires_at = Column(DateTime)
    user = relationship("User")
