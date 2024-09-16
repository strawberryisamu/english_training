import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

interface ExplanationProps {
  expression: string;
  explanation: string;
}

const Explanation: React.FC<ExplanationProps> = ({ expression, explanation }) => {
  return (
    <Box mb={2}>
      <Typography variant="h6">解説</Typography>
      {expression ? (
        <Paper elevation={3} style={{ padding: '16px' }}>
          <Typography variant="subtitle1" color="primary">
            {expression}
          </Typography>
          <Typography variant="body1">{explanation}</Typography>
        </Paper>
      ) : (
        <Typography variant="body1">表現を選択してください。</Typography>
      )}
    </Box>
  );
};

export default Explanation;
