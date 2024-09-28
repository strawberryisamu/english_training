import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/learning?videoUrl=${encodeURIComponent(videoUrl)}`);
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>
        ようこそ{currentUser ? `、${currentUser.name}さん！` : '！'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="YouTubeのリンクを入力"
          variant="outlined"
          fullWidth
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          学習を開始
        </Button>
      </form>
    </Box>
  );
};

export default Home;
