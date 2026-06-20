'use client';

import Link from 'next/link';
import {
  Box, Container, Typography, Button, Paper, IconButton,
  TextField, Divider,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingBag, ArrowBack, LocalShipping, Security } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency, calculateGST } from '@/lib/functions';

export default function CartPage() {
  const { state, dispatch, cartTotal } = useApp();
  const { cart } = state;

  const gst      = calculateGST(cartTotal);
  const shipping  = cartTotal >= 499 ? 0 : 49;
  const grandTotal = cartTotal + gst + shipping;

  const handleQtyChange = (item, quantity) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: item.id });
      toast.info(`🗑️ ${item.name} removed from cart`, { autoClose: 2000 });
    } else {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { id: item.id, quantity } });
    }
  };

  const handleRemove = (item) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: item.id });
    toast.info(`🗑️ ${item.name} removed from cart`, { autoClose: 2000 });
  };

  const handleClearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.warning('🧹 Cart cleared!', { autoClose: 2500 });
  };

  /* ── Empty state ── */
  if (cart.length === 0) {
    return (
      <MainLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <ShoppingBag sx={{ fontSize: 100, color: 'grey.300', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Your cart is empty</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Looks like you haven't added anything yet.
            </Typography>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button variant="contained" size="large" startIcon={<ShoppingBag />}>
                Start Shopping
              </Button>
            </Link>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* ── Banner ── */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Shopping Cart</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
            {cart.length} item{cart.length > 1 ? 's' : ''} in your cart
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Two-column layout: items | summary ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
            gap: 3,
            alignItems: 'start',
            width: '100%',
          }}
        >
          {/* ── Left: cart items ── */}
          <Box>
            <Link href="/products" style={{ textDecoration: 'none' }}>
              <Button startIcon={<ArrowBack />} sx={{ mb: 2, color: 'text.secondary' }}>
                Continue Shopping
              </Button>
            </Link>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {cart.map((item, index) => (
                <Box key={item.id}>
                  <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    {/* Thumb */}
                    <Box
                      sx={{
                        width: 90, height: 90, borderRadius: 2, bgcolor: '#FFF0DC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 44, flexShrink: 0,
                      }}
                      role="img" aria-label={item.name}
                    >
                      🍅
                    </Box>

                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>
                        {item.category}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.25 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B4332', mt: 0.5 }}>
                        {formatCurrency(item.price)}
                      </Typography>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                      {/* Qty stepper */}
                      <Box
                        sx={{
                          display: 'flex', alignItems: 'center',
                          border: '1.5px solid #E7E5E4', borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleQtyChange(item, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          sx={{ borderRadius: 0, px: 1 }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ px: 1.5, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQtyChange(item, item.quantity + 1)}
                          aria-label="Increase quantity"
                          sx={{ borderRadius: 0, px: 1 }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1B4332' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>

                      <IconButton
                        size="small" color="error"
                        onClick={() => handleRemove(item)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {index < cart.length - 1 && <Divider />}
                </Box>
              ))}

              {/* Clear cart */}
              <Box sx={{ p: 2, bgcolor: '#FFF8F0', display: 'flex', justifyContent: 'flex-end' }}>
                <Button color="error" startIcon={<Delete />} size="small" onClick={handleClearCart}>
                  Clear Cart
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* ── Right: order summary ── */}
          <Paper sx={{ p: 3, borderRadius: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Order Summary</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={600}>{formatCurrency(cartTotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">GST (18%)</Typography>
                <Typography fontWeight={600}>{formatCurrency(gst)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography fontWeight={600} color={shipping === 0 ? 'success.main' : 'text.primary'}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </Typography>
              </Box>
              {shipping > 0 && (
                <Box sx={{ bgcolor: '#D8F3DC', borderRadius: 2, px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShipping fontSize="small" sx={{ color: '#1B4332' }} />
                  <Typography variant="caption" sx={{ color: '#1B4332', fontWeight: 600 }}>
                    Add {formatCurrency(499 - cartTotal)} more for FREE shipping!
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.dark">
                {formatCurrency(grandTotal)}
              </Typography>
            </Box>

            <Link href="/checkout" style={{ textDecoration: 'none' }}>
              <Button
                fullWidth variant="contained" size="large"
                sx={{
                  py: 1.5, fontWeight: 700, mb: 2,
                  background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                  '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' },
                }}
              >
                Proceed to Checkout
              </Button>
            </Link>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { icon: <LocalShipping fontSize="small" />, text: 'Free shipping above ₹499' },
                { icon: <Security fontSize="small" />,      text: 'Secure checkout' },
              ].map((item) => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: '#1B4332' }}>{item.icon}</Box>
                  <Typography variant="caption" color="text.secondary">{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Container>
    </MainLayout>
  );
}
