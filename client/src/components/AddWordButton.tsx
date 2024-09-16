import React from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface AddWordButtonProps {
  word: string;
  onAddWord: (word: string) => void;
}

const AddWordButton: React.FC<AddWordButtonProps> = ({ word, onAddWord }) => {
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
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text: word }),
      });

      if (!response.ok) {
        throw new Error('Failed to add word');
      }

      const data = await response.json();
      onAddWord(data.text);
    } catch (error) {
      console.error('Error adding word:', error);
      // 必要に応じてユーザーにエラーメッセージを表示
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleAddWord}
      disabled={!word}
      fullWidth
    >
      単語帳に追加
    </Button>
  );
};

export default AddWordButton;
