'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Container, Typography, Button, Rating, Chip, Divider,
  Tabs, Tab, Paper, Avatar, CircularProgress, Alert, Grid,
  Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import {
  ShoppingCart, Favorite, FavoriteBorder, LocalShipping, Security,
  Add, Remove, Inventory2,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/functions';
import { productsAPI, variantsAPI } from '@/lib/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useApp();

  const [product,         setProduct]         = useState(null);
  const [variants,        setVariants]        = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty,             setQty]             = useState(1);
  const [tabValue,        setTabValue]        = useState('description');
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  const isWishlisted = state.wishlist.some((i) => i.id === Number(id));

  // ── Fetch product + variants in parallel ──────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      productsAPI.getById(id),
      variantsAPI.getByProduct({ product_id: Number(id), page: 1, limit: 50 }),
    ])
      .then(([prodRes, varRes]) => {
        const prod     = prodRes.data?.data ?? prodRes.data;
        const varList  = varRes.data?.data?.data ?? [];
        setProduct(prod);
        setVariants(varList);
        if (varList.length > 0) setSelectedVariant(varList[0]);
      })
      .catch((err) => {
        console.error('Product detail fetch error:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load product.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#1B4332' }} />
        </Box>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Alert severity="error">{error || 'Product not found.'}</Alert>
        </Container>
      </MainLayout>
    );
  }

  // Derive display values from selected variant (or product fallback)
  const displayImage    = selectedVariant?.image || product.images?.[0]?.image || null;
  const displayMrp      = selectedVariant ? parseFloat(selectedVariant.mrp) : null;
  const displayPrice    = selectedVariant ? parseFloat(selectedVariant.selling_price) : null;
  const displayStock    = selectedVariant?.quantity ?? 0;
  const displaySku      = selectedVariant?.sku ?? '—';
  const displayWeight   = selectedVariant ? `${selectedVariant.weight} ${selectedVariant.weight_unit}` : null;
  const hasDiscount     = displayMrp && displayPrice && displayPrice < displayMrp;
  const discountPct     = hasDiscount ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0;
  const categoryName    = product.category?.name ?? '';

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.warning('Please select a variant first.');
      return;
    }
    const cartItem = {
      id:       `${product.id}-${selectedVariant.id}`,
      name:     `${product.name} — ${selectedVariant.name}`,
      price:    displayPrice,
      image:    displayImage,
      sku:      displaySku,
    };
    for (let i = 0; i < qty; i++) {
      dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    }
    toast.success(`🛒 ${qty} × ${selectedVariant.name} added to cart!`, { autoClose: 2500 });
  };

  const handleWishlist = () => {
    const adding = !isWishlisted;
    dispatch({ type: 'TOGGLE_WISHLIST', payload: { id: Number(id), name: product.name, image: displayImage } });
    if (adding) toast.success('❤️ Added to wishlist!', { autoClose: 2000 });
    else         toast.info('💔 Removed from wishlist', { autoClose: 2000 });
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Grid container spacing={4}>

          {/* ── Left: image ── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              sx={{
                borderRadius: 4, overflow: 'hidden',
                position: 'sticky', top: 88,
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
              }}
            >
              {displayImage ? (
                <Box
                  component="img"
                  src={displayImage}
                  alt={product.name}
                  sx={{ width: '100%', height: 400, objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #D8F3DC, #B7E4C7)',
                    fontSize: 100,
                  }}
                  role="img" aria-label={product.name}
                >
                  🛍️
                </Box>
              )}
            </Paper>
          </Grid>

          {/* ── Right: details ── */}
          <Grid size={{ xs: 12, md: 7 }}>
            {categoryName && (
              <Chip label={categoryName} size="small" color="primary" sx={{ mb: 1.5, fontWeight: 600 }} />
            )}

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{product.name}</Typography>

            {product.short_description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                {product.short_description}
              </Typography>
            )}

            {/* Stock status */}
            <Box sx={{ mb: 2 }}>
              {selectedVariant ? (
                displayStock > 0
                  ? <Chip icon={<Inventory2 fontSize="small" />} label={`${displayStock} in stock`} color="success" size="small" />
                  : <Chip label="Out of Stock" color="error" size="small" />
              ) : (
                <Chip label="Select a variant" color="warning" size="small" />
              )}
            </Box>

            {/* Price */}
            {displayPrice !== null && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.dark' }}>
                  {formatCurrency(displayPrice)}
                </Typography>
                {hasDiscount && (
                  <>
                    <Typography variant="h6" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                      {formatCurrency(displayMrp)}
                    </Typography>
                    <Chip label={`${discountPct}% OFF`} color="error" size="small" sx={{ fontWeight: 700 }} />
                  </>
                )}
              </Box>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* ── Variant selector ── */}
            {variants.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Select Variant
                  {selectedVariant && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                      — {selectedVariant.name}
                    </Typography>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {variants.map((v) => (
                    <Chip
                      key={v.id}
                      label={v.name}
                      onClick={() => { setSelectedVariant(v); setQty(1); }}
                      variant={selectedVariant?.id === v.id ? 'filled' : 'outlined'}
                      color={selectedVariant?.id === v.id ? 'primary' : 'default'}
                      disabled={!v.is_active || v.quantity === 0}
                      sx={{
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: v.quantity === 0 ? 0.5 : 1,
                      }}
                    />
                  ))}
                </Box>
                {/* SKU + weight info */}
                {selectedVariant && (
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">SKU: <strong>{displaySku}</strong></Typography>
                    {displayWeight && (
                      <Typography variant="caption" color="text.secondary">Weight: <strong>{displayWeight}</strong></Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* ── Qty + actions ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{
                display: 'flex', alignItems: 'center',
                border: '2px solid', borderColor: 'primary.main',
                borderRadius: '50px', overflow: 'hidden',
              }}>
                <Button onClick={() => setQty(Math.max(1, qty - 1))} sx={{ minWidth: 44, borderRadius: 0 }} aria-label="Decrease quantity">
                  <Remove />
                </Button>
                <Typography sx={{ px: 2, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{qty}</Typography>
                <Button
                  onClick={() => setQty(Math.min(displayStock || 99, qty + 1))}
                  sx={{ minWidth: 44, borderRadius: 0 }}
                  aria-label="Increase quantity"
                >
                  <Add />
                </Button>
              </Box>

              <Button
                variant="contained" size="large" startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!selectedVariant || displayStock === 0}
                sx={{ flex: 1, background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', py: 1.5 }}
              >
                {displayStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <Button
                variant="outlined" size="large"
                onClick={handleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                sx={{ minWidth: 52 }}
              >
                {isWishlisted ? <Favorite color="error" /> : <FavoriteBorder />}
              </Button>
            </Box>

            {/* Trust badges */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', p: 2.5, bgcolor: 'grey.50', borderRadius: 3 }}>
              {[
                { icon: <LocalShipping fontSize="small" />, text: 'Free delivery above ₹499' },
                { icon: <Security fontSize="small" />,      text: 'Secure checkout' },
              ].map((item) => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* ── Tabs ── */}
        <Box sx={{ mt: 6 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab value="description" label="Description"                             sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab value="variants"    label={`Variants (${variants.length})`}         sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          {/* Description */}
          {tabValue === 'description' && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {product.long_description || product.short_description || 'No description available.'}
              </Typography>
            </Paper>
          )}

          {/* Variants table */}
          {tabValue === 'variants' && (
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {variants.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No variants available.</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableBody>
                      {/* Header row */}
                      <TableRow sx={{ bgcolor: '#1B4332' }}>
                        {['Variant', 'SKU', 'Weight', 'MRP', 'Price', 'Stock', 'Status'].map((h) => (
                          <TableCell key={h} sx={{ color: '#FFF8F0', fontWeight: 700, py: 1.5 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                      {variants.map((v) => (
                        <TableRow
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: selectedVariant?.id === v.id ? '#D8F3DC' : 'inherit',
                            '&:hover': { bgcolor: '#F0FDF4' },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{v.name}</TableCell>
                          <TableCell>{v.sku}</TableCell>
                          <TableCell>{v.weight} {v.weight_unit}</TableCell>
                          <TableCell sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                            {formatCurrency(parseFloat(v.mrp))}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#1B4332' }}>
                            {formatCurrency(parseFloat(v.selling_price))}
                          </TableCell>
                          <TableCell>{v.quantity}</TableCell>
                          <TableCell>
                            <Chip
                              label={v.is_active && v.quantity > 0 ? 'Available' : 'Unavailable'}
                              color={v.is_active && v.quantity > 0 ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
