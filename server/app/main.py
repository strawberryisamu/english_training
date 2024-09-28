from urllib import response
from fastapi import FastAPI, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
import requests
from datetime import datetime
from fastapi import Cookie
from .dependencies import get_db, get_current_user

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


allowed_origins = ['http://localhost:3000/', 'http://localhost:3000']
# 'https://client-twilight-pine-5567.fly.dev','https://client-twilight-pine-5567.fly.dev/',
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    
#     @app.post("/auth/token", response_model=TokenResponse)
# def generate_access_token(request: TokenRequest):
# ログインエンドポイント


# ログアウトエンドポイント
@app.post("/logout")
def logout(response: Response , refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    if refresh_token:
        # データベースからリフレッシュトークンを削除
        crud.delete_refresh_token(db, token=refresh_token)
        # クッキーを削除
        response.set_cookie(
            key="refresh_token",
            value="",
            httponly=True,
            secure=False,  # HTTPSの場合はTrueに設定
            samesite="lax",
            max_age=0,  # 有効期限を0に設定
        )
    return {"message": "Logged out successfully"}


# 1. YouTubeの動画と字幕を取得するエンドポイント
@app.get("/youtube")
def get_youtube_video_and_captions(video_url: str = Query(..., description="YouTube動画のURL")):
    video_id = extract_video_id(video_url)
    print(video_id)
    try:
        # 字幕を取得
        print("aaa")
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        print(transcript_list)
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
REFRESH_TOKEN_EXPIRE_DAYS = os.getenv("REFRESH_TOKEN_EXPIRE_DAYS")


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
    あなたは日本の英語教師です。以下の文脈の中で「{expression}」の部分の文章だけ翻訳し、その意味を日本語を用いて説明してください:\n\n{full_text}
    """

    result = ask_llm(prompt)
    if result is None:
        return "エラー"
    return result

@app.post("/explain")
async def explain_expression(
    request: ExplainRequest,
    current_user: schemas.User = Depends(get_current_user)):
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

from typing import List

class Correction(BaseModel):
    word: str
    suggestion: str
    start_index: int
    end_index: int

class GradeResponse(BaseModel):
    corrections: List[Correction]


def get_grade(expression: str):
    prompt = f"""
                以下の文章のスペルと文法のミスを指摘してください。ミスのある単語とその訂正を含むJSONのみを出力してください。他のテキストは一切出力しないでください。フォーマットは以下のとおりです：

                [
                {{
                    "word": "ミスのある単語",
                    "suggestion": "訂正された単語",
                    "start_index": 開始位置（文字単位で、0から始まるインデックス）,
                    "end_index": 終了位置（文字単位で、0から始まるインデックス）
                }},
                ...
                ]

                文章：
                {expression}
                """

    result = ask_llm(prompt)
    if result is None:
        return None
    return result

class GradeRequest(BaseModel):
    content: str

class GradeResponse(BaseModel):
    corrections: List[Correction]

import json

@app.post("/grade", response_model=GradeResponse)
def grade_text(request: GradeRequest):
    try:
        response = get_grade(request.content)
        corrected_content = response.strip()
        corrections = json.loads(corrected_content)
        print(corrections)
        return GradeResponse(corrections=corrections)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSONのパースに失敗しました: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TokenRequest(BaseModel):
    id_token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# @app.post("/auth/token", response_model=TokenResponse)
# def generate_access_token(request: TokenRequest):
#     try:
#         # FirebaseのIDトークンを検証
#         decoded_token = firebase_auth.verify_id_token(request.idToken)
#         uid = decoded_token['uid']
#         email = decoded_token.get('email', '')

#         # 独自のアクセストークンを発行
#         payload = {
#             'uid': uid,
#             'email': email,
#             'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
#         }
#         access_token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

#         return TokenResponse(accessToken=access_token)
#     except Exception as e:
#         print(e)
#         raise HTTPException(status_code=401, detail='Invalid ID token')
# ログインエンドポイントの修正
@app.post("/login")
def login(request: TokenRequest, response: Response,db: Session = Depends(get_db)):
    decoded_token = verify_firebase_token(request.id_token)
    if not decoded_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    print(decoded_token)
    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    name = decoded_token.get("name")
    print(uid,email,name)

    # ユーザーの取得または作成
    user = crud.get_user(db, user_id=uid)
    if not user:
        user_in = schemas.UserCreate(id=uid, email=email, name=name)
        user = crud.create_user(db, user=user_in)
    access_token_expires = timedelta(minutes=2)
    access_token = create_access_token(data={"sub": uid}, expires_delta=access_token_expires)
    print(user.name)
    # リフレッシュトークンの作成と保存
    refresh_token = crud.create_refresh_token(db, user_id=uid)

    # リフレッシュトークンをHTTP Only Cookieにセット
    print('refresh',refresh_token.token)
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token.token,
        httponly=True,
        secure=False,  # HTTPSを使用している場合はTrueに設定
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
    )
    print('access',access_token)

    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "name": user.name}}




@app.post("/refresh")
def refresh_token_endpoint(refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")

    # リフレッシュトークンの検証
    db_token = crud.get_refresh_token(db, token=refresh_token)
    if not db_token or db_token.expires_at < datetime.now():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    uid = db_token.user_id

    # 新しいアクセストークンの作成
    access_token_expires = timedelta(minutes=2)
    access_token = create_access_token(data={"sub": uid}, expires_delta=access_token_expires)

    # 必要に応じてリフレッシュトークンを再発行（ここでは再利用）
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me")
def get_current_user_info(refresh_token: str = Cookie(alies='refresh_token'), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")

    # リフレッシュトークンの検証
    db_token = crud.get_refresh_token(db, token=refresh_token)
    if not db_token or db_token.expires_at < datetime.now():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    uid = db_token.user_id

    # ユーザー情報の取得
    user = crud.get_user(db, user_id=uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
