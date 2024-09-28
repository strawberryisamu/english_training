// Explanation.tsx
import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { Height } from '@mui/icons-material';

interface ExplanationProps {
  selectedText: string;
  explanation: string;
  onExplain: () => void;
}

const Explanation: React.FC<ExplanationProps> = ({ selectedText, explanation, onExplain }) => {
  return (
    <Box>
      <Typography variant="h6">選択されたフレーズ:</Typography>
      <Box
        style={{
          height: '100px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          {selectedText || 'フレーズを選択してください'}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={onExplain}
        disabled={!selectedText}
        fullWidth
      >
        解説を取得
      </Button>
      <Box
        mt={2}
        style={{
          maxHeight: '430px',
          overflowY: 'scroll',
          border: '1px solid #ccc',
          padding: '1rem',
        }}
      >
        <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
          {explanation || 'ここに解説が表示されます'}
        </Typography>
      </Box>
    </Box>
  );
};

export default Explanation;
