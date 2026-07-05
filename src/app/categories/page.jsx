'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Card, CardContent, Chip,
  TextField, InputAdornment, CircularProgress, Alert,
} from '@mui/material';
import { ArrowForward, Search } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import { categoriesAPI } from '@/lib/api';

const PAGE_SIZE = 20;

// Deterministic colour palette cycled by index so cards stay visually distinct
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

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchCategories = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoriesAPI.getAll({
        page: 1,
        limit: PAGE_SIZE,
        ...(searchTerm ? { search: searchTerm } : {}),
      });
      const payload = res.data;
      const list = payload?.data?.data ?? [];
      const count = payload?.data?.count ?? 0;
      setCategories(list);
      setTotal(count);
    } catch (err) {
      console.error('Categories fetch error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategories('');
  }, [fetchCategories]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchCategories(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchCategories]);

  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)', py: 5, color: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Product Categories</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
            Browse our complete range of food products
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Search bar */}
        <Box sx={{ mb: 4, maxWidth: 400 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Search categories' },
            }}
          />
        </Box>

        {/* Result count */}
        {!loading && !error && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {total} {total === 1 ? 'category' : 'categories'} found
          </Typography>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#16A34A' }} />
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* Empty state */}
        {!loading && !error && categories.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">No categories found.</Typography>
          </Box>
        )}

        {/* Category grid */}
        {!loading && !error && categories.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
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
                    width: '100%', cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.3s',
                    '&:hover': { border: `2px solid ${color}40` },
                  }}
                >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {/* Category image or fallback initial */}
                        <Box
                          sx={{
                            width: 72, height: 72, borderRadius: 3, bgcolor: bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, overflow: 'hidden',
                            boxShadow: `0 4px 14px ${color}25`,
                          }}
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

                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                            {cat.name}
                          </Typography>
                          <Chip
                            label={cat.slug}
                            size="small"
                            sx={{ fontSize: 11, bgcolor: bg, color, fontWeight: 600, border: `1px solid ${color}30`, mt: 0.5 }}
                          />
                        </Box>
                      </Box>

                      {/* Description */}
                      {cat.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.75 }}>
                          {cat.description}
                        </Typography>
                      )}

                      {/* View all link */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color, fontWeight: 700, fontSize: 14 }}>
                        View All <ArrowForward sx={{ fontSize: 16 }} />
                      </Box>
                    </CardContent>
                  </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </MainLayout>
  );
}
