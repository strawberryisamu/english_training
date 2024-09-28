// PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { accessToken, loading } = useAuth();

  if (loading) {
    // 認証情報がまだ取得中の場合は何もレンダリングしないか、ローディングスピナーを表示
    return null; // または <LoadingSpinner />
  }

  if (!accessToken) {
    console.log('アクセストークンがないためログインページにリダイレクトします');
    // アクセストークンがない場合はログインページにリダイレクト
    return <Navigate to="/login" />;
  }

  // アクセストークンがある場合は子コンポーネントを表示
  return <>{children}</>;
};

export default PrivateRoute;
