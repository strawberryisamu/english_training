import React from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

interface WordListProps {
  words: string[];
}

const WordList: React.FC<WordListProps> = ({ words }) => {
  return (
    <List>
      {words.map((word, index) => (
        <ListItem key={index}>
          <ListItemText primary={word} />
        </ListItem>
      ))}
    </List>
  );
};

export default WordList;
