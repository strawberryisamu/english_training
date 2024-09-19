// Subtitle.tsx
import React, { useRef } from 'react';

interface Caption {
  text: string;
  start: number;
  duration: number;
}

interface SubtitleProps {
  captions: Caption[];
  onTextSelect: (selectedText: string) => void;
}

const Subtitle: React.FC<SubtitleProps> = ({ captions, onTextSelect }) => {
  const textContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || '';
      onTextSelect(selectedText.trim());
    }
  };

  return (
    <div
      ref={textContainerRef}
      onMouseUp={handleMouseUp}
      style={{ userSelect: 'text', padding: '1rem', border: '1px solid #ccc', overflowY: 'auto', height: '220px' }}
    >
      {captions.map((caption, index) => (
        <span key={index}>{caption.text} </span>
      ))}
    </div>
  );
};

export default Subtitle;
