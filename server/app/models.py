from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # Firebase UIDを使用
    email = Column(String, unique=True, index=True, nullable=False)
    words = relationship("Word", back_populates="owner")

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)
    meaning = Column(Text)
    owner_id = Column(String, ForeignKey("users.id"))

    owner = relationship("User", back_populates="words")
