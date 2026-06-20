import Link from 'next/link';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const categories = [
  { id: 1, name: 'Ketchup',         emoji: '🍅', count: 12, color: '#B91C1C', bg: '#FEE2E2', href: '/categories/ketchup' },
  { id: 2, name: 'Mayonnaise',      emoji: '🥣', count: 8,  color: '#D97706', bg: '#FEF3C7', href: '/categories/mayonnaise' },
  { id: 3, name: 'Hot Sauces',      emoji: '🌶️', count: 15, color: '#C2410C', bg: '#FFEDD5', href: '/categories/hot-sauces' },
  { id: 4, name: 'Salad Dressings', emoji: '🥗', count: 10, color: '#1B4332', bg: '#D8F3DC', href: '/categories/salad-dressings' },
  { id: 5, name: 'Spreads',         emoji: '🍞', count: 7,  color: '#78350F', bg: '#FEF3C7', href: '/categories/spreads' },
  { id: 6, name: 'Healthy Snacks',  emoji: '🌱', count: 20, color: '#2D6A4F', bg: '#D8F3DC', href: '/categories/healthy-snacks' },
];

export default function FeaturedCategories() {
  return (
    <Box sx={{ py: 8, bgcolor: '#FFF8F0' }}>
      <Container maxWidth="xl">
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: 2 }}>
            Browse by Category
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1B4332', mt: 1 }}>
            Explore Our Range
          </Typography>
          <Typography variant="body1" sx={{ color: '#57534E', mt: 1, maxWidth: 500, mx: 'auto' }}>
            From classic ketchups to gourmet dressings — find exactly what you need.
          </Typography>
        </Box>

        {/* 6-column CSS grid — fills the full row perfectly */}
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
          {categories.map((cat) => (
            <Link key={cat.id} href={cat.href} style={{ textDecoration: 'none', display: 'flex' }}>
              <Card
                className="card-3d"
                sx={{
                  width: '100%',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.3s',
                  '&:hover': { border: `2px solid ${cat.color}50` },
                }}
              >
                <CardContent
                  sx={{
                    py: 3, px: 1,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 72, height: 72, borderRadius: '50%',
                      bgcolor: cat.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      mb: 1.5, fontSize: 36,
                      boxShadow: `0 4px 16px ${cat.color}25`,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                    role="img"
                    aria-label={cat.name}
                  >
                    {cat.emoji}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1C1917', mb: 0.5 }}>
                    {cat.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: cat.color, fontWeight: 600 }}>
                    {cat.count} Products
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>

        {/* View all link */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Link href="/categories" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                color: '#1B4332', fontWeight: 700, fontSize: 16,
                '&:hover': { color: '#2D6A4F' },
              }}
            >
              View All Categories <ArrowForward fontSize="small" />
            </Box>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
