import React from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';

interface Caption {
  text: string;
  start: number;
  duration: number;
}

interface SubtitleProps {
  captions: Caption[];
  onExpressionClick: (expression: string) => void;
}

const Subtitle: React.FC<SubtitleProps> = ({ captions = [], onExpressionClick }) => {
  return (
    <div>
      <List>
        {captions.length === 0 ? (
          <ListItemText primary="字幕が取得できませんでした。" />
        ) : (
          captions.map((caption, index) => (
            <ListItemButton key={index} onClick={() => onExpressionClick(caption.text)}>
              <ListItemText primary={caption.text} />
            </ListItemButton>
          ))
        )}
      </List>
    </div>
  );
};

export default Subtitle;
