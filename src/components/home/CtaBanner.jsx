'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';
import { WhatsApp, ShoppingCart } from '@mui/icons-material';

export default function CtaBanner() {
  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #D97706 100%)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(28,25,23,0.08)' }} />
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', bgcolor: 'rgba(28,25,23,0.06)' }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#1C1917', mb: 2 }}>
          Ready to Taste the Difference?
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(28,25,23,0.75)', mb: 4, fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          Join 10,000+ happy customers. Order now and get free delivery on your first order above ₹299!
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained" size="large" startIcon={<ShoppingCart />}
              sx={{
                bgcolor: '#1B4332', color: '#FFF8F0', fontWeight: 700, px: 4, py: 1.5,
                '&:hover': { bgcolor: '#0D2B1F' },
                boxShadow: '0 8px 28px rgba(27,67,50,0.35)',
              }}
            >
              Shop Now
            </Button>
          </Link>
          <Button
            component="a"
            href="https://wa.me/?text=Hi!%20I%20want%20to%20order%20from%20Protine%20Web"
            target="_blank" rel="noopener noreferrer"
            variant="outlined" size="large" startIcon={<WhatsApp />}
            sx={{
              color: '#1C1917', borderColor: 'rgba(28,25,23,0.4)', fontWeight: 700, px: 4, py: 1.5,
              '&:hover': { bgcolor: 'rgba(28,25,23,0.08)', borderColor: '#1C1917' },
            }}
          >
            Order on WhatsApp
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
