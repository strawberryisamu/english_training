// Dictation.tsx
import React, { useRef } from 'react';
import { Typography, Box, Button, TextField } from '@mui/material';
import { Height } from '@mui/icons-material';

interface DictationProps {
  onTextSelect: (selectedText: string) => void;
  onContentChange: (content: string) => void;
  onGrade: () => void; // 採点ボタンのクリックイベント
  content: string;
  corrections: Correction[];
}

interface Correction {
  word: string;
  suggestion: string;
  start_index: number;
  end_index: number;
}

const Dictation: React.FC<DictationProps> = ({
    onTextSelect,
    onContentChange,
    onGrade,
    content,
    corrections = [],
}) => {
  const textAreaRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    onContentChange(newContent);
  };

  const handleMouseUp = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || '';
      onTextSelect(selectedText.trim());
    }
  };

  // ミスのハイライト表示のために、テキストを分割
  const renderContent = () => {
    const elements = [];
    let lastIndex = 0;

    corrections.sort((a, b) => a.start_index - b.start_index);

    corrections.forEach((correction, idx) => {
      if (lastIndex < correction.start_index) {
        elements.push(
          <span key={`text-${idx}`}>
            {content.slice(lastIndex, correction.start_index)}
          </span>
        );
      }
      elements.push(
        <span key={`correction-${idx}`} style={{ color: 'red' }}>
          {content.slice(correction.start_index, correction.end_index)}
        </span>
      );
      lastIndex = correction.end_index;
    });

    if (lastIndex < content.length) {
      elements.push(
        <span key={`text-end`}>{content.slice(lastIndex)}</span>
      );
    }

    return elements;
  };
  return (
    <Box onMouseUp={handleMouseUp} width="100%" height="50%">
      <Box>
        <Typography variant="h6" gutterBottom>
          ディクテーションエリア
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          動画を視聴しながら、聞き取った内容をこちらに入力してください。<br />カーソルで選択した範囲の語法を解説します。
        </Typography>
        <Box
          mt={2}
          style={{
            height: '250px',
            border: '1px solid #ccc',
            whiteSpace: 'pre-wrap',
            overflowY: 'scroll',
          }}
        >
          <TextField
            multiline
            fullWidth
            minRows={2}
            variant="outlined"
            placeholder="ここに入力してください..."
            value={content}
            onChange={handleContentChange}
            slotProps={{
              input: {
                style: {
                  border: 'none',
                  outline: 'none',
                },
              },
            }}
            InputProps={{
              style: {
                border: 'none',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Dictation;
