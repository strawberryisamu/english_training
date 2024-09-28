// src/pages/Login.tsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login();
      console.log('ログイン成功');
      navigate('/'); // ログイン成功後、ホームページにリダイレクト
      console.log('リダイレクト');
    } catch (error) {
      console.error('ログインエラー:', error);
      // 必要に応じてユーザーにエラーメッセージを表示
    }
  };

  return (
    <Box mt={4} textAlign="center">
      <Typography variant="h4" gutterBottom>
        ログイン
      </Typography>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Googleでログイン
      </Button>
    </Box>
  );
};

export default Login;
