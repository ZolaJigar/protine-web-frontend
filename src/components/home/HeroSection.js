'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button, Grid, Chip } from '@mui/material';
import { ShoppingCart, PlayCircle, LocalShipping, Security, Star } from '@mui/icons-material';

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Products' },
  { value: '50+',  label: 'Cities' },
  { value: '4.8★', label: 'Rating' },
];

export default function HeroSection() {
  return (
    <Box
      className="hero-3d"
      sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} alignItems="center">
          {/* Left */}
          <Grid item xs={12} md={6}>
            <Box className="animate-fadeInUp">
              <Chip
                icon={<Star sx={{ color: '#F59E0B !important', fontSize: 16 }} />}
                label="India's #1 Premium Food Brand"
                sx={{ bgcolor: 'rgba(245,158,11,0.18)', color: '#FFF8F0', mb: 2.5, fontWeight: 600, border: '1px solid rgba(245,158,11,0.35)' }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 900, color: '#FFF8F0', lineHeight: 1.15, mb: 2,
                }}
              >
                Premium Taste,{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                >
                  Healthy Choice
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: 'rgba(255,248,240,0.82)', mb: 4, fontWeight: 400, lineHeight: 1.8, maxWidth: 480 }}
              >
                Discover our premium ketchup, mayonnaise, and a world of delicious sauces.
                Made with natural ingredients — fresh flavour in every bite.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained" size="large" startIcon={<ShoppingCart />}
                    sx={{
                      background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                      color: '#1C1917', px: 4, py: 1.5, fontSize: 16, fontWeight: 700,
                      boxShadow: '0 8px 28px rgba(245,158,11,0.45)',
                      '&:hover': { background: 'linear-gradient(135deg, #D97706, #F59E0B)', boxShadow: '0 12px 36px rgba(245,158,11,0.55)' },
                    }}
                  >
                    Shop Now
                  </Button>
                </Link>
                <Button
                  variant="outlined" size="large" startIcon={<PlayCircle />}
                  sx={{
                    color: '#FFF8F0', borderColor: 'rgba(255,248,240,0.45)', px: 4, py: 1.5, fontSize: 16,
                    '&:hover': { borderColor: '#F59E0B', bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
                  }}
                >
                  Watch Video
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {[
                  { icon: <LocalShipping />, text: 'Free Delivery above ₹499' },
                  { icon: <Security />,      text: 'Secure Payments' },
                ].map((badge) => (
                  <Box key={badge.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ color: '#F59E0B' }}>{badge.icon}</Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.85)', fontWeight: 500 }}>
                      {badge.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right — floating logo */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: { xs: 300, md: 420 } }}>
              {/* Outer glow */}
              <Box sx={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />

              {/* Frosted circle */}
              <Box
                className="animate-float"
                sx={{
                  width: 300, height: 300, borderRadius: '50%',
                  background: 'rgba(255,248,240,0.10)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(255,248,240,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                  zIndex: 1,
                }}
              >
                <Box
                  component="img"
                  src="/logo_without_bg.png"
                  alt="Protine Web"
                  sx={{ width: 260, height: 260, objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))' }}
                />
              </Box>

              {/* Floating badges */}
              {[
                { emoji: '🥣', label: 'Ketchup',   top: '5%',   left: '5%',  delay: '0s' },
                { emoji: '🫙', label: 'Mayo',       top: '5%',   right: '5%', delay: '0.5s' },
                { emoji: '🌿', label: 'Organic',    bottom: '10%', left: '5%',  delay: '1s' },
                { emoji: '⭐', label: '4.8 Rating', bottom: '10%', right: '5%', delay: '1.5s' },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    position: 'absolute',
                    top: item.top, left: item.left, right: item.right, bottom: item.bottom,
                    bgcolor: '#FFF8F0', borderRadius: 3,
                    px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 0.8,
                    boxShadow: '0 6px 20px rgba(27,67,50,0.18)',
                    animation: `float 3s ease-in-out ${item.delay} infinite`,
                  }}
                >
                  <Typography sx={{ fontSize: 20 }}>{item.emoji}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1C1917', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mt: 4 }}>
          {stats.map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Box
                sx={{
                  textAlign: 'center',
                  bgcolor: 'rgba(255,248,240,0.10)',
                  borderRadius: 3, py: 2, px: 1,
                  border: '1px solid rgba(255,248,240,0.15)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#F59E0B' }}>{stat.value}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.75)', fontWeight: 500 }}>{stat.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
