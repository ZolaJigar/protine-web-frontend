'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Button, Chip, Skeleton, IconButton,
} from '@mui/material';
import { ShoppingCart, ArrowForward, ChevronLeft, ChevronRight, Star, LocalShipping, Security, VerifiedUser } from '@mui/icons-material';
import { bannersAPI } from '@/lib/api';

const stats = [
  { value: '10K+',  label: 'Happy Customers' },
  { value: '500+',  label: 'Products' },
  { value: '50+',   label: 'Cities' },
  { value: '4.8',   label: 'Avg Rating', suffix: '★' },
];

const badges = [
  { icon: <LocalShipping sx={{ fontSize: 16 }} />, text: 'Free delivery above ₹499' },
  { icon: <Security sx={{ fontSize: 16 }} />,      text: 'Secure payments' },
  { icon: <VerifiedUser sx={{ fontSize: 16 }} />,  text: '100% authentic products' },
];

// ── Static fallback hero ──────────────────────────────────────────────────────
function StaticHero() {
  return (
    <Box
      sx={{
        background: '#0F0F0F',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 10, md: 14 },
      }}
    >
      {/* Background glows */}
      <Box sx={{
        position: 'absolute', top: '-20%', right: '-5%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(255,87,34,0.14) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-10%', left: '20%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 6, md: 8 }, alignItems: 'center' }}>

          {/* Left content */}
          <Box className="animate-fadeInUp">
            {/* Eyebrow */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.6,
              background: 'rgba(255,87,34,0.12)',
              border: '1px solid rgba(255,87,34,0.25)',
              borderRadius: '100px',
              mb: 3,
            }}>
              <Star sx={{ fontSize: 14, color: '#FF5722' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5722', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                India's #1 Premium Food Brand
              </Typography>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.6rem', sm: '3.2rem', md: '3.8rem', lg: '4.4rem' },
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '-0.035em',
                mb: 2.5,
              }}
            >
              Premium Taste,{' '}
              <Box
                component="span"
                sx={{
                  color: '#FF5722',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                Healthy Choice
              </Box>
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.75,
                mb: 4,
                maxWidth: 500,
                fontWeight: 400,
              }}
            >
              Discover our premium ketchup, mayonnaise, and healthy food products.
              Made with natural ingredients — fresh flavour in every bite.
            </Typography>

            {/* CTAs */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 5 }}>
              <Link href="/products" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
                  sx={{ fontWeight: 700, fontSize: '0.95rem', px: 3.5, py: 1.4 }}
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="/categories" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    px: 3.5, py: 1.4,
                    borderWidth: '1.5px',
                    '&:hover': {
                      borderColor: '#FF5722',
                      color: '#FF5722',
                      background: 'rgba(255,87,34,0.06)',
                      borderWidth: '1.5px',
                    },
                  }}
                >
                  Browse Categories
                </Button>
              </Link>
            </Box>

            {/* Trust badges */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 3 } }}>
              {badges.map((b) => (
                <Box key={b.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ color: '#FF5722' }}>{b.icon}</Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', fontWeight: 500 }}>
                    {b.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right — logo visual */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: { xs: 280, md: 420 } }}>
            {/* Outer glow ring */}
            <Box sx={{
              position: 'absolute',
              width: { xs: 280, md: 380 },
              height: { xs: 280, md: 380 },
              borderRadius: '50%',
              border: '1px solid rgba(255,87,34,0.15)',
              animation: 'float 6s ease-in-out infinite',
            }} />
            {/* Middle ring */}
            <Box sx={{
              position: 'absolute',
              width: { xs: 220, md: 300 },
              height: { xs: 220, md: 300 },
              borderRadius: '50%',
              border: '1px solid rgba(255,87,34,0.08)',
            }} />
            {/* Logo */}
            <Box
              className="animate-float"
              sx={{
                width: { xs: 180, md: 240 },
                height: { xs: 180, md: 240 },
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <Box
                component="img"
                src="/logo_without_bg.png"
                alt="Protine Web"
                sx={{ width: '70%', height: '70%', objectFit: 'contain' }}
              />
            </Box>

            {/* Floating chips */}
            {[
              { emoji: '🥣', label: 'Ketchup',   top: '8%',    left: '0%',   delay: '0s'   },
              { emoji: '🫙', label: 'Mayo',       top: '8%',    right: '0%',  delay: '0.6s' },
              { emoji: '💪', label: 'Proteins',   bottom: '12%', left: '0%',  delay: '1.2s' },
              { emoji: '⭐', label: '4.8 Stars',  bottom: '12%', right: '0%', delay: '1.8s' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  position: 'absolute',
                  top: item.top, left: item.left, right: item.right, bottom: item.bottom,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  px: 1.5, py: 0.8,
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  animation: `float 4s ease-in-out ${item.delay} infinite`,
                  zIndex: 2,
                }}
              >
                <Typography sx={{ fontSize: 18 }}>{item.emoji}</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Stats row */}
        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            pt: { xs: 4, md: 5 },
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {stats.map((stat) => (
            <Box key={stat.label} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 900,
                color: '#FF5722',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}>
                {stat.value}{stat.suffix ?? ''}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', mt: 0.5, fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
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

  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(() => go(current + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, [current, paused, total, go]);

  return (
    <Box
      sx={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#0F0F0F' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track */}
      <Box
        sx={{
          display: 'flex',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${current * 100}%)`,
          willChange: 'transform',
        }}
      >
        {banners.map((banner, i) => (
          <Box
            key={banner.id}
            sx={{
              width: '100%', minWidth: '100%',
              position: 'relative',
              height: { xs: 260, sm: 380, md: 520 },
              overflow: 'hidden',
              bgcolor: '#111',
            }}
          >
            <Box
              component="img"
              src={banner.image}
              alt={banner.title || `Banner ${i + 1}`}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <Box sx={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
            }} />
            {(banner.title || banner.description) && (
              <Box sx={{ position: 'absolute', bottom: { xs: 24, md: 52 }, left: { xs: 20, md: 64 }, maxWidth: { xs: '80%', md: 560 } }}>
                {banner.title && (
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.5rem', md: '2.8rem' }, lineHeight: 1.2, mb: 1, letterSpacing: '-0.03em' }}>
                    {banner.title}
                  </Typography>
                )}
                {banner.description && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: { xs: '0.9rem', md: '1.1rem' }, mb: 3 }}>
                    {banner.description}
                  </Typography>
                )}
                <Link href="/products" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" startIcon={<ShoppingCart />} sx={{ fontWeight: 700, px: 3 }}>
                    Shop Now
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Controls */}
      {total > 1 && (
        <>
          <IconButton
            onClick={() => go(current - 1)}
            aria-label="Previous"
            sx={{
              position: 'absolute', left: { xs: 8, md: 20 }, top: '50%', transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
              width: 40, height: 40,
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => go(current + 1)}
            aria-label="Next"
            sx={{
              position: 'absolute', right: { xs: 8, md: 20 }, top: '50%', transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.35)', color: '#fff', backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
              width: 40, height: 40,
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Dots */}
          <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.75 }}>
            {banners.map((_, i) => (
              <Box
                key={i}
                onClick={() => setCurrent(i)}
                role="button"
                aria-label={`Go to banner ${i + 1}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setCurrent(i)}
                sx={{
                  width: i === current ? 20 : 6, height: 6,
                  borderRadius: 3,
                  bgcolor: i === current ? '#FF5722' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bannersAPI
      .getList({ page: 1, limit: 10 })
      .then((res) => setBanners(res.data?.data?.data ?? []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Skeleton variant="rectangular" sx={{ width: '100%', height: { xs: 260, sm: 380, md: 520 } }} />
  );

  if (banners.length === 0) return <StaticHero />;

  return <BannerCarousel banners={banners} />;
}
