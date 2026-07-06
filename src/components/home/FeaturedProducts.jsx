'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    productsAPI
      .getAll({ page: 1, limit: 8 })
      .then((res) => {
        const list = res.data?.data?.data ?? res.data?.data ?? [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: { xs: 4, md: 6 }, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box className="section-eyebrow">Top Picks</Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F0F0F', mt: 0.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Featured Products
            </Typography>
            <Box className="divider-accent" sx={{ mt: 1.5 }} />
          </Box>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button
              endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.875rem' }}
            >
              View All
            </Button>
          </Link>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} sx={{ color: '#FF5722' }} />
          </Box>
        )}

        {!loading && error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {!loading && !error && products.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No products available.</Typography>
          </Box>
        )}

        {!loading && !error && products.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' },
              gap: 2.5,
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
