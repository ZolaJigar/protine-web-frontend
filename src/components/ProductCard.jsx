'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Box, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart, Close, Add, Remove } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { variantsAPI } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Number(val) || 0);

// ─── Variant Picker Dialog ────────────────────────────────────────────────────
function VariantPickerDialog({ open, onClose, product, variants, onAdd }) {
  const [selected, setSelected] = useState(variants[0] ?? null);
  const [qty,      setQty]      = useState(1);
  const [adding,   setAdding]   = useState(false);

  // Keep selected in sync if variants load after dialog opens
  if (!selected && variants.length > 0) setSelected(variants[0]);

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      await onAdd(product.id, selected.id, qty);
      onClose();
    } finally {
      setAdding(false);
    }
  };

  const price   = selected ? parseFloat(selected.selling_price) : null;
  const mrp     = selected ? parseFloat(selected.mrp)           : null;
  const inStock = selected ? selected.quantity > 0              : false;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography fontWeight={700} variant="h6" noWrap>{product.name}</Typography>
        <Typography variant="caption" color="text.secondary">Select a variant to add to cart</Typography>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {/* Variant chips */}
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Variant
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {variants.map((v) => {
            const unavailable = !v.is_active || v.quantity === 0;
            return (
              <Chip
                key={v.id}
                label={v.name}
                onClick={() => { if (!unavailable) { setSelected(v); setQty(1); } }}
                variant={selected?.id === v.id ? 'filled' : 'outlined'}
                color={selected?.id === v.id ? 'primary' : 'default'}
                disabled={unavailable}
                sx={{
                  fontWeight: 600, cursor: unavailable ? 'not-allowed' : 'pointer',
                  opacity: unavailable ? 0.45 : 1,
                }}
              />
            );
          })}
        </Box>

        {/* Selected variant details */}
        {selected && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#1B4332' }}>
                {fmt(price)}
              </Typography>
              {mrp && mrp > price && (
                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                  {fmt(mrp)}
                </Typography>
              )}
              {mrp && mrp > price && (
                <Chip
                  label={`${Math.round(((mrp - price) / mrp) * 100)}% OFF`}
                  color="error" size="small" sx={{ fontWeight: 700, height: 20, fontSize: 11 }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                SKU: <strong>{selected.sku ?? '—'}</strong>
              </Typography>
              {selected.weight && (
                <Typography variant="caption" color="text.secondary">
                  Weight: <strong>{selected.weight} {selected.weight_unit}</strong>
                </Typography>
              )}
            </Box>

            <Chip
              label={inStock ? `${selected.quantity} in stock` : 'Out of stock'}
              color={inStock ? 'success' : 'error'}
              size="small"
              sx={{ mb: 2.5 }}
            />

            {/* Qty stepper */}
            {inStock && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mr: 2 }}>Qty</Typography>
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center',
                    border: '1.5px solid', borderColor: 'primary.main',
                    borderRadius: '50px', overflow: 'hidden',
                  }}
                >
                  <IconButton
                    size="small" onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                    sx={{ borderRadius: 0, px: 1 }}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography sx={{ px: 2, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                    {qty}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQty(Math.min(selected.quantity, qty + 1))}
                    disabled={qty >= selected.quantity}
                    aria-label="Increase quantity"
                    sx={{ borderRadius: 0, px: 1 }}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="text" sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={!selected || !inStock || adding}
          startIcon={adding ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
          sx={{
            flex: 1, fontWeight: 700, borderRadius: '50px',
            background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
            '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' },
          }}
        >
          {adding ? 'Adding…' : `Add ${qty > 1 ? `${qty} × ` : ''}to Cart`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { addToCart } = useApp();

  const [dialogOpen,       setDialogOpen]       = useState(false);
  const [variants,         setVariants]         = useState([]);
  const [variantsLoading,  setVariantsLoading]  = useState(false);
  const [addingDirect,     setAddingDirect]     = useState(false);

  // Normalize API shape
  const categoryName = product.category?.name ?? product.category ?? '';
  const rawImage     = product.images?.[0]?.image || product.image;
  const storageBase  = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';
  const imageUrl     =
    rawImage && typeof rawImage === 'string' && rawImage.trim() !== ''
      ? rawImage.startsWith('http') ? rawImage : `${storageBase}/${rawImage}`
      : null;

  const handleAddToCartClick = async (e) => {
    e.preventDefault(); // don't navigate to product page

    // Fetch variants if not yet loaded
    let varList = variants;
    if (varList.length === 0) {
      setVariantsLoading(true);
      try {
        const res = await variantsAPI.getByProduct({ product_id: product.id, page: 1, limit: 50 });
        varList   = res.data?.data?.data ?? [];
        setVariants(varList);
      } catch {
        toast.error('Could not load variants. Try from the product page.');
        setVariantsLoading(false);
        return;
      }
      setVariantsLoading(false);
    }

    if (varList.length === 0) {
      toast.warning('No variants available for this product.');
      return;
    }

    if (varList.length === 1) {
      // Single variant — add directly without opening dialog
      const v = varList[0];
      if (!v.is_active || v.quantity === 0) {
        toast.warning('This product is currently out of stock.');
        return;
      }
      setAddingDirect(true);
      const toastId = toast.loading('Adding to cart…');
      try {
        await addToCart(product.id, v.id, 1);
        toast.update(toastId, {
          render: `🛒 ${product.name} added to cart!`,
          type: 'success', isLoading: false, autoClose: 2500,
        });
      } catch (err) {
        const msg = err?.response?.data?.message || 'Could not add to cart.';
        toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
      } finally {
        setAddingDirect(false);
      }
      return;
    }

    // Multiple variants — open picker
    setDialogOpen(true);
  };

  const handleDialogAdd = async (productId, variantId, qty) => {
    const toastId = toast.loading('Adding to cart…');
    try {
      await addToCart(productId, variantId, qty);
      toast.update(toastId, {
        render: `🛒 Added to cart!`,
        type: 'success', isLoading: false, autoClose: 2500,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not add to cart.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
      throw err; // let dialog stay open on failure
    }
  };

  const isLoading = variantsLoading || addingDirect;

  return (
    <>
      <Card
        className="card-3d"
        sx={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Image */}
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          {imageUrl ? (
            <CardMedia
              component="img"
              height="200"
              image={imageUrl}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'flex';
              }}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'scale(1.06)' },
              }}
            />
          ) : null}
          <Box
            sx={{
              height: 200,
              display: imageUrl ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #CCEFDB, #E8F5E9)',
              borderRadius: '16px 16px 0 0',
              fontSize: 64,
            }}
            role="img" aria-label={product.name}
          >
            🛍️
          </Box>
        </Link>

        <CardContent sx={{ flex: 1, pb: 1 }}>
          {categoryName && (
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, textTransform: 'uppercase' }}>
              {categoryName}
            </Typography>
          )}
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
          {product.short_description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }} noWrap>
              {product.short_description}
            </Typography>
          )}
        </CardContent>

        {/* Add to Cart action */}
        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={handleAddToCartClick}
            disabled={isLoading}
            startIcon={
              isLoading
                ? <CircularProgress size={16} color="inherit" />
                : <ShoppingCart fontSize="small" />
            }
            aria-label={`Add ${product.name} to cart`}
            sx={{
              borderRadius: '50px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: 13,
              background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
              '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' },
              '&.Mui-disabled': { background: '#A8A29E' },
            }}
          >
            {isLoading ? 'Adding…' : 'Add to Cart'}
          </Button>
        </CardActions>
      </Card>

      {/* Variant picker — only rendered when needed */}
      {dialogOpen && (
        <VariantPickerDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          product={product}
          variants={variants}
          onAdd={handleDialogAdd}
        />
      )}
    </>
  );
}
