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
      navigate('/');
    } catch (error) {
      console.error('ログインエラー:', error);
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
