'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Button, Grid, Chip,
  IconButton, Skeleton,
} from '@mui/material';
import {
  ShoppingCart, PlayCircle, LocalShipping, Security, Star,
  ChevronLeft, ChevronRight,
} from '@mui/icons-material';
import { bannersAPI } from '@/lib/api';

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Products' },
  { value: '50+',  label: 'Cities' },
  { value: '4.8★', label: 'Rating' },
];

// ── Static fallback hero (shown when API has no banners) ──────────────────────
function StaticHero() {
  return (
    <Box
      className="hero-3d"
      sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          {/* Left */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="animate-fadeInUp">
              <Chip
                icon={<Star sx={{ color: '#FF6B35 !important', fontSize: 16 }} />}
                label="India's #1 Premium Food Brand"
                sx={{ bgcolor: 'rgba(245,158,11,0.18)', color: '#FFFFFF', mb: 2.5, fontWeight: 600, border: '1px solid rgba(245,158,11,0.35)' }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 900, color: '#FFFFFF', lineHeight: 1.15, mb: 2,
                }}
              >
                Premium Taste,{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(90deg, #FF6B35, #FF8C5A)',
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
                      background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
                      color: '#111827', px: 4, py: 1.5, fontSize: 16, fontWeight: 700,
                      boxShadow: '0 8px 28px rgba(245,158,11,0.45)',
                      '&:hover': { background: 'linear-gradient(135deg, #E5501A, #FF6B35)', boxShadow: '0 12px 36px rgba(245,158,11,0.55)' },
                    }}
                  >
                    Shop Now
                  </Button>
                </Link>
                <Button
                  variant="outlined" size="large" startIcon={<PlayCircle />}
                  sx={{
                    color: '#FFFFFF', borderColor: 'rgba(255,248,240,0.45)', px: 4, py: 1.5, fontSize: 16,
                    '&:hover': { borderColor: '#FF6B35', bgcolor: 'rgba(245,158,11,0.12)', color: '#FF6B35' },
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
                    <Box sx={{ color: '#FF6B35' }}>{badge.icon}</Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.85)', fontWeight: 500 }}>
                      {badge.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right — floating logo */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: { xs: 300, md: 420 } }}>
              <Box sx={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }} />
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
                    bgcolor: '#FFFFFF', borderRadius: 3,
                    px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 0.8,
                    boxShadow: '0 6px 20px rgba(27,67,50,0.18)',
                    animation: `float 3s ease-in-out ${item.delay} infinite`,
                  }}
                >
                  <Typography sx={{ fontSize: 20 }}>{item.emoji}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
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
            <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
              <Box
                sx={{
                  textAlign: 'center',
                  bgcolor: 'rgba(255,248,240,0.10)',
                  borderRadius: 3, py: 2, px: 1,
                  border: '1px solid rgba(255,248,240,0.15)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FF6B35' }}>{stat.value}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.75)', fontWeight: 500 }}>{stat.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ── Banner Carousel ───────────────────────────────────────────────────────────
function BannerCarousel({ banners }) {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  const total = banners.length;

  const go = useCallback((index) => {
    setCurrent((index + total) % total);
  }, [total]);

  // Auto-advance every 4 s
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(() => go(current + 1), 4000);
    return () => clearInterval(timerRef.current);
  }, [current, paused, total, go]);

  return (
    <Box
      sx={{ position: 'relative', width: '100%', overflow: 'hidden', bgcolor: '#111' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides track */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${current * 100}%)`,
          willChange: 'transform',
        }}
      >
        {banners.map((banner, i) => (
          <Box
            key={banner.id}
            sx={{
              width: '100%',
              minWidth: '100%',
              maxWidth: '100%',
              flexShrink: 0,
              flexGrow: 0,
              position: 'relative',
              height: { xs: 260, sm: 380, md: 500 },
              overflow: 'hidden',
              bgcolor: '#1a1a1a',
            }}
          >
            {/* Banner image */}
            <Box
              component="img"
              src={banner.image}
              alt={banner.title || `Banner ${i + 1}`}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Gradient overlay */}
            <Box
              sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.20) 60%, transparent 100%)',
              }}
            />

            {/* Text content */}
            {(banner.title || banner.description) && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: 24, md: 48 },
                  left: { xs: 20, md: 60 },
                  maxWidth: { xs: '80%', md: 520 },
                }}
              >
                {banner.title && (
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900, color: '#FFFFFF',
                      fontSize: { xs: '1.6rem', md: '2.8rem' },
                      lineHeight: 1.2, mb: 1,
                      textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                    }}
                  >
                    {banner.title}
                  </Typography>
                )}
                {banner.description && (
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.88)',
                      fontWeight: 400,
                      fontSize: { xs: '0.95rem', md: '1.2rem' },
                      mb: 2.5,
                      textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                    }}
                  >
                    {banner.description}
                  </Typography>
                )}
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    sx={{
                      background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
                      color: '#111827', px: 3.5, py: 1.2, fontWeight: 700,
                      boxShadow: '0 6px 20px rgba(245,158,11,0.45)',
                      '&:hover': { background: 'linear-gradient(135deg, #E5501A, #FF6B35)' },
                    }}
                  >
                    Shop Now
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Prev / Next arrows — only when more than 1 banner */}
      {total > 1 && (
        <>
          <IconButton
            onClick={() => go(current - 1)}
            aria-label="Previous banner"
            sx={{
              position: 'absolute', left: { xs: 8, md: 16 }, top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.40)', color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => go(current + 1)}
            aria-label="Next banner"
            sx={{
              position: 'absolute', right: { xs: 8, md: 16 }, top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.40)', color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Dot indicators */}
          <Box
            sx={{
              position: 'absolute', bottom: 14, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: 1,
            }}
          >
            {banners.map((_, i) => (
              <Box
                key={i}
                onClick={() => setCurrent(i)}
                role="button"
                aria-label={`Go to banner ${i + 1}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setCurrent(i)}
                sx={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: i === current ? '#FF6B35' : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function BannerSkeleton() {
  return (
    <Skeleton
      variant="rectangular"
      sx={{ width: '100%', height: { xs: 260, sm: 380, md: 500 } }}
    />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bannersAPI
      .getList({ page: 1, limit: 10 })
      .then((res) => {
        const list = res.data?.data?.data ?? [];
        setBanners(list);
      })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <BannerSkeleton />;

  // No banners from API → show original static hero
  if (banners.length === 0) return <StaticHero />;

  return <BannerCarousel banners={banners} />;
}
