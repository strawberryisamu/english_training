from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import requests

import os
import openai
from .dependencies import get_db, get_current_user

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from . import models, schemas, crud
from .database import engine, SessionLocal
from .auth import verify_firebase_token, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

from fastapi.middleware.cors import CORSMiddleware
import os
import openai
import json
from fastapi import FastAPI, Query, HTTPException
from typing import List
from youtube_transcript_api import YouTubeTranscriptApi
import re

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_video_id(url: str) -> str:
    """
    YouTubeのURLから動画IDを抽出する関数
    """
    # 正規表現で動画IDを抽出
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(regex, url)
    if match:
        return match.group(1)
    else:
        return url  # URLが動画IDそのものの場合

# ログインエンドポイント
@app.post("/login")
def login(id_token: schemas.Token, db: Session = Depends(get_db)):
    # Firebaseトークンの検証
    decoded_token = verify_firebase_token(id_token.id_token)
    if not decoded_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    uid = decoded_token["uid"]
    email = decoded_token.get("email")

    # ユーザーの取得または作成
    user = crud.get_user(db, user_id=uid)
    if not user:
        user_in = schemas.UserCreate(id=uid, email=email)
        user = crud.create_user(db, user=user_in)

    # アクセストークンの作成
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": uid}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}

# ログアウトエンドポイント
@app.post("/logout")
def logout(current_user: models.User = Depends(get_current_user)):
    # トークンの無効化処理（必要に応じて実装）
    return {"message": "Logged out successfully"}


# 1. YouTubeの動画と字幕を取得するエンドポイント
@app.get("/youtube")
def get_youtube_video_and_captions(video_url: str = Query(..., description="YouTube動画のURL")):
    video_id = extract_video_id(video_url)
    try:
        # 字幕を取得
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        # 英語の字幕を優先的に取得
        transcript = transcript_list.find_transcript(['en'])
        print("英語の字幕を取得")
        captions = transcript.fetch()
        # 必要に応じて、captionのテキストのみを抽出
        return {"video_id": video_id, "captions": captions}
    except Exception as e:
        print("英語の字幕が見つかりませんでした:", str(e))
        raise HTTPException(status_code=404, detail="字幕が見つかりませんでした。")


from pydantic import BaseModel
from openai import OpenAI
class Caption(BaseModel):
    text: str
    start: float
    duration: float

class ExplainRequest(BaseModel):
    expression: str
    captions: List[Caption]
# 2. 字幕から選ばれた表現を解説するLLMのエンドポイント
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


def ask_llm(content: str):
    result = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": content},
        ],
    )
    return result.choices[0].message.content

def get_elplanation(expression: str, full_text: str):
    prompt = f"""
    あなたは日本の英語教師です。以下の文脈の中で「{expression}」を翻訳し、その意味を日本語を用いて説明してください:\n\n{full_text}
    """

    result = ask_llm(prompt)
    if result is None:
        return "エラー"
    return result

@app.post("/explain")
async def explain_expression(request: ExplainRequest):
    expression = request.expression
    captions = request.captions

    # キャプション全体のテキストを結合
    full_text = " ".join([caption.text for caption in captions])

    # LLMに問い合わせ
    try:

        explanation = get_elplanation(expression, full_text)
        
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. ユーザーが選んだ単語を単語帳に記録するエンドポイント
@app.post("/words/", response_model=schemas.Word)
def add_word(
    word: schemas.WordCreate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_word(db=db, word=word, user_id=current_user.id)

@app.get("/words/", response_model=List[schemas.Word])
def read_words(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    words = crud.get_words(db, user_id=current_user.id)
    return words

# 4. ログイン・ログアウトのエンドポイントはフロントエンドでFirebase Authenticationを使用するため、バックエンドでは特に実装不要
