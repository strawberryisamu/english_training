// Learning.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import Dictation from '../components/Dictation';
import Explanation from '../components/Explanation';
import WordList from '../components/WordList';
import AddWordButton from '../components/AddWordButton';
import { Grid, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Correction {
  word: string;
  suggestion: string;
  start_index: number;
  end_index: number;
}

interface Caption {
  text: string;
  start: number;
  duration: number;
}

const Learning: React.FC = () => {
  const location = useLocation();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [dictationContent, setDictationContent] = useState<string>('');
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [selectedText, setSelectedText] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [words, setWords] = useState<string[]>([]);
  const { accessToken } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const url = query.get('videoUrl') || '';
    setVideoUrl(url);
  }, [location]);

  const handleTextSelect = (text: string) => {
    setSelectedText(text);
    setExplanation(''); // 新しいテキストが選択されたら解説をリセット
  };

  const handleContentChange = (content: string) => {
    setDictationContent(content);
  };

  const handleGrade = () => {
    if (!dictationContent) {
      alert('ディクテーション内容を入力してください。');
      return;
    }
    // 採点処理を実行
    fetch(`${process.env.REACT_APP_API_URL}/grade`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ content: dictationContent }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.corrections) {
          console.log(data.corrections);
          setCorrections(data.corrections);
        } else {
          setCorrections([]);
        }
      })
      .catch((error) => {
        console.error('Failed to grade content:', error);
      });
  };

  const handleExplain = () => {
    if (!selectedText) {
      alert('解説したいフレーズを選択してください。');
      return;
    }

    // ディクテーション内容をCaption形式で準備
    const captions: Caption[] = [
      {
        text: dictationContent,
        start: 0,
        duration: 0,
      },
    ];

    // エンドポイントから解説を取得
    fetch(`${process.env.REACT_APP_API_URL}/explain`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${accessToken}`,
       },
      body: JSON.stringify({
        expression: selectedText,
        captions: captions,
      }),
    })
      .then((res) => res.json())
      .then((data) => setExplanation(data.explanation))
      .catch((error) => {
        console.error('Failed to fetch explanation:', error);
      });
  };

  const handleAddWord = (word: string, meaning: string) => {
    if (!accessToken) {
      console.error('User is not authenticated');
      return;
    }

    // エンドポイントに単語を追加
    fetch(`${process.env.REACT_APP_API_URL}/words/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text: word , meaning: meaning}),
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
      <Grid container spacing={10}>
        <Grid item xs={12} md={6}>
          <VideoPlayer videoUrl={videoUrl} />
          <Dictation
            onTextSelect={handleTextSelect}
            onContentChange={handleContentChange}
            onGrade={handleGrade}
            content={dictationContent}
            corrections={corrections}
          />
        </Grid>
        <Grid item xs={12} md={6}>
        <Explanation
            selectedText={selectedText}
            explanation={explanation}
            onExplain={handleExplain}
          />
          <AddWordButton word={selectedText} meaning={explanation} onAddWord={handleAddWord} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Learning;
