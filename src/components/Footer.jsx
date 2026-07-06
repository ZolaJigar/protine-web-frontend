'use client';

import Link from 'next/link';
import { Box, Container, Typography, Divider, IconButton } from '@mui/material';
import { Facebook, Instagram, YouTube, WhatsApp, Email, Phone, LocationOn, ArrowForward } from '@mui/icons-material';

const footerLinks = {
  'Explore': [
    { label: 'Home',       href: '/' },
    { label: 'Products',   href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Support',    href: '/support' },
  ],
  'Account': [
    { label: 'My Account', href: '/profile' },
    { label: 'My Orders',  href: '/orders' },
    { label: 'Cart',       href: '/cart' },
    { label: 'Wishlist',   href: '/wishlist' },
  ],
  'Legal': [
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy',    href: '/refund' },
    { label: 'Shipping Policy',  href: '/shipping' },
  ],
};

const socials = [
  { icon: <WhatsApp sx={{ fontSize: 18 }} />, href: 'https://wa.me/', label: 'WhatsApp' },
  { icon: <Instagram sx={{ fontSize: 18 }} />, href: '#', label: 'Instagram' },
  { icon: <Facebook sx={{ fontSize: 18 }} />,  href: '#', label: 'Facebook' },
  { icon: <YouTube sx={{ fontSize: 18 }} />,   href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: '#0F0F0F',
        color: '#FFFFFF',
        pt: { xs: 6, md: 10 },
        pb: 4,
        mt: 'auto',
        width: '100%',
      }}
    >
      <Container maxWidth="xl">
        {/* Main grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1fr 1fr',
            },
            gap: { xs: 5, md: 6 },
          }}
        >
          {/* Brand */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                component="img"
                src="/logo_without_bg.png"
                alt="Protine Web"
                sx={{ height: 44, width: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
              <Typography sx={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>
                Protine<Box component="span" sx={{ color: '#FF5722' }}>.</Box>
              </Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.75, mb: 4, maxWidth: 320 }}>
              Your premium destination for ketchup, mayonnaise, and healthy food products.
              Fresh flavours, fast delivery.
            </Typography>

            {/* Socials */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {socials.map((s) => (
                <IconButton
                  key={s.label}
                  component="a"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  size="small"
                  sx={{
                    width: 36, height: 36,
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    '&:hover': {
                      color: '#FF5722',
                      borderColor: '#FF5722',
                      background: 'rgba(255,87,34,0.1)',
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.icon}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <Box key={section}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.35)',
                  mb: 2.5,
                }}
              >
                {section}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {links.map((link) => (
                  <Box component="li" key={link.href}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      style={{
                        color: 'rgba(255,255,255,0.55)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 400,
                      }}
                    >
                      {link.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Contact strip */}
        <Box
          sx={{
            mt: { xs: 5, md: 8 },
            p: 3,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 2.5, md: 5 },
            alignItems: 'center',
          }}
        >
          {[
            { icon: <Phone sx={{ fontSize: 16 }} />, text: '+91 99999 88888' },
            { icon: <Email sx={{ fontSize: 16 }} />, text: 'hello@protineweb.com' },
            { icon: <LocationOn sx={{ fontSize: 16 }} />, text: 'Mumbai, Maharashtra, India' },
          ].map((item) => (
            <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: '#FF5722' }}>{item.icon}</Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.825rem' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.07)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} Protine Web. All rights reserved.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>
            Made with ❤️ for food lovers
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
