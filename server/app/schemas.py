from pydantic import BaseModel
from typing import List, Optional


class Token(BaseModel):
    id_token: str


class WordBase(BaseModel):
    text: str
    meaning: Optional[str] = None

class WordCreate(WordBase):
    pass

class Word(WordBase):
    id: int
    owner_id: str

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    id: str  # Firebase UID

class User(UserBase):
    id: str
    words: List[Word] = []

    class Config:
        orm_mode = True

class Caption(BaseModel):
    text: str
    start_time: float
    end_time: float
