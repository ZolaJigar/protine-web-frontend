'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Container, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { categoriesAPI } from '@/lib/api';

const ACCENTS = [
  { bg: '#FEF2F2', color: '#DC2626' },
  { bg: '#FFF7ED', color: '#EA580C' },
  { bg: '#F0FDF4', color: '#16A34A' },
  { bg: '#EFF6FF', color: '#2563EB' },
  { bg: '#FDF4FF', color: '#9333EA' },
  { bg: '#F0FDFA', color: '#0D9488' },
];

export default function FeaturedCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    categoriesAPI
      .getAll({ page: 1, limit: 6 })
      .then((res) => setCategories(res.data?.data?.data ?? []))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load categories.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FAFAF9' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: { xs: 4, md: 6 }, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box className="section-eyebrow">Browse by Category</Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F0F0F', mt: 0.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Explore Our Range
            </Typography>
            <Box className="divider-accent" sx={{ mt: 1.5 }} />
          </Box>
          <Link href="/categories" style={{ textDecoration: 'none' }}>
            <Button endIcon={<ArrowForward sx={{ fontSize: 16 }} />} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              All Categories
            </Button>
          </Link>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} sx={{ color: '#FF5722' }} />
          </Box>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && categories.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
              gap: 2,
            }}
          >
            {categories.map((cat, i) => {
              const { bg, color } = ACCENTS[i % ACCENTS.length];
              return (
                <Box
                  key={cat.id}
                  onClick={() => router.push(`/products?category_id=${cat.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/products?category_id=${cat.id}`)}
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    p: 2.5, borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '1px solid #E7E5E4',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: color,
                      background: bg,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 8px 24px ${color}20`,
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 60, height: 60, borderRadius: '14px',
                      bgcolor: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mb: 1.5, overflow: 'hidden',
                    }}
                    role="img"
                    aria-label={cat.name}
                  >
                    {cat.image ? (
                      <Box
                        component="img"
                        src={cat.image}
                        alt={cat.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 24, fontWeight: 900, color }}>
                        {cat.name.charAt(0).toUpperCase()}
                      </Typography>
                    )}
                  </Box>

                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F0F0F', textAlign: 'center', lineHeight: 1.3 }}>
                    {cat.name}
                  </Typography>

                  {cat.products_count != null && (
                    <Typography sx={{ fontSize: '0.72rem', color: '#737373', mt: 0.5, fontWeight: 500 }}>
                      {cat.products_count} products
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
