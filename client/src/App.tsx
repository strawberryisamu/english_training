// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Learning from './pages/Learning';
import WordBook from './pages/WordBook';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CssBaseline, Container } from '@mui/material';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Navbar />
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/learning"
              element={
                <PrivateRoute>
                  <Learning />
                </PrivateRoute>
              }
            />
            <Route
              path="/wordbook"
              element={
                <PrivateRoute>
                  <WordBook />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;
