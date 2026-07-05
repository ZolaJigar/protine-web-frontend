'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box, Container, Typography, Button, Chip, Divider,
  CircularProgress, Alert, IconButton, Paper,
} from '@mui/material';
import {
  ShoppingCart, Favorite, FavoriteBorder, LocalShipping, Security,
  Add, Remove, ArrowBackIos, ArrowForwardIos,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/functions';
import { productsAPI, variantsAPI, wishlistAPI } from '@/lib/api';

// ─── Small helper: a labeled row like "SKU  CLAS-HI-1KG" ─────────────────────
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #F1F5F9' }}>
      <Typography sx={{ fontSize: 13, color: '#64748B' }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>{value}</Typography>
    </Box>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { state, addToCart, fetchWishlistCount } = useApp();

  const [product,         setProduct]         = useState(null);
  const [variants,        setVariants]        = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty,             setQty]             = useState(1);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [addingToCart,    setAddingToCart]    = useState(false);
  const [isWishlisted,    setIsWishlisted]    = useState(false);
  const [wishlistItemId,  setWishlistItemId]  = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imgIndex,        setImgIndex]        = useState(0);

  // Reset image to first when variant changes
  useEffect(() => { setImgIndex(0); }, [selectedVariant?.id]);

  // ── Fetch product + variants ───────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      productsAPI.getById(id),
      variantsAPI.getByProduct({ product_id: Number(id), page: 1, limit: 50 }),
    ])
      .then(([prodRes, varRes]) => {
        const prod    = prodRes.data?.data ?? prodRes.data;
        const varList = varRes.data?.data?.data ?? [];
        setProduct(prod);
        setVariants(varList);
        if (varList.length > 0) setSelectedVariant(varList[0]);
      })
      .catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Wishlist check ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !state.isAuthenticated) return;
    wishlistAPI.getList()
      .then((res) => {
        const match = (res.data?.data?.data ?? []).find((w) => w.product_id === Number(id));
        if (match) { setIsWishlisted(true); setWishlistItemId(match.id); }
        else        { setIsWishlisted(false); setWishlistItemId(null); }
      })
      .catch(() => {});
  }, [id, state.isAuthenticated]);

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#16A34A' }} />
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

  // ── Derived values ─────────────────────────────────────────────────────────
  const allImages = [
    ...(selectedVariant?.image ? [selectedVariant.image] : []),
    ...(product.images ?? []).map((i) => i.image).filter(Boolean),
  ];
  const imageList   = [...new Set(allImages)];
  const displayMrp   = selectedVariant ? parseFloat(selectedVariant.mrp)            : null;
  const displayPrice = selectedVariant ? parseFloat(selectedVariant.selling_price)  : null;
  const displayStock = selectedVariant?.quantity ?? (selectedVariant?.is_active ? 1 : 0);
  const hasDiscount  = displayMrp && displayPrice && displayPrice < displayMrp;
  const discountPct  = hasDiscount ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0;
  const inStock      = displayStock > 0;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!selectedVariant) { toast.warning('Please select a variant first.'); return; }
    setAddingToCart(true);
    const toastId = toast.loading('Adding to cart…');
    try {
      await addToCart(product.id, selectedVariant.id, qty);
      toast.update(toastId, { render: `🛒 ${qty} × ${selectedVariant.name} added!`, type: 'success', isLoading: false, autoClose: 2500 });
    } catch (err) {
      toast.update(toastId, { render: err?.response?.data?.message || 'Could not add to cart.', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!state.isAuthenticated) { toast.info('Please log in to save items to your wishlist.'); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted && wishlistItemId) {
        await wishlistAPI.removeItem(wishlistItemId);
        setIsWishlisted(false); setWishlistItemId(null);
        toast.info('💔 Removed from wishlist', { autoClose: 2000 });
      } else {
        const res  = await wishlistAPI.addItem({ product_id: Number(id), product_variant_id: selectedVariant?.id ?? null });
        setIsWishlisted(true); setWishlistItemId(res.data?.data?.id ?? null);
        toast.success('❤️ Added to wishlist!', { autoClose: 2000 });
      }
      fetchWishlistCount();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update wishlist.', { autoClose: 3000 });
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '420px 1fr' }, gap: 4, alignItems: 'start' }}>

          {/* ── LEFT: image carousel ──────────────────────────────────────── */}
          <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#fff',
                boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0',
              }}
            >
              {/* Main image */}
              <Box sx={{ position: 'relative', bgcolor: '#F8FAFC' }}>
                {imageList.length > 0 ? (
                  <img
                    key={imageList[imgIndex]}
                    src={imageList[imgIndex]}
                    alt={`${product.name} ${imgIndex + 1}`}
                    style={{
                      width: '100%', height: 380,
                      objectFit: 'contain', display: 'block',
                      padding: '24px', background: '#F8FAFC',
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <Box sx={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, bgcolor: '#F8FAFC' }}
                    role="img" aria-label={product.name}>🛍️</Box>
                )}

                {/* Prev / Next over main image */}
                {imageList.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => setImgIndex((i) => (i - 1 + imageList.length) % imageList.length)}
                      aria-label="Previous image"
                      size="small"
                      sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.92)', border: '1px solid #E2E8F0', boxShadow: 1, '&:hover': { bgcolor: '#fff' } }}
                    >
                      <ArrowBackIos sx={{ fontSize: 14, ml: 0.5 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => setImgIndex((i) => (i + 1) % imageList.length)}
                      aria-label="Next image"
                      size="small"
                      sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.92)', border: '1px solid #E2E8F0', boxShadow: 1, '&:hover': { bgcolor: '#fff' } }}
                    >
                      <ArrowForwardIos sx={{ fontSize: 14 }} />
                    </IconButton>

                    {/* Counter */}
                    <Box sx={{ position: 'absolute', bottom: 10, right: 12, bgcolor: 'rgba(0,0,0,0.38)', color: '#fff', px: 1.25, py: 0.2, borderRadius: '50px', fontSize: 11, fontWeight: 700 }}>
                      {imgIndex + 1}/{imageList.length}
                    </Box>
                  </>
                )}
              </Box>

              {/* Thumbnail strip — same style as reference: inside the card, bottom, with side arrows */}
              {imageList.length > 1 && (
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center',
                    borderTop: '1px solid #F1F5F9',
                    px: 1, py: 1.25, gap: 0.75, bgcolor: '#fff',
                  }}
                >
                  <IconButton size="small" onClick={() => setImgIndex((i) => (i - 1 + imageList.length) % imageList.length)}
                    sx={{ flexShrink: 0, color: '#94A3B8', '&:hover': { color: '#16A34A' } }}>
                    <ArrowBackIos sx={{ fontSize: 13, ml: 0.5 }} />
                  </IconButton>

                  <Box sx={{ display: 'flex', gap: 0.75, flex: 1, overflow: 'hidden', justifyContent: 'center' }}>
                    {imageList.map((src, i) => (
                      <Box
                        key={i}
                        onClick={() => setImgIndex(i)}
                        sx={{
                          width: 56, height: 56, flexShrink: 0, borderRadius: 1.5, overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: i === imgIndex ? '#16A34A' : '#E2E8F0',
                          opacity: i === imgIndex ? 1 : 0.6,
                          transition: 'all 0.15s',
                          '&:hover': { opacity: 1, borderColor: '#16A34A' },
                        }}
                      >
                        <img src={src} alt={`Thumb ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </Box>
                    ))}
                  </Box>

                  <IconButton size="small" onClick={() => setImgIndex((i) => (i + 1) % imageList.length)}
                    sx={{ flexShrink: 0, color: '#94A3B8', '&:hover': { color: '#16A34A' } }}>
                    <ArrowForwardIos sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>
              )}
            </Paper>
          </Box>

          {/* ── RIGHT: product info ───────────────────────────────────────── */}
          <Box>
            {/* Category chips */}
            {product.category?.name && (
              <Chip label={product.category.name} size="small" color="primary" sx={{ mb: 1.5, fontWeight: 600, borderRadius: 1 }} />
            )}

            {/* Title */}
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.2, mb: 0.75 }}>
              {product.name}
            </Typography>

            {/* Short description */}
            {product.short_description && (
              <Typography sx={{ fontSize: 14, color: '#64748B', mb: 2, lineHeight: 1.7 }}>
                {product.short_description}
              </Typography>
            )}

            {/* Price + stock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 0.5 }}>
              {displayPrice !== null && (
                <Typography sx={{ fontSize: 32, fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>
                  {formatCurrency(displayPrice)}
                </Typography>
              )}
              {hasDiscount && (
                <>
                  <Typography sx={{ fontSize: 18, color: '#94A3B8', textDecoration: 'line-through' }}>
                    {formatCurrency(displayMrp)}
                  </Typography>
                  <Chip label={`${discountPct}% OFF`} color="error" size="small" sx={{ fontWeight: 700 }} />
                </>
              )}
            </Box>
            {selectedVariant && (
              <Chip
                label={inStock ? 'In Stock' : 'Out of Stock'}
                color={inStock ? 'success' : 'error'}
                size="small"
                sx={{ mb: 2.5, fontWeight: 600 }}
              />
            )}

            <Divider sx={{ mb: 3 }} />

            {/* ── Variant selector ── */}
            {variants.length > 0 && (
              <Section title="Select Variant">
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: selectedVariant ? 1.5 : 0 }}>
                  {variants.map((v) => {
                    const avail = v.is_active && (v.quantity === undefined || v.quantity > 0);
                    return (
                      <Chip
                        key={v.id}
                        label={v.name}
                        onClick={() => { if (avail) { setSelectedVariant(v); setQty(1); } }}
                        variant={selectedVariant?.id === v.id ? 'filled' : 'outlined'}
                        color={selectedVariant?.id === v.id ? 'primary' : 'default'}
                        disabled={!avail}
                        sx={{ fontWeight: 600, cursor: avail ? 'pointer' : 'not-allowed', opacity: avail ? 1 : 0.45 }}
                      />
                    );
                  })}
                </Box>
              </Section>
            )}

            {/* ── Selected variant details ── */}
            {selectedVariant && (
              <Section title="Variant Details">
                <InfoRow label="SKU"    value={selectedVariant.sku || null} />
                <InfoRow label="Weight" value={selectedVariant.weight ? `${selectedVariant.weight} ${selectedVariant.weight_unit}` : null} />
                <InfoRow label="Barcode" value={selectedVariant.barcode || null} />
                {selectedVariant.quantity !== undefined && (
                  <InfoRow label="Stock" value={selectedVariant.quantity} />
                )}
              </Section>
            )}

            {/* ── Qty + actions ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1.5px solid #16A34A', borderRadius: '50px', overflow: 'hidden' }}>
                <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease" sx={{ borderRadius: 0, px: 1.5 }}>
                  <Remove fontSize="small" />
                </IconButton>
                <Typography sx={{ px: 1.5, fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: 15 }}>{qty}</Typography>
                <IconButton size="small" onClick={() => setQty((q) => Math.min(displayStock || 99, q + 1))} aria-label="Increase" sx={{ borderRadius: 0, px: 1.5 }}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="contained" size="large"
                startIcon={addingToCart ? <CircularProgress size={18} color="inherit" /> : <ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!selectedVariant || !inStock || addingToCart}
                sx={{
                  flex: 1, fontWeight: 700, borderRadius: '50px', textTransform: 'none', fontSize: 15,
                  background: 'linear-gradient(135deg, #16A34A, #4ADE80)',
                  '&:hover': { background: 'linear-gradient(135deg, #15803D, #16A34A)' },
                  '&.Mui-disabled': { background: '#9CA3AF', color: '#fff' },
                }}
              >
                {!inStock ? 'Out of Stock' : addingToCart ? 'Adding…' : 'Add to Cart'}
              </Button>

              <IconButton
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                sx={{ border: '1.5px solid #E2E8F0', borderRadius: '50%', p: 1.25 }}
              >
                {wishlistLoading
                  ? <CircularProgress size={20} sx={{ color: '#EF4444' }} />
                  : isWishlisted ? <Favorite sx={{ color: '#EF4444' }} /> : <FavoriteBorder />}
              </IconButton>
            </Box>

            {/* ── Product info ── */}
            <Section title="Product Info">
              <InfoRow label="Product Name" value={product.name} />
              <InfoRow label="Slug"         value={product.slug} />
              <InfoRow label="Category"     value={product.category?.name} />
              {product.starting_price !== undefined && (
                <InfoRow label="Starting Price" value={formatCurrency(product.starting_price)} />
              )}
              {product.max_price !== undefined && product.max_price !== product.starting_price && (
                <InfoRow label="Max Price" value={formatCurrency(product.max_price)} />
              )}
            </Section>

            {/* ── Long description ── */}
            {product.long_description && (
              <Section title="Description">
                <Typography sx={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {product.long_description}
                </Typography>
              </Section>
            )}

            {/* ── Trust badges ── */}
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mt: 1, pt: 2.5, borderTop: '1px solid #F1F5F9' }}>
              {[
                { icon: <LocalShipping fontSize="small" />, text: 'Free delivery above ₹499' },
                { icon: <Security fontSize="small" />,      text: 'Secure checkout' },
              ].map((item) => (
                <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ color: '#16A34A' }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

        </Box>
      </Container>
    </MainLayout>
  );
}
