import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { CircularProgress, Alert } from '@mui/material';

interface Word {
  id: number;
  text: string;
  meaning?: string;
}

const WordBook: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const { currentUser, accessToken } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!accessToken) {
      setError('ユーザーが認証されていません。');
      setLoading(false);
      return;
    }
  
    fetch(`${process.env.REACT_APP_API_URL}/words/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('データの取得に失敗しました。');
        }
        return res.json();
      })
      .then((data) => {
        setWords(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch words:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [accessToken]);

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>
        {currentUser?.email}の単語帳
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List>
          {words.map((word) => (
            <ListItem key={word.id}>
              <ListItemText primary={word.text} secondary={word.meaning} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
export default WordBook;
