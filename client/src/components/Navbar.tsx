// src/components/Navbar.tsx

import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleTitleClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={handleTitleClick}>
          学習アプリ
        </Typography>
        {currentUser ? (
          <>
            <Button color="inherit" component={RouterLink} to="/wordbook">
              単語帳
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              ログアウト
            </Button>
          </>
        ) : (
          <></>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
