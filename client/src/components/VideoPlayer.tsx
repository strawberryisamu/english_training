import React from 'react';
import { Box } from '@mui/material';

interface VideoPlayerProps {
  videoUrl: string;
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const videoId = extractVideoId(videoUrl);

  return (
    <Box mb={2}>
      {videoId ? (
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allowFullScreen
            title="YouTube video player"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          ></iframe>
        </div>
      ) : (
        <p>有効な動画URLを入力してください。</p>
      )}
    </Box>
  );
};

function extractVideoId(url: string): string | null {
  // YouTubeのURLから動画IDを抽出するロジック
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default VideoPlayer;
