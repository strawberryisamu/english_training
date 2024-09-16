import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import HTTPException, status
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from . import crud
from .database import SessionLocal
import os
import json

# Firebase Admin SDKの初期化
credentials_json = os.getenv("GOOGLE_CREDENTIALS")
cred_dict = json.loads(credentials_json)
cred = credentials.Certificate(cred_dict)
firebase_admin.initialize_app(cred)

# 秘密鍵とアルゴリズム（環境変数から取得）
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_firebase_token(id_token: str):
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)