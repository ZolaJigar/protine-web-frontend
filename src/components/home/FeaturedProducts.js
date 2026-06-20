import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import ProductCard from '@/components/ProductCard';

const sampleProducts = [
  { id: 1, name: 'Classic Tomato Ketchup',   category: 'Ketchup',          price: 149, discountPercent: 10, rating: 4.8, reviewCount: 234, stock: 50, image: '' },
  { id: 2, name: 'Garlic Mayonnaise',         category: 'Mayonnaise',        price: 199, discountPercent: 0,  rating: 4.6, reviewCount: 189, stock: 30, image: '' },
  { id: 3, name: 'Spicy Chilli Sauce',        category: 'Hot Sauces',        price: 129, discountPercent: 15, rating: 4.7, reviewCount: 312, stock: 45, image: '' },
  { id: 4, name: 'Honey Mustard Dressing',    category: 'Salad Dressings',   price: 179, discountPercent: 5,  rating: 4.5, reviewCount: 98,  stock: 25, image: '' },
  { id: 5, name: 'Smoky BBQ Sauce',           category: 'Hot Sauces',        price: 159, discountPercent: 20, rating: 4.9, reviewCount: 445, stock: 60, image: '' },
  { id: 6, name: 'Eggless Mayo',              category: 'Mayonnaise',        price: 219, discountPercent: 0,  rating: 4.4, reviewCount: 167, stock: 20, image: '' },
  { id: 7, name: 'Italian Herb Dressing',     category: 'Salad Dressings',   price: 189, discountPercent: 10, rating: 4.6, reviewCount: 203, stock: 35, image: '' },
  { id: 8, name: 'Mango Habanero Sauce',      category: 'Hot Sauces',        price: 169, discountPercent: 0,  rating: 4.3, reviewCount: 78,  stock: 15, image: '' },
];

export default function FeaturedProducts() {
  return (
    <Box sx={{ py: 8, bgcolor: '#FFF0DC' }}>
      <Container maxWidth="xl">
        {/* Header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: 2 }}>
              Top Picks
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1B4332', mt: 0.5 }}>
              Featured Products
            </Typography>
          </Box>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <Button endIcon={<ArrowForward />} variant="outlined" color="primary">
              View All Products
            </Button>
          </Link>
        </Box>

        {/* 4-column CSS grid */}
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
          {sampleProducts.map((product) => (
            <Box key={product.id} sx={{ display: 'flex' }}>
              <ProductCard product={product} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
