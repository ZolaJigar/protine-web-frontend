'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home, ShoppingBag } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #16A34A, #4ADE80)',
        textAlign: 'center', px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Typography sx={{ fontSize: 120, lineHeight: 1, mb: 2 }} role="img" aria-label="Lost emoji">
          🥺
        </Typography>
        <Typography variant="h1" sx={{ color: 'rgba(255,255,255,0.2)', fontWeight: 900, fontSize: { xs: 80, md: 120 }, lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 2, mb: 1 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 4 }}>
          Oops! Looks like this page went on a flavour journey and got lost.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link} href="/" variant="contained" size="large" startIcon={<Home />}
            sx={{ bgcolor: '#fff', color: '#4ADE80', fontWeight: 700, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            Go Home
          </Button>
          <Button
            component={Link} href="/products" variant="outlined" size="large" startIcon={<ShoppingBag />}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Browse Products
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
