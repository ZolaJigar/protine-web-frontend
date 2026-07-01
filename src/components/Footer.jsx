'use client';

import Link from 'next/link';
import { Box, Container, Typography, Divider, IconButton } from '@mui/material';
import { Facebook, Instagram, YouTube, WhatsApp, Email, Phone, LocationOn } from '@mui/icons-material';

const footerLinks = {
  'Quick Links': [
    { label: 'Home',       href: '/' },
    { label: 'Products',   href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'About Us',   href: '/about' },
    { label: 'Blog',       href: '/blog' },
  ],
  'Customer': [
    { label: 'My Account', href: '/profile' },
    { label: 'My Orders',  href: '/orders' },
    { label: 'Cart',       href: '/cart' },
    { label: 'Invoices',   href: '/invoices' },
    { label: 'Support',    href: '/support' },
  ],
  'Policies': [
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy',    href: '/refund' },
    { label: 'Shipping Policy',  href: '/shipping' },
  ],
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 60%, #1C1917 100%)',
        color: '#FFF8F0',
        pt: 8, pb: 4, mt: 'auto',
        width: '100%',
      }}
    >
      <Container maxWidth="xl">
        {/* ── Main footer grid: brand | 3 link cols | contact ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(5, 1fr)',   // brand + 3 link sections + contact = 5 cols
            },
            gap: { xs: 4, md: 3 },
            width: '100%',
          }}
        >
          {/* Brand col — spans wider on md */}
          <Box
            sx={{
              gridColumn: { xs: '1', sm: '1 / 3', md: '1 / 2' },
            }}
          >
            <Box sx={{ mb: 2.5 }}>
              <Box
                component="img"
                src="/logo_without_bg.png"
                alt="Protine Web"
                sx={{ height: 68, width: 68, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.72)', lineHeight: 1.9, mb: 3 }}>
              Your premium destination for ketchup, mayonnaise, and healthy food products.
              Fresh flavours delivered to your doorstep with care.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <WhatsApp />, href: 'https://wa.me/', label: 'WhatsApp' },
                { icon: <Instagram />, href: '#', label: 'Instagram' },
                { icon: <Facebook />,  href: '#', label: 'Facebook' },
                { icon: <YouTube />,   href: '#', label: 'YouTube' },
              ].map((s) => (
                <IconButton
                  key={s.label}
                  component="a" href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label} size="small"
                  sx={{
                    color: 'rgba(255,248,240,0.75)',
                    border: '1px solid rgba(255,248,240,0.2)',
                    '&:hover': { color: '#F59E0B', borderColor: '#F59E0B', background: 'rgba(245,158,11,0.12)' },
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
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F59E0B', mb: 2 }}>
                {section}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {links.map((link) => (
                  <Box component="li" key={link.href} sx={{ mb: 1 }}>
                    <Link
                      href={link.href}
                      className="footer-link"
                      style={{ color: 'rgba(255,248,240,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
                    >
                      {link.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}

          {/* Contact col */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F59E0B', mb: 2 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { icon: <Phone fontSize="small" />,    text: '+91 99999 88888' },
                { icon: <Email fontSize="small" />,    text: 'hello@protineweb.com' },
                { icon: <LocationOn fontSize="small" />, text: 'Mumbai, Maharashtra, India' },
              ].map((item) => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ color: '#F59E0B', mt: 0.2, flexShrink: 0 }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.7)', fontSize: 13 }}>
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,248,240,0.12)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.5)' }}>
            © {new Date().getFullYear()} Protine Web. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,248,240,0.5)' }}>
            Made with ❤️ for food lovers
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
