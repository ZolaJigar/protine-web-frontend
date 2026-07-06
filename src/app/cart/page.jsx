'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Button, IconButton, Divider, Paper,
  Skeleton, Alert, Chip, CircularProgress,
} from '@mui/material';
import {
  Add, Remove, Delete, ShoppingCartOutlined, ArrowForward,
  DeleteSweep, Refresh,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';

// ΓöÇΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const fmt = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(val) || 0);

// ΓöÇΓöÇΓöÇ Cart Item Row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function CartItem({ item, onUpdate, onRemove }) {
  const [qty, setQty]           = useState(item.quantity);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Keep local qty in sync when parent re-renders (e.g. after a refetch)
  useEffect(() => { setQty(item.quantity); }, [item.quantity]);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1) return;
    setQty(newQty);
    setUpdating(true);
    try {
      await onUpdate(item.id, newQty);
    } catch {
      setQty(item.quantity); // revert on failure
      toast.error('Could not update quantity. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(item.id);
      toast.success('Item removed from cart.');
    } catch {
      setRemoving(false);
      toast.error('Could not remove item. Please try again.');
    }
  };

  const storageBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';
  const rawImg      = item.productVariant?.image || item.product?.image;
  const imgUrl      = rawImg
    ? rawImg.startsWith('http') ? rawImg : `${storageBase}/${rawImg}`
    : null;

  return (
    <Box
      sx={{
        display: 'flex', gap: 2, py: 2.5,
        opacity: removing ? 0.4 : 1,
        transition: 'opacity 0.2s',
        position: 'relative',
      }}
    >
      {/* Product image */}
      <Box
        sx={{
          width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 },
          flexShrink: 0, borderRadius: 2, overflow: 'hidden',
          bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {imgUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgUrl}
            alt={item.product?.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <Typography sx={{ fontSize: 36 }} role="img" aria-label={item.product?.name}>≡ƒ¢ì∩╕Å</Typography>
        )}
      </Box>

      {/* Details */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component={Link}
          href={`/products/${item.product_id}`}
          variant="subtitle1"
          sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' }, display: 'block' }}
          noWrap
        >
          {item.product?.name}
        </Typography>

        {item.productVariant?.name && (
          <Chip
            label={item.productVariant.name}
            size="small"
            sx={{ mt: 0.5, fontSize: 11, bgcolor: '#E2E8F0', color: '#475569', height: 22 }}
          />
        )}

        {item.productVariant?.sku && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            SKU: {item.productVariant.sku}
          </Typography>
        )}

        {/* Pricing row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FF5722' }}>
            {fmt(item.unit_price)}
          </Typography>
          {item.productVariant?.mrp && Number(item.productVariant.mrp) > Number(item.unit_price) && (
            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              {fmt(item.productVariant.mrp)}
            </Typography>
          )}
        </Box>

        {/* Qty controls + remove */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex', alignItems: 'center',
              border: '1.5px solid #E2E8F0', borderRadius: '50px',
              overflow: 'hidden',
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleQtyChange(qty - 1)}
              disabled={updating || qty <= 1}
              aria-label="Decrease quantity"
              sx={{ borderRadius: 0, px: 1 }}
            >
              <Remove fontSize="small" />
            </IconButton>

            <Box sx={{ minWidth: 32, textAlign: 'center', position: 'relative' }}>
              {updating ? (
                <CircularProgress size={16} sx={{ display: 'block', mx: 'auto' }} />
              ) : (
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{qty}</Typography>
              )}
            </Box>

            <IconButton
              size="small"
              onClick={() => handleQtyChange(qty + 1)}
              disabled={updating}
              aria-label="Increase quantity"
              sx={{ borderRadius: 0, px: 1 }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Box>

          <IconButton
            size="small"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Remove ${item.product?.name} from cart`}
            sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
          >
            {removing ? <CircularProgress size={18} color="inherit" /> : <Delete fontSize="small" />}
          </IconButton>

          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FF5722', ml: 'auto' }}>
            {fmt(item.total_price)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Loading skeleton ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function CartSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, py: 2 }}>
          <Skeleton variant="rounded" width={100} height={100} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="30%" height={20} sx={{ mt: 0.5 }} />
            <Skeleton width="20%" height={28} sx={{ mt: 1 }} />
            <Skeleton width="140px" height={36} sx={{ mt: 1.5, borderRadius: '50px' }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Empty cart ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function EmptyCart() {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <ShoppingCartOutlined sx={{ fontSize: 96, color: '#CBD5E1', mb: 2 }} />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Your cart is empty</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Looks like you haven&apos;t added anything yet.
      </Typography>
      <Button
        variant="contained"
        component={Link}
        href="/products"
        size="large"
        endIcon={<ArrowForward />}
        sx={{
          px: 5, py: 1.5, fontWeight: 700,
        }}
      >
        Browse Products
      </Button>
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Main page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function CartPage() {
  const { state, fetchCart, updateCartItem, removeFromCart, clearCart } =
    useApp();

  const [loading, setLoading]   = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError]       = useState(null);

  // Summary from context (kept in sync by all cart mutations)
  const summary = state.cartSummary;
  const items   = state.cartItems;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCart()
      .catch(() => { if (!cancelled) setError('Could not load cart. Please try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearCart = async () => {
    if (!confirm('Clear your entire cart?')) return;
    setClearing(true);
    try {
      await clearCart();
      toast.success('Cart cleared.');
    } catch {
      toast.error('Could not clear cart.');
    } finally {
      setClearing(false);
    }
  };

  const hasItems = items.length > 0;

  return (
    <MainLayout>
      {/* Banner */}
      <Box className="page-banner" sx={{ py: { xs: 4, md: 5 } }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCartOutlined sx={{ fontSize: 28, color: '#FF5722' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              My Cart
            </Typography>
            {!loading && hasItems && (
              <Chip
                label={`${summary.total_items} ${summary.total_items === 1 ? 'item' : 'items'}`}
                size="small"
                sx={{ bgcolor: '#FF5722', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }}
              />
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert
            severity="error"
            action={
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={() => { setError(null); setLoading(true); fetchCart().finally(() => setLoading(false)); }}
              >
                Retry
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <CartSkeleton />
        ) : !hasItems ? (
          <EmptyCart />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* ΓöÇΓöÇ Left: items list ΓöÇΓöÇ */}
            <Paper sx={{ borderRadius: 3, p: { xs: 2, sm: 3 } }}>
              {/* List header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={700}>Cart Items</Typography>
                <Button
                  size="small"
                  startIcon={clearing ? <CircularProgress size={14} color="inherit" /> : <DeleteSweep />}
                  onClick={handleClearCart}
                  disabled={clearing}
                  sx={{ color: '#EF4444', fontWeight: 600, '&:hover': { bgcolor: '#FEE2E2' } }}
                >
                  Clear All
                </Button>
              </Box>

              <Divider />

              {/* Items */}
              <Box>
                {items.map((item, idx) => (
                  <Box key={item.id}>
                    <CartItem
                      item={item}
                      onUpdate={updateCartItem}
                      onRemove={removeFromCart}
                    />
                    {idx < items.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* ΓöÇΓöÇ Right: order summary ΓöÇΓöÇ */}
            <Paper
              sx={{
                borderRadius: 3,
                p: 3,
                position: { lg: 'sticky' },
                top: { lg: 88 },
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                Order Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">
                    Subtotal ({summary.total_items} {summary.total_items === 1 ? 'item' : 'items'})
                  </Typography>
                  <Typography fontWeight={600}>{fmt(summary.subtotal_amount)}</Typography>
                </Box>

                {Number(summary.discount_amount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Discount</Typography>
                    <Typography fontWeight={600} color="success.main">
                      ΓêÆ {fmt(summary.discount_amount)}
                    </Typography>
                  </Box>
                )}

                {Number(summary.tax_amount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Tax</Typography>
                    <Typography fontWeight={600}>{fmt(summary.tax_amount)}</Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Shipping</Typography>
                  <Typography fontWeight={600} color={Number(summary.shipping_amount) === 0 ? 'success.main' : 'text.primary'}>
                    {Number(summary.shipping_amount) === 0 ? 'FREE' : fmt(summary.shipping_amount)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={900} sx={{ color: '#FF5722' }}>
                  {fmt(summary.grand_total)}
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/checkout"
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
                  boxShadow: 'none',
                }}
              >
                Proceed to Checkout
              </Button>

              <Button
                component={Link}
                href="/products"
                variant="text"
                fullWidth
                sx={{ mt: 1.5, color: '#4B5563', fontWeight: 600, textTransform: 'none' }}
              >
                ΓåÉ Continue Shopping
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </MainLayout>
  );
}