import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import Subtitle from '../components/Subtitle';
import Explanation from '../components/Explanation';
import WordList from '../components/WordList';
import AddWordButton from '../components/AddWordButton';
import { Grid, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Caption {
  text: string;
  start: number;
  duration: number;
}

const Learning: React.FC = () => {
  const location = useLocation();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedExpression, setSelectedExpression] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [words, setWords] = useState<string[]>([]);
  const { accessToken } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const url = query.get('videoUrl') || '';
    setVideoUrl(url);

    // エンドポイントから字幕を取得
    fetch(`${process.env.REACT_APP_API_URL}/youtube?video_url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => setCaptions(data.captions))
      .catch((error) => {
        console.error('Failed to fetch captions:', error);
      });
  }, [location]);

  const handleExpressionClick = (expression: string) => {
    setSelectedExpression(expression);
    console.log(expression);

    // 選択された表現とキャプション全体をバックエンドに送信
    fetch(`${process.env.REACT_APP_API_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ expression, captions }),
    })
      .then((res) => res.json())
      .then((data) => setExplanation(data.explanation))
      .catch((error) => {
        console.error('Failed to fetch explanation:', error);
      });
  };

  const handleAddWord = (word: string) => {
    if (!accessToken) {
      console.error('User is not authenticated');
      return;
    }

    // エンドポイントに単語を追加
    fetch(`${process.env.REACT_APP_API_URL}/words/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text: word }),
    })
      .then((res) => res.json())
      .then((data) => {
        setWords([...words, data.text]);
      })
      .catch((error) => {
        console.error('Failed to add word:', error);
      });
  };

  
  return (
    <Box mt={4}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <VideoPlayer videoUrl={videoUrl} />
          <Box style={{ height: '200px', overflowY: 'auto' }}>
            <Subtitle captions={captions} onExpressionClick={handleExpressionClick} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Explanation expression={selectedExpression} explanation={explanation} />
          <AddWordButton word={selectedExpression} onAddWord={handleAddWord} />
          <WordList words={words} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Learning;
