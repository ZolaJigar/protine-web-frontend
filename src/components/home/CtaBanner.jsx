'use client';

import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';
import { ShoppingCart, WhatsApp, ArrowForward } from '@mui/icons-material';

export default function CtaBanner() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        bgcolor: '#0F0F0F',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glows */}
      <Box sx={{
        position: 'absolute', top: '-20%', right: '5%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(255,87,34,0.15) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-20%', left: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Badge */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.6,
          background: 'rgba(255,87,34,0.12)',
          border: '1px solid rgba(255,87,34,0.25)',
          borderRadius: '100px',
          mb: 3,
        }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5722', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Join 10,000+ Happy Customers
          </Typography>
        </Box>

        <Typography
          variant="h2"
          sx={{
            fontWeight: 900, color: '#FFFFFF', mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
            letterSpacing: '-0.03em',
            maxWidth: 700, mx: 'auto',
          }}
        >
          Ready to Taste the{' '}
          <Box component="span" sx={{ color: '#FF5722' }}>Difference?</Box>
        </Typography>

        <Typography
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: { xs: '1rem', md: '1.1rem' },
            mb: 5, maxWidth: 560, mx: 'auto',
            lineHeight: 1.75,
          }}
        >
          Order now and get free delivery on your first order above ₹299.
          Fresh, natural, and delivered to your door.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
              sx={{ fontWeight: 700, px: 3.5, py: 1.4, fontSize: '0.95rem' }}
            >
              Shop Now
            </Button>
          </Link>
          <Button
            component="a"
            href="https://wa.me/?text=Hi!%20I%20want%20to%20order%20from%20Protine%20Web"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="large"
            startIcon={<WhatsApp sx={{ fontSize: 18 }} />}
            sx={{
              color: 'rgba(255,255,255,0.65)',
              borderColor: 'rgba(255,255,255,0.15)',
              fontWeight: 600,
              px: 3.5, py: 1.4,
              fontSize: '0.95rem',
              borderWidth: '1.5px',
              '&:hover': {
                borderColor: '#22C55E',
                color: '#22C55E',
                background: 'rgba(34,197,94,0.06)',
                borderWidth: '1.5px',
              },
            }}
          >
            Order on WhatsApp
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
