// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './Firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {jwtDecode,  JwtPayload } from 'jwt-decode';

interface User {
  uid: string;
  name: string;
  email: string;
}

interface AuthContextProps {
  currentUser: User | null;
  accessToken: string | null;
  loading: boolean;
  accessTokenExpiresAt: number | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessTokenExpiresAt, setAccessTokenExpiresAt] = useState<number | null>(null);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Firebase認証成功:', result);
  
      const idToken = await result.user.getIdToken();
  
      // APIにPOSTリクエストを送信
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
        credentials: 'include',  // クッキーを含めるため
      });
  
      console.log('バックエンドからのレスポンス:', response);
      if (!response.ok) {
        const error = await response.json();
        console.error('エラーレスポンス:', error);
        return;
      }
  
      const data = await response.json();
      console.log('アクセストークンを取得:', data);
  
      // アクセストークンとユーザー情報を保存
      setAccessToken(data.access_token);
      console.log(data.user);
      setCurrentUser(
        {
          uid: data.user.id,
          email: data.user.email,
          name: data.user.name,
        } as User
      );
      const decodedToken: JwtPayload = jwtDecode(data.access_token);
      setAccessTokenExpiresAt(decodedToken.exp! * 1000);
      navigate('/');  // 成功後にリダイレクト
    } catch (error) {
      console.error('ログイン中にエラーが発生しました:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setAccessToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  // ページのリロード時にアクセストークンを取得
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/me`, {
      method: 'GET',
      credentials: 'include', // クッキーを含めるために必要
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('ユーザー情報の取得に失敗しました。');
        }
        return res.json();
      })
      .then(async (user) => {
        console.log(user);  
        setCurrentUser(
          {
            uid: user.uid,
            email: user.email,
            name: user.name,
          } as User
        );
        await refreshAccessToken();
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch user info:', error);
        setLoading(false);
      });
  }, []);

  // アクセストークンのリフレッシュ関数
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        const decodedToken: JwtPayload = jwtDecode(data.access_token);
        setAccessTokenExpiresAt(decodedToken.exp! * 1000);
      } else {
        // リフレッシュトークンが無効または期限切れの場合
        await logout();
      }
    } catch (error) {
      console.error('トークンのリフレッシュに失敗しました:', error);
      await logout();
    }
  };

  // アクセストークンの有効期限を監視し、自動でリフレッシュ
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (accessTokenExpiresAt) {
      console.log('アクセストークンの有効期限:', new Date(accessTokenExpiresAt).toLocaleString());
      const refreshTime = accessTokenExpiresAt - Date.now() - 60000; // 有効期限の1分前にリフレッシュ
      if (refreshTime > 0) {
        console.log('アクセストークンのリフレッシュを設定:', refreshTime);

        timeoutId = setTimeout(() => {
          console.log('アクセストークンをリフレッシュします。');
          refreshAccessToken();
        }, refreshTime);
      } else {
        console.log('アクセストークンの有効期限が切れています。');
        // すでに有効期限が切れている場合
        refreshAccessToken();
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [accessTokenExpiresAt]);

  return (
    <AuthContext.Provider value={{ currentUser, accessToken, accessTokenExpiresAt, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
