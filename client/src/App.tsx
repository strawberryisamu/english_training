// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

// ページコンポーネントのインポート
import Login from './pages/Login';
import Home from './pages/Home';
import Learning from './pages/Learning';
import WordBook from './pages/WordBook';
import Navbar from './components/Navbar';
import { Container, CssBaseline } from '@mui/material';
// 他のページコンポーネントを必要に応じてインポート

function App() {
  return (
    <Router>
      <AuthProvider>
      <CssBaseline />
        <Navbar />
        <Container maxWidth="lg">
        <Routes>
          {/* ログインページは公開 */}
          <Route path="/login" element={<Login />} />

          {/* それ以外のルートはPrivateRouteで保護 */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/learning" element={<Learning />} />
                  <Route path="/wordbook" element={<WordBook />} />
                  {/* 他の保護されたルートを追加 */}
                </Routes>
              </PrivateRoute>
            }
          />
        </Routes>
        </Container>
        
      </AuthProvider>
    </Router>
  );
}

export default App;
