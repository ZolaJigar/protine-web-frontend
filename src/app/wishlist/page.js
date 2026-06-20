'use client';

import Link from 'next/link';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import { Favorite, ShoppingBag } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import ProductCard from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';

export default function WishlistPage() {
  const { state } = useApp();
  const { wishlist } = state;

  return (
    <MainLayout>
      <Box sx={{ bgcolor: 'primary.dark', py: 5, color: '#fff' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Favorite sx={{ fontSize: 40, color: '#FF8F00' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>My Wishlist</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
                {wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {wishlist.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Favorite sx={{ fontSize: 100, color: 'grey.200', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Your wishlist is empty</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Save products you love by clicking the heart icon.
            </Typography>
            <Button component={Link} href="/products" variant="contained" size="large" startIcon={<ShoppingBag />}>
              Browse Products
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {wishlist.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
}
