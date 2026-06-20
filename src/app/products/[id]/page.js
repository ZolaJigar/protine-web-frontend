'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Container, Grid, Typography, Button, Rating, Chip, Divider,
  TextField, Tabs, Tab, Paper, Avatar,
} from '@mui/material';
import {
  ShoppingCart, Favorite, FavoriteBorder, Share, LocalShipping, Security,
  Add, Remove,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency, calculateDiscount } from '@/lib/functions';

// Simulated product data
const getProduct = (id) => ({
  id: parseInt(id),
  name: 'Classic Tomato Ketchup',
  category: 'Ketchup',
  price: 149,
  discountPercent: 10,
  rating: 4.8,
  reviewCount: 234,
  stock: 50,
  description: 'Our Classic Tomato Ketchup is made from the freshest sun-ripened tomatoes, blended with natural spices and a hint of sweetness. No artificial preservatives, no added colours — just pure tomato goodness in every squeeze.',
  ingredients: 'Tomatoes (80%), Sugar, Vinegar, Salt, Spices (Black Pepper, Cloves, Cinnamon), Onion.',
  nutritionPer100g: { calories: 98, protein: '1.2g', carbs: '24g', fat: '0.1g', sodium: '890mg' },
  reviews: [
    { id: 1, name: 'Priya S.', rating: 5, comment: 'Best ketchup I\'ve ever had! Tastes completely natural.', date: '2026-06-10' },
    { id: 2, name: 'Raj M.', rating: 5, comment: 'My kids love it. No compromise on taste!', date: '2026-06-08' },
    { id: 3, name: 'Anita K.', rating: 4, comment: 'Great product, natural flavour. Would love a bigger bottle size.', date: '2026-06-05' },
  ],
});

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = getProduct(id);
  const { state, dispatch } = useApp();
  const [qty, setQty] = useState(1);
  const [tabValue, setTabValue] = useState('description');
  const isWishlisted = state.wishlist.some((i) => i.id === product.id);

  const discountedPrice = calculateDiscount(product.price, product.discountPercent);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: 'ADD_TO_CART', payload: { ...product, price: discountedPrice } });
    }
    toast.success(`🛒 ${qty} × ${product.name} added to cart!`, { autoClose: 2500 });
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                borderRadius: 4, overflow: 'hidden', position: 'sticky', top: 80,
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              }}
            >
              <Box
                sx={{
                  height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #FFEBEE, #E8F5E9)',
                  fontSize: 120,
                }}
                role="img"
                aria-label={product.name}
              >
                🍅
              </Box>
            </Paper>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={7}>
            <Chip label={product.category} size="small" color="primary" sx={{ mb: 1.5, fontWeight: 600 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{product.name}</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.rating} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                {product.rating} ({product.reviewCount} reviews)
              </Typography>
              {product.stock > 0 ? (
                <Chip label="In Stock" color="success" size="small" />
              ) : (
                <Chip label="Out of Stock" color="error" size="small" />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark' }}>
                {formatCurrency(discountedPrice)}
              </Typography>
              {product.discountPercent > 0 && (
                <>
                  <Typography variant="h6" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                    {formatCurrency(product.price)}
                  </Typography>
                  <Chip label={`${product.discountPercent}% OFF`} color="error" size="small" sx={{ fontWeight: 700 }} />
                </>
              )}
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
              {product.description}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Quantity + Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '2px solid', borderColor: 'primary.main', borderRadius: '50px', overflow: 'hidden' }}>
                <Button onClick={() => setQty(Math.max(1, qty - 1))} sx={{ minWidth: 44, borderRadius: 0 }} aria-label="Decrease quantity">
                  <Remove />
                </Button>
                <Typography sx={{ px: 2, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{qty}</Typography>
                <Button onClick={() => setQty(qty + 1)} sx={{ minWidth: 44, borderRadius: 0 }} aria-label="Increase quantity">
                  <Add />
                </Button>
              </Box>

              <Button
                variant="contained" size="large" startIcon={<ShoppingCart />}
                onClick={handleAddToCart} disabled={product.stock === 0}
                sx={{ flex: 1, background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', py: 1.5 }}
              >
                Add to Cart
              </Button>

              <Button
                variant="outlined" size="large"
                onClick={() => {
                  const adding = !isWishlisted;
                  dispatch({ type: 'TOGGLE_WISHLIST', payload: product });
                  if (adding) toast.success(`❤️ Added to wishlist!`, { autoClose: 2000 });
                  else toast.info(`💔 Removed from wishlist`, { autoClose: 2000 });
                }}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                sx={{ minWidth: 52 }}
              >
                {isWishlisted ? <Favorite color="error" /> : <FavoriteBorder />}
              </Button>
            </Box>

            {/* Trust points */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', p: 2.5, bgcolor: 'grey.50', borderRadius: 3 }}>
              {[
                { icon: <LocalShipping fontSize="small" />, text: 'Free delivery above ₹499' },
                { icon: <Security fontSize="small" />, text: 'Secure checkout' },
              ].map((item) => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Tabs: Description, Nutrition, Reviews */}
        <Box sx={{ mt: 6 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab value="description" label="Description" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab value="nutrition" label="Nutrition Info" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab value="reviews" label={`Reviews (${product.reviews.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          {tabValue === 'description' && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.9, mb: 2 }}>{product.description}</Typography>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Ingredients:</Typography>
              <Typography variant="body2" color="text.secondary">{product.ingredients}</Typography>
            </Paper>
          )}

          {tabValue === 'nutrition' && (
            <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 400 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Nutrition (per 100g)</Typography>
              {Object.entries(product.nutritionPer100g).map(([key, val]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{key}</Typography>
                  <Typography variant="body2" fontWeight={600}>{val}</Typography>
                </Box>
              ))}
            </Paper>
          )}

          {tabValue === 'reviews' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {product.reviews.map((review) => (
                <Paper key={review.id} sx={{ p: 3, borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                      {review.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700} variant="subtitle2">{review.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{review.date}</Typography>
                    </Box>
                    <Rating value={review.rating} size="small" readOnly sx={{ ml: 'auto' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "{review.comment}"
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
