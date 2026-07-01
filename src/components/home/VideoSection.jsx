'use client';

import { useState } from 'react';
import { Box, Container, Typography, Paper, IconButton } from '@mui/material';
import { PlayCircleFilled } from '@mui/icons-material';

const videos = [
  { id: 1, title: 'How We Make Our Ketchup',  thumb: '🍅', desc: 'From farm to bottle — the pure tomato journey.' },
  { id: 2, title: 'Healthy Recipes with Mayo', thumb: '🥗', desc: 'Delicious meals using our eggless mayonnaise.' },
  { id: 3, title: 'The Art of Hot Sauce',      thumb: '🌶️', desc: 'Our unique blend of spices for that perfect kick.' },
];

export default function VideoSection() {
  const [playing, setPlaying] = useState(null);

  return (
    <Box sx={{ py: 8, background: 'linear-gradient(160deg, #1C1917 0%, #1B4332 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative blobs */}
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(245,158,11,0.05)' }} />
      <Box sx={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,248,240,0.04)' }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: 2 }}>
            Food Stories
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#FFF8F0', mt: 1 }}>
            Watch Our Food Videos
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,248,240,0.65)', mt: 1, maxWidth: 500, mx: 'auto' }}>
            Get inspired with recipes, behind-the-scenes production, and food tips.
          </Typography>
        </Box>

        {/* 3 cards — full width, 3 equal columns */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, 1fr)',
            },
            gap: 3,
            width: '100%',
          }}
        >
          {videos.map((video) => (
            <Paper
              key={video.id}
              sx={{
                borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
                background: 'rgba(255,248,240,0.05)',
                border: '1px solid rgba(255,248,240,0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(245,158,11,0.35)',
                },
              }}
              onClick={() => setPlaying(video.id)}
            >
              {/* Thumbnail */}
              <Box
                sx={{
                  height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(27,67,50,0.5)', position: 'relative',
                }}
                role="img"
                aria-label={video.title}
              >
                <Typography sx={{ fontSize: 80 }}>{video.thumb}</Typography>
                <Box
                  sx={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.25)', opacity: 0, transition: 'opacity 0.3s',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <IconButton aria-label={`Play ${video.title}`}>
                    <PlayCircleFilled sx={{ fontSize: 64, color: '#F59E0B' }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Info */}
              <Box sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFF8F0', mb: 0.5 }}>
                  {video.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.6)' }}>
                  {video.desc}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
