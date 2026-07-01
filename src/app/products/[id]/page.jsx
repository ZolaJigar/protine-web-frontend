'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Container, Typography, Button, Rating, Chip, Divider,
  Tabs, Tab, Paper, Avatar, CircularProgress, Alert, Grid,
} from '@mui/material';
import {
  ShoppingCart, Favorite, FavoriteBorder, LocalShipping, Security,
  Add, Remove, Inventory2,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/functions';
import { productsAPI, variantsAPI, wishlistAPI } from '@/lib/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { state, addToCart, fetchWishlistCount } = useApp();

  const [product,         setProduct]         = useState(null);
  const [variants,        setVariants]        = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty,             setQty]             = useState(1);
  const [tabValue,        setTabValue]        = useState('description');
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [addingToCart,    setAddingToCart]    = useState(false);
  const [isWishlisted,    setIsWishlisted]    = useState(false);
  const [wishlistItemId,  setWishlistItemId]  = useState(null); // server id for removal
  const [wishlistLoading, setWishlistLoading] = useState(false);

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

  // Check if this product is already in the wishlist (logged-in only)
  useEffect(() => {
    if (!id || !state.isAuthenticated) return;
    wishlistAPI.getList()
      .then((res) => {
        const list  = res.data?.data?.data ?? [];
        const match = list.find((w) => w.product_id === Number(id));
        if (match) { setIsWishlisted(true); setWishlistItemId(match.id); }
        else        { setIsWishlisted(false); setWishlistItemId(null); }
      })
      .catch(() => {}); // silently ignore — heart just stays hollow
  }, [id, state.isAuthenticated]);

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

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.warning('Please select a variant first.');
      return;
    }
    setAddingToCart(true);
    const toastId = toast.loading('Adding to cart…');
    try {
      await addToCart(product.id, selectedVariant.id, qty);
      toast.update(toastId, {
        render: `🛒 ${qty} × ${selectedVariant.name} added to cart!`,
        type: 'success', isLoading: false, autoClose: 2500,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not add to cart. Please try again.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!state.isAuthenticated) {
      toast.info('Please log in to save items to your wishlist.');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted && wishlistItemId) {
        await wishlistAPI.removeItem(wishlistItemId);
        setIsWishlisted(false);
        setWishlistItemId(null);
        toast.info('💔 Removed from wishlist', { autoClose: 2000 });
      } else {
        const variantId = selectedVariant?.id ?? null;
        const res       = await wishlistAPI.addItem({ product_id: Number(id), product_variant_id: variantId });
        const newId     = res.data?.data?.id ?? null;
        setIsWishlisted(true);
        setWishlistItemId(newId);
        toast.success('❤️ Added to wishlist!', { autoClose: 2000 });
      }
      fetchWishlistCount(); // keep navbar badge in sync
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not update wishlist.';
      toast.error(msg, { autoClose: 3000 });
    } finally {
      setWishlistLoading(false);
    }
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
                variant="contained" size="large"
                startIcon={addingToCart ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!selectedVariant || displayStock === 0 || addingToCart}
                sx={{ flex: 1, background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', py: 1.5 }}
              >
                {displayStock === 0 ? 'Out of Stock' : addingToCart ? 'Adding…' : 'Add to Cart'}
              </Button>

              <Button
                variant="outlined" size="large"
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                sx={{ minWidth: 52 }}
              >
                {wishlistLoading
                  ? <CircularProgress size={22} sx={{ color: '#EF4444' }} />
                  : isWishlisted
                    ? <Favorite color="error" />
                    : <FavoriteBorder />
                }
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

          {/* Variants cards */}
          {tabValue === 'variants' && (
            variants.length === 0 ? (
              <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No variants available.</Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {variants.map((v) => {
                  const price      = parseFloat(v.selling_price);
                  const mrp        = parseFloat(v.mrp);
                  const hasDisc    = mrp > price;
                  const discPct    = hasDisc ? Math.round(((mrp - price) / mrp) * 100) : 0;
                  const available  = v.is_active && v.quantity > 0;
                  const isSelected = selectedVariant?.id === v.id;

                  return (
                    <Paper
                      key={v.id}
                      onClick={() => available && setSelectedVariant(v)}
                      sx={{
                        p: 2, borderRadius: 3,
                        border: '2px solid',
                        borderColor: isSelected ? '#1B4332' : '#E2E8F0',
                        bgcolor: isSelected ? '#F0FDF4' : '#fff',
                        cursor: available ? 'pointer' : 'not-allowed',
                        opacity: available ? 1 : 0.55,
                        transition: 'all 0.2s',
                        '&:hover': available ? {
                          borderColor: '#1B4332',
                          boxShadow: '0 4px 16px rgba(27,67,50,0.12)',
                          transform: 'translateY(-2px)',
                        } : {},
                        position: 'relative',
                      }}
                    >
                      {/* Selected badge */}
                      {isSelected && (
                        <Chip
                          label="Selected"
                          size="small"
                          sx={{
                            position: 'absolute', top: 10, right: 10,
                            bgcolor: '#1B4332', color: '#fff',
                            fontWeight: 700, fontSize: 10, height: 20,
                          }}
                        />
                      )}

                      {/* Discount badge */}
                      {hasDisc && available && (
                        <Chip
                          label={`${discPct}% OFF`}
                          color="error"
                          size="small"
                          sx={{
                            position: 'absolute', top: isSelected ? 34 : 10, right: 10,
                            fontWeight: 700, fontSize: 10, height: 20,
                          }}
                        />
                      )}

                      {/* Name */}
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ mb: 1.5, pr: 6, lineHeight: 1.3 }}
                      >
                        {v.name}
                      </Typography>

                      {/* Price row */}
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                        <Typography variant="h6" fontWeight={900} sx={{ color: '#1B4332' }}>
                          {formatCurrency(price)}
                        </Typography>
                        {hasDisc && (
                          <Typography
                            variant="caption"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            {formatCurrency(mrp)}
                          </Typography>
                        )}
                      </Box>

                      {/* Meta row */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          SKU: <strong>{v.sku ?? '—'}</strong>
                        </Typography>
                        {v.weight && (
                          <Typography variant="caption" color="text.secondary">
                            Weight: <strong>{v.weight} {v.weight_unit}</strong>
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Stock: <strong>{v.quantity}</strong>
                        </Typography>
                      </Box>

                      {/* Status chip */}
                      <Chip
                        label={available ? 'Available' : 'Unavailable'}
                        color={available ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </Paper>
                  );
                })}
              </Box>
            )
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
