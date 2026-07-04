'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Button, Card, CardMedia, CardContent,
  CardActions, IconButton, Chip, Skeleton, Alert, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import {
  Favorite, FavoriteOutlined, ShoppingBag, Delete, ShoppingCart,
  Refresh, DeleteSweep,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { wishlistAPI, variantsAPI } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Number(val) || 0);

// ─── Wishlist Item Card ───────────────────────────────────────────────────────
function WishlistCard({ item, onRemove, onAddToCart }) {
  const [removing,    setRemoving]    = useState(false);
  const [addingCart,  setAddingCart]  = useState(false);

  const storageBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';
  const rawImg      = item.productVariant?.image || item.product?.image;
  const imgUrl      = rawImg
    ? rawImg.startsWith('http') ? rawImg : `${storageBase}/${rawImg}`
    : null;

  const price = item.productVariant ? parseFloat(item.productVariant.selling_price) : null;
  const mrp   = item.productVariant ? parseFloat(item.productVariant.mrp)           : null;
  const hasDisc = price && mrp && mrp > price;
  const discPct = hasDisc ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = item.productVariant ? item.productVariant.quantity > 0 : true;

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(item.id);
    } finally {
      setRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingCart(true);
    try {
      await onAddToCart(item);
    } finally {
      setAddingCart(false);
    }
  };

  return (
    <Card
      sx={{
        display: 'flex', flexDirection: 'column', height: '100%',
        borderRadius: 3, position: 'relative',
        border: '1.5px solid #E2E8F0',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
          transform: 'translateY(-3px)',
        },
      }}
    >
      {/* Discount badge */}
      {hasDisc && (
        <Chip
          label={`${discPct}% OFF`}
          color="error"
          size="small"
          sx={{
            position: 'absolute', top: 10, left: 10, zIndex: 1,
            fontWeight: 700, fontSize: 11,
          }}
        />
      )}

      {/* Remove button */}
      <Tooltip title="Remove from wishlist">
        <IconButton
          size="small"
          onClick={handleRemove}
          disabled={removing}
          aria-label={`Remove ${item.product?.name} from wishlist`}
          sx={{
            position: 'absolute', top: 8, right: 8, zIndex: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            color: '#EF4444',
            '&:hover': { bgcolor: '#FEE2E2' },
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          {removing
            ? <CircularProgress size={16} color="inherit" />
            : <Delete fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Product image */}
      <Link href={`/products/${item.product_id}`} style={{ textDecoration: 'none' }}>
        {imgUrl ? (
          <CardMedia
            component="img"
            height="200"
            image={imgUrl}
            alt={item.product?.name}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
            sx={{
              objectFit: 'cover',
              transition: 'transform 0.4s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
        ) : null}
        <Box
          sx={{
            height: 200,
            display: imgUrl ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #CCEFDB, #E8F5E9)',
            fontSize: 64,
          }}
          role="img" aria-label={item.product?.name}
        >
          🛍️
        </Box>
      </Link>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        {item.product?.category?.name && (
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, textTransform: 'uppercase' }}>
            {item.product.category.name}
          </Typography>
        )}

        <Link href={`/products/${item.product_id}`} style={{ textDecoration: 'none' }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{ mt: 0.5, lineHeight: 1.3, color: 'text.primary', '&:hover': { color: 'primary.main' } }}
          >
            {item.product?.name}
          </Typography>
        </Link>

        {item.productVariant?.name && (
          <Chip
            label={item.productVariant.name}
            size="small"
            sx={{ mt: 0.75, fontSize: 11, bgcolor: '#E2E8F0', color: '#475569', height: 22 }}
          />
        )}

        {/* Price */}
        {price !== null && (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
            <Typography variant="h6" fontWeight={900} sx={{ color: '#1B4332' }}>
              {fmt(price)}
            </Typography>
            {hasDisc && (
              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                {fmt(mrp)}
              </Typography>
            )}
          </Box>
        )}

        {/* Stock status */}
        {item.productVariant && (
          <Chip
            label={inStock ? `${item.productVariant.quantity} in stock` : 'Out of stock'}
            color={inStock ? 'success' : 'error'}
            size="small"
            sx={{ mt: 0.75, fontSize: 11, height: 22 }}
          />
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          disabled={!inStock || addingCart}
          onClick={handleAddToCart}
          startIcon={
            addingCart
              ? <CircularProgress size={14} color="inherit" />
              : <ShoppingCart fontSize="small" />
          }
          sx={{
            borderRadius: '50px', fontWeight: 700,
            textTransform: 'none', fontSize: 13,
            background: inStock
              ? 'linear-gradient(135deg, #1B4332, #2D6A4F)'
              : undefined,
            '&:hover': {
              background: 'linear-gradient(135deg, #0D2B1F, #1B4332)',
            },
            '&.Mui-disabled': { background: '#E2E8F0' },
          }}
        >
          {addingCart ? 'Adding…' : inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function WishlistSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' },
        gap: 3,
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <Box key={i}>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
          <Box sx={{ mt: 1.5, px: 0.5 }}>
            <Skeleton width="40%" height={16} />
            <Skeleton width="75%" height={22} sx={{ mt: 0.5 }} />
            <Skeleton width="30%" height={28} sx={{ mt: 0.75 }} />
            <Skeleton variant="rounded" height={36} sx={{ mt: 1.5, borderRadius: '50px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { addToCart, fetchWishlistCount } = useApp();
  const router = useRouter();

  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [clearing, setClearing] = useState(false);
  const [clearDialog, setClearDialog] = useState(false);

  const fetchWishlist = useCallback(async () => {
    // Guard: only fetch if the user has a valid token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login?redirect=/wishlist');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res  = await wishlistAPI.getList();
      const data = res.data?.data?.data ?? res.data?.data ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        router.replace('/login?redirect=/wishlist');
      } else {
        setError(err?.response?.data?.message || 'Could not load wishlist.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleRemove = async (wishlistItemId) => {
    try {
      await wishlistAPI.removeItem(wishlistItemId);
      setItems((prev) => prev.filter((i) => i.id !== wishlistItemId));
      fetchWishlistCount(); // keep navbar badge in sync
      toast.success('Removed from wishlist.');
    } catch {
      toast.error('Could not remove item. Please try again.');
      throw new Error('remove failed');
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    setClearDialog(false);
    try {
      await wishlistAPI.clear();
      setItems([]);
      fetchWishlistCount();
      toast.success('Wishlist cleared.');
    } catch {
      toast.error('Could not clear wishlist.');
    } finally {
      setClearing(false);
    }
  };

  const handleAddToCart = async (item) => {
    // If the wishlist item has a specific variant, use it directly
    if (item.product_variant_id && item.productVariant) {
      const v = item.productVariant;
      if (!v.quantity || v.quantity === 0) {
        toast.warning('This item is out of stock.');
        return;
      }
      const toastId = toast.loading('Adding to cart…');
      try {
        await addToCart(item.product_id, item.product_variant_id, 1);
        toast.update(toastId, {
          render: `🛒 ${item.product?.name} added to cart!`,
          type: 'success', isLoading: false, autoClose: 2500,
        });
      } catch (err) {
        const msg = err?.response?.data?.message || 'Could not add to cart.';
        toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
      }
      return;
    }

    // No variant on wishlist item — fetch the first available variant
    const toastId = toast.loading('Adding to cart…');
    try {
      const res     = await variantsAPI.getByProduct({ product_id: item.product_id, page: 1, limit: 50 });
      const varList = res.data?.data?.data ?? [];
      const v       = varList.find((x) => x.is_active && x.quantity > 0);
      if (!v) {
        toast.update(toastId, { render: 'No available variants for this product.', type: 'warning', isLoading: false, autoClose: 3000 });
        return;
      }
      await addToCart(item.product_id, v.id, 1);
      toast.update(toastId, {
        render: `🛒 ${item.product?.name} added to cart!`,
        type: 'success', isLoading: false, autoClose: 2500,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not add to cart.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <MainLayout>
      {/* Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          py: 5, color: '#FFF8F0',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Favorite sx={{ fontSize: 36, color: '#F87171' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>My Wishlist</Typography>
                <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
                  {loading ? '…' : `${items.length} saved item${items.length !== 1 ? 's' : ''}`}
                </Typography>
              </Box>
            </Box>

            {!loading && items.length > 0 && (
              <Button
                variant="outlined"
                startIcon={clearing ? <CircularProgress size={16} color="inherit" /> : <DeleteSweep />}
                onClick={() => setClearDialog(true)}
                disabled={clearing}
                sx={{
                  color: '#FFF8F0', borderColor: 'rgba(255,248,240,0.4)',
                  fontWeight: 600, borderRadius: '50px',
                  '&:hover': { borderColor: '#F87171', color: '#F87171', bgcolor: 'rgba(248,113,113,0.08)' },
                }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Error */}
        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" startIcon={<Refresh />} onClick={fetchWishlist}>
                Retry
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && <WishlistSkeleton />}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <FavoriteOutlined sx={{ fontSize: 96, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              Your wishlist is empty
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Save products you love by clicking the heart icon on any product.
            </Typography>
            <Button
              component={Link}
              href="/products"
              variant="contained"
              size="large"
              startIcon={<ShoppingBag />}
              sx={{
                px: 5, py: 1.5, borderRadius: '50px', fontWeight: 700,
                background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' },
              }}
            >
              Browse Products
            </Button>
          </Box>
        )}

        {/* Grid */}
        {!loading && !error && items.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {items.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))}
          </Box>
        )}
      </Container>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={clearDialog} onClose={() => setClearDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Clear Wishlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove all <strong>{items.length}</strong> item{items.length !== 1 ? 's' : ''} from your wishlist? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setClearDialog(false)} disabled={clearing}>Cancel</Button>
          <Button
            variant="contained" color="error"
            onClick={handleClearAll} disabled={clearing}
            startIcon={clearing ? <CircularProgress size={16} color="inherit" /> : <DeleteSweep />}
          >
            {clearing ? 'Clearing…' : 'Clear All'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
