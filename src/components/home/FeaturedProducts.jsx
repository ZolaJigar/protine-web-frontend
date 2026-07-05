'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Button,
  CircularProgress, Alert,
} from '@mui/material';
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
        // Response shape: { data: { count, data: [...] } }
        const list = res.data?.data?.data ?? res.data?.data ?? [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error('FeaturedProducts fetch error:', err);
        setError(err?.response?.data?.message || 'Failed to load featured products.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ py: 8, bgcolor: '#FFF0DC' }}>
      <Container maxWidth="xl">
        {/* Header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#FF6B35', fontWeight: 700, letterSpacing: 2 }}>
              Top Picks
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#16A34A', mt: 0.5 }}>
              Featured Products
            </Typography>
          </Box>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button endIcon={<ArrowForward />} variant="outlined" color="primary">
              View All Products
            </Button>
          </Link>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#16A34A' }} />
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error">{error}</Alert>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No featured products available.</Typography>
          </Box>
        )}

        {/* 4-column CSS grid */}
        {!loading && !error && products.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
              width: '100%',
            }}
          >
            {products.map((product) => (
              <Box key={product.id} sx={{ display: 'flex' }}>
                <ProductCard product={product} />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
