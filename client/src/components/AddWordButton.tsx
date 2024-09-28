import React from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { on } from 'stream';

interface AddWordButtonProps {
  word: string;
  meaning: string;
  onAddWord: (word: string, meaning: string) => void;
}

const AddWordButton: React.FC<AddWordButtonProps> = ({ word, meaning, onAddWord }) => {
  const { accessToken } = useAuth();

  const handleAddWord = async () => {
    if (!accessToken) {
      console.error('User is not authenticated');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/words/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text: word, meaning: meaning }),
      });

      if (!response.ok) {
        throw new Error('Failed to add word');
      }

      const data = await response.json();
      onAddWord(data.text, data.meaning);
    } catch (error) {
      console.error('Error adding word:', error);
      // 必要に応じてユーザーにエラーメッセージを表示
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => onAddWord(word, meaning)}
      disabled={!word}
      fullWidth
    >
      単語帳に追加
    </Button>
  );
};

export default AddWordButton;
