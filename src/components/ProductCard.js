'use client';

import Link from 'next/link';
import {
  Card, CardMedia, CardContent, CardActions, Typography, IconButton,
  Button, Box, Chip, Rating, Tooltip,
} from '@mui/material';
import { FavoriteBorder, Favorite, ShoppingCart, Visibility } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { formatCurrency, calculateDiscount } from '@/lib/functions';

export default function ProductCard({ product }) {
  const { state, dispatch } = useApp();
  const isWishlisted = state.wishlist.some((i) => i.id === product.id);

  const discountedPrice = product.discountPercent
    ? calculateDiscount(product.price, product.discountPercent)
    : product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, price: discountedPrice } });
    toast.success(`🛒 ${product.name} added to cart!`, {
      autoClose: 2000,
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    const adding = !isWishlisted;
    dispatch({ type: 'TOGGLE_WISHLIST', payload: product });
    if (adding) {
      toast.success(`❤️ ${product.name} added to wishlist!`, { autoClose: 2000 });
    } else {
      toast.info(`💔 ${product.name} removed from wishlist`, { autoClose: 2000 });
    }
  };

  return (
    <Card
      className="card-3d"
      sx={{
        width: '100%',
        height: '100%', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'visible',
      }}
    >
      {/* Discount badge */}
      {product.discountPercent > 0 && (
        <Chip
          label={`${product.discountPercent}% OFF`}
          size="small"
          sx={{
            position: 'absolute', top: 12, left: 12, zIndex: 1,
            bgcolor: '#E65100', color: '#fff', fontWeight: 700, fontSize: 11,
          }}
        />
      )}

      {/* Wishlist */}
      <Tooltip title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
        <IconButton
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          sx={{
            position: 'absolute', top: 8, right: 8, zIndex: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: '#fff' },
          }}
          size="small"
        >
          {isWishlisted
            ? <Favorite fontSize="small" sx={{ color: '#E65100' }} />
            : <FavoriteBorder fontSize="small" sx={{ color: 'text.secondary' }} />
          }
        </IconButton>
      </Tooltip>

      {/* Image */}
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.image || `https://placehold.co/400x200/2E7D32/FFFFFF?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            sx={{ objectFit: 'cover', transition: 'transform 0.4s ease', '&:hover': { transform: 'scale(1.06)' } }}
          />
          <Box
            sx={{
              position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'all 0.3s',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.2)', opacity: 1 },
            }}
          >
            <Button
              startIcon={<Visibility />}
              variant="contained"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.95)', color: 'primary.main', '&:hover': { bgcolor: '#fff' } }}
            >
              Quick View
            </Button>
          </Box>
        </Box>
      </Link>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, textTransform: 'uppercase' }}>
          {product.category}
        </Typography>
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700, color: 'text.primary', mt: 0.5, lineHeight: 1.3,
              '&:hover': { color: 'primary.main' },
            }}
          >
            {product.name}
          </Typography>
        </Link>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Rating value={product.rating || 4} size="small" readOnly precision={0.5} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ({product.reviewCount || 0})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
            {formatCurrency(discountedPrice)}
          </Typography>
          {product.discountPercent > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
              {formatCurrency(product.price)}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          sx={{
            background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
            '&:hover': { background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' },
          }}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
}
