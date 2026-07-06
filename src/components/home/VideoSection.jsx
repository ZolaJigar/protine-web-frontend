'use client';

import { useState } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { PlayCircleFilled } from '@mui/icons-material';

const videos = [
  { id: 1, title: 'How We Make Our Ketchup',   thumb: '🍅', desc: 'From farm to bottle — the pure tomato journey.' },
  { id: 2, title: 'Healthy Recipes with Mayo',  thumb: '🥗', desc: 'Delicious meals using our eggless mayonnaise.' },
  { id: 3, title: 'The Art of Hot Sauce',       thumb: '🌶️', desc: 'Our unique blend of spices for that perfect kick.' },
];

export default function VideoSection() {
  const [hovering, setHovering] = useState(null);

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#0F0F0F', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute', top: '-15%', right: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,87,34,0.1) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: { xs: 5, md: 8 } }}>
          <Box className="section-eyebrow">Food Stories</Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#FFFFFF', mt: 0.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Watch Our Food Videos
          </Typography>
          <Box sx={{ width: 40, height: 3, background: '#FF5722', borderRadius: 2, mt: 1.5 }} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          {videos.map((video) => (
            <Box
              key={video.id}
              role="button"
              tabIndex={0}
              aria-label={`Play ${video.title}`}
              onMouseEnter={() => setHovering(video.id)}
              onMouseLeave={() => setHovering(null)}
              onKeyDown={(e) => e.key === 'Enter' && setHovering(video.id)}
              sx={{
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: 'rgba(255,87,34,0.3)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                },
              }}
            >
              {/* Thumbnail */}
              <Box
                sx={{
                  height: 200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  position: 'relative',
                }}
                role="img"
                aria-label={video.title}
              >
                <Typography sx={{ fontSize: 64 }}>{video.thumb}</Typography>
                {/* Play overlay */}
                <Box sx={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.35)',
                  opacity: hovering === video.id ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}>
                  <Box sx={{
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: '#FF5722',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(255,87,34,0.5)',
                  }}>
                    <PlayCircleFilled sx={{ fontSize: 28, color: '#FFFFFF' }} />
                  </Box>
                </Box>
              </Box>

              {/* Info */}
              <Box sx={{ p: 2.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem', mb: 0.5 }}>
                  {video.title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                  {video.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
