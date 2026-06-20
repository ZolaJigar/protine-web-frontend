import Link from 'next/link';
import {
  Box, Container, Typography, Card, CardContent, Chip,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';

const categories = [
  {
    id: 1, name: 'Ketchup',         emoji: '🍅', productCount: 12, color: '#B91C1C', bg: '#FEE2E2',
    description: 'Classic and gourmet ketchups made from fresh tomatoes.',
    subCategories: ['Tomato Ketchup', 'Spicy Ketchup', 'Organic Ketchup'],
    href: '/categories/ketchup',
  },
  {
    id: 2, name: 'Mayonnaise',       emoji: '🥣', productCount: 8,  color: '#D97706', bg: '#FEF3C7',
    description: 'Creamy, eggless, and flavoured mayo varieties.',
    subCategories: ['Classic Mayo', 'Garlic Mayo', 'Eggless Mayo'],
    href: '/categories/mayonnaise',
  },
  {
    id: 3, name: 'Hot Sauces',       emoji: '🌶️', productCount: 15, color: '#C2410C', bg: '#FFEDD5',
    description: 'From mild to extra hot — find your perfect heat level.',
    subCategories: ['Chilli Sauce', 'Habanero Sauce', 'Sriracha', 'BBQ Sauce'],
    href: '/categories/hot-sauces',
  },
  {
    id: 4, name: 'Salad Dressings',  emoji: '🥗', productCount: 10, color: '#1B4332', bg: '#D8F3DC',
    description: 'Fresh and healthy dressings for every salad.',
    subCategories: ['Italian Dressing', 'Honey Mustard', 'Caesar Dressing'],
    href: '/categories/salad-dressings',
  },
  {
    id: 5, name: 'Spreads',          emoji: '🍞', productCount: 7,  color: '#78350F', bg: '#FEF3C7',
    description: 'Delicious spreads for bread, toast, and snacks.',
    subCategories: ['Cheese Spread', 'Mint Chutney', 'Nut Butter'],
    href: '/categories/spreads',
  },
  {
    id: 6, name: 'Healthy Snacks',   emoji: '🌱', productCount: 20, color: '#2D6A4F', bg: '#D8F3DC',
    description: 'Nutritious snacks for a healthy lifestyle.',
    subCategories: ['Protein Bars', 'Roasted Nuts', 'Dried Fruits'],
    href: '/categories/healthy-snacks',
  },
];

export default function CategoriesPage() {
  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Product Categories</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
            Browse our complete range of food products
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* 3-col CSS grid — full width */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            width: '100%',
          }}
        >
          {categories.map((cat) => (
            <Link key={cat.id} href={cat.href} style={{ textDecoration: 'none', display: 'flex' }}>
              <Card
                className="card-3d"
                sx={{
                  width: '100%', cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.3s',
                  '&:hover': { border: `2px solid ${cat.color}40` },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 72, height: 72, borderRadius: 3, bgcolor: cat.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 40, flexShrink: 0,
                        boxShadow: `0 4px 14px ${cat.color}25`,
                      }}
                      role="img" aria-label={cat.name}
                    >
                      {cat.emoji}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1917' }}>
                        {cat.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: cat.color, fontWeight: 600 }}>
                        {cat.productCount} Products
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.75 }}>
                    {cat.description}
                  </Typography>

                  {/* Sub-category chips */}
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                    {cat.subCategories.map((sub) => (
                      <Chip
                        key={sub} label={sub} size="small"
                        sx={{ fontSize: 11, bgcolor: cat.bg, color: cat.color, fontWeight: 600, border: `1px solid ${cat.color}30` }}
                      />
                    ))}
                  </Box>

                  {/* View all link */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: cat.color, fontWeight: 700, fontSize: 14 }}>
                    View All <ArrowForward sx={{ fontSize: 16 }} />
                  </Box>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>
      </Container>
    </MainLayout>
  );
}
