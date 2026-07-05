'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Container, Typography, Card, CardContent,
  CircularProgress, Alert,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { categoriesAPI } from '@/lib/api';

const PALETTE = [
  { color: '#B91C1C', bg: '#FEE2E2' },
  { color: '#E5501A', bg: '#FFF0EB' },
  { color: '#C2410C', bg: '#FFEDD5' },
  { color: '#16A34A', bg: '#F0FDF4' },
  { color: '#78350F', bg: '#FFF0EB' },
  { color: '#4ADE80', bg: '#F0FDF4' },
  { color: '#1E40AF', bg: '#DBEAFE' },
  { color: '#7C3AED', bg: '#EDE9FE' },
];

function getPalette(index) {
  return PALETTE[index % PALETTE.length];
}

export default function FeaturedCategories() {
  const router = useRouter();
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
    <Box sx={{ py: 8, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="xl">
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#FF6B35', fontWeight: 700, letterSpacing: 2 }}>
            Browse by Category
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#16A34A', mt: 1 }}>
            Explore Our Range
          </Typography>
          <Typography variant="body1" sx={{ color: '#4B5563', mt: 1, maxWidth: 500, mx: 'auto' }}>
            From classic ketchups to gourmet dressings — find exactly what you need.
          </Typography>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#16A34A' }} />
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
                <Card
                  key={cat.id}
                  className="card-3d"
                  onClick={() => router.push(`/products?category_id=${cat.id}`)}
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

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                        {cat.name}
                      </Typography>

                      {cat.products_count != null && (
                        <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
                          {cat.products_count} Products
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
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
                  color: '#16A34A', fontWeight: 700, fontSize: 16,
                  '&:hover': { color: '#4ADE80' },
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
