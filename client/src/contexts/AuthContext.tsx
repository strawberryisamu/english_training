import React, { useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from './Firebase';
import firebase from 'firebase/compat/app';

interface AuthContextProps {
  currentUser: firebase.User | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextProps>({
  currentUser: null,
  accessToken: null,
  login: () => Promise.reject(),
  logout: () => Promise.reject(),
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const idToken = await result.user?.getIdToken();

    // バックエンドのログインエンドポイントにIDトークンを送信
    const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await response.json();

    if (response.ok) {
      setAccessToken(data.access_token);
    } else {
      // エラーハンドリング
      console.error('Failed to login:', data.detail);
    }
  };

  const logout = async () => {
    if (accessToken) {
      await fetch(`${process.env.REACT_APP_API_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    await auth.signOut();
    setAccessToken(null);
    setCurrentUser(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextProps = {
    currentUser,
    accessToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
