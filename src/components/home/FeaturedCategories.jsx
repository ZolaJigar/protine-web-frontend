'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Card, CardContent,
  CircularProgress, Alert,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { categoriesAPI } from '@/lib/api';

const PALETTE = [
  { color: '#B91C1C', bg: '#FEE2E2' },
  { color: '#D97706', bg: '#FEF3C7' },
  { color: '#C2410C', bg: '#FFEDD5' },
  { color: '#1B4332', bg: '#D8F3DC' },
  { color: '#78350F', bg: '#FEF3C7' },
  { color: '#2D6A4F', bg: '#D8F3DC' },
  { color: '#1E40AF', bg: '#DBEAFE' },
  { color: '#7C3AED', bg: '#EDE9FE' },
];

function getPalette(index) {
  return PALETTE[index % PALETTE.length];
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    categoriesAPI
      .getAll({ page: 1, limit: 6 })
      .then((res) => {
        const list = res.data?.data?.data ?? [];
        setCategories(list);
      })
      .catch((err) => {
        console.error('FeaturedCategories fetch error:', err);
        setError(err?.response?.data?.message || 'Failed to load categories.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ py: 8, bgcolor: '#FFF8F0' }}>
      <Container maxWidth="xl">
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: 2 }}>
            Browse by Category
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1B4332', mt: 1 }}>
            Explore Our Range
          </Typography>
          <Typography variant="body1" sx={{ color: '#57534E', mt: 1, maxWidth: 500, mx: 'auto' }}>
            From classic ketchups to gourmet dressings — find exactly what you need.
          </Typography>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#1B4332' }} />
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* Category grid */}
        {!loading && !error && categories.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(6, 1fr)',
              },
              gap: 2,
              width: '100%',
            }}
          >
            {categories.map((cat, index) => {
              const { color, bg } = getPalette(index);
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  style={{ textDecoration: 'none', display: 'flex' }}
                >
                  <Card
                    className="card-3d"
                    sx={{
                      width: '100%',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      transition: 'all 0.3s',
                      '&:hover': { border: `2px solid ${color}50` },
                    }}
                  >
                    <CardContent
                      sx={{
                        py: 3, px: 1,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {/* Category image or fallback initial */}
                      <Box
                        sx={{
                          width: 72, height: 72, borderRadius: '50%',
                          bgcolor: bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          mb: 1.5, overflow: 'hidden',
                          boxShadow: `0 4px 16px ${color}25`,
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.1)' },
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
                          <Typography sx={{ fontSize: 28, fontWeight: 800, color }}>
                            {cat.name.charAt(0).toUpperCase()}
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C1917', mb: 0.5 }}>
                        {cat.name}
                      </Typography>

                      {cat.products_count != null && (
                        <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
                          {cat.products_count} Products
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </Box>
        )}

        {/* View all link */}
        {!loading && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Link href="/categories" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1,
                  color: '#1B4332', fontWeight: 700, fontSize: 16,
                  '&:hover': { color: '#2D6A4F' },
                }}
              >
                View All Categories <ArrowForward fontSize="small" />
              </Box>
            </Link>
          </Box>
        )}
      </Container>
    </Box>
  );
}
