'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card, CardMedia, CardContent,
  Typography, Box, Button, Chip, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ShoppingCart, Add, Remove, Close, ChevronRight } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { variantsAPI } from '@/lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Number(val) || 0);

// ─── Variant Row ──────────────────────────────────────────────────────────────
function VariantRow({ variant, onAdd }) {
  const [qty,    setQty]    = useState(1);
  const [adding, setAdding] = useState(false);

  const price       = parseFloat(variant.selling_price);
  const mrp         = parseFloat(variant.mrp);
  const inStock     = variant.is_active && (variant.quantity === undefined || variant.quantity > 0);
  const hasDiscount = mrp > price;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAdd = async () => {
    setAdding(true);
    try {
      await onAdd(variant, qty);
      setQty(1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.75,
        borderBottom: '1px solid #F5F5F4',
        '&:last-child': { borderBottom: 'none' },
        opacity: inStock ? 1 : 0.5,
      }}
    >
      {/* Name + price */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F0F0F', lineHeight: 1.3 }} noWrap>
          {variant.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F0F0F' }}>
            {fmt(price)}
          </Typography>
          {hasDiscount && (
            <>
              <Typography sx={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#A3A3A3' }}>
                {fmt(mrp)}
              </Typography>
              <Box sx={{
                px: 0.75, py: 0.1, borderRadius: '4px',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#16A34A' }}>
                  {discountPct}% off
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {inStock ? (
        <>
          {/* Qty stepper */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center',
              border: '1px solid #E7E5E4', borderRadius: '6px',
              overflow: 'hidden', flexShrink: 0,
              background: '#F5F5F4',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || adding}
              aria-label="Decrease quantity"
              sx={{ p: '5px', borderRadius: 0 }}
            >
              <Remove sx={{ fontSize: 14 }} />
            </IconButton>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, minWidth: 24, textAlign: 'center', color: '#0F0F0F' }}>
              {qty}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setQty((q) => Math.min(variant.quantity ?? 99, q + 1))}
              disabled={(variant.quantity !== undefined && qty >= variant.quantity) || adding}
              aria-label="Increase quantity"
              sx={{ p: '5px', borderRadius: 0 }}
            >
              <Add sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {/* Add to cart */}
          <Button
            size="small"
            variant="contained"
            onClick={handleAdd}
            disabled={adding}
            startIcon={adding ? <CircularProgress size={12} color="inherit" /> : <ShoppingCart sx={{ fontSize: 14 }} />}
            aria-label={`Add ${variant.name} to cart`}
            sx={{
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 1.5,
              py: 0.75,
              minWidth: 0,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </>
      ) : (
        <Chip
          label="Out of stock"
          size="small"
          sx={{ fontSize: '0.72rem', height: 22, bgcolor: '#F5F5F4', color: '#737373' }}
        />
      )}
    </Box>
  );
}

// ─── Variant Picker Dialog ────────────────────────────────────────────────────
function VariantPickerDialog({ open, onClose, product, onAdd }) {
  const [variants, setVariants] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    variantsAPI
      .getByProduct({ product_id: product.id, page: 1, limit: 20 })
      .then((res) => { if (!cancelled) setVariants(res.data?.data?.data ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, product.id]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, border: '1px solid #E7E5E4' } } }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6, pt: 2.5, px: 2.5 }}>
        <Typography fontWeight={700} sx={{ fontSize: '1rem', color: '#0F0F0F' }} noWrap>
          {product.name}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#737373', mt: 0.25 }}>
          Select a variant to add to cart
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close"
          sx={{ position: 'absolute', top: 14, right: 14, color: '#737373' }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, borderColor: '#F5F5F4' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#FF5722' }} />
          </Box>
        ) : variants.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 3, fontSize: '0.875rem', color: '#737373' }}>
            No variants available
          </Typography>
        ) : (
          variants.map((v) => (
            <VariantRow key={v.id} variant={v} onAdd={onAdd} />
          ))
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} sx={{ color: '#737373', fontWeight: 600, fontSize: '0.875rem' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Variants Summary ─────────────────────────────────────────────────────────
function VariantsSummary({ product, onOpen }) {
  const [count,   setCount]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    variantsAPI
      .getByProduct({ product_id: product.id, page: 1, limit: 20 })
      .then((res) => {
        if (!cancelled) setCount((res.data?.data?.data ?? []).length);
      })
      .catch(() => { if (!cancelled) setCount(0); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [product.id]);

  if (loading || count === 0) return null;

  return (
    <Box
      onClick={onOpen}
      sx={{
        px: 2, py: 1.25,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer',
        borderTop: '1px solid #F5F5F4',
        background: '#FAFAF9',
        borderRadius: '0 0 14px 14px',
        transition: 'background 0.15s',
        '&:hover': { background: '#F5F5F4' },
      }}
    >
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#525252' }}>
        {count} variant{count !== 1 ? 's' : ''} available
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#FF5722' }}>
          Add to Cart
        </Typography>
        <ChevronRight sx={{ fontSize: 16, color: '#FF5722' }} />
      </Box>
    </Box>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { addToCart } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);

  const categoryName = product.category?.name ?? product.category ?? '';
  const rawImage     = product.images?.[0]?.image || product.image;
  const storageBase  = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';
  const imageUrl     =
    rawImage && typeof rawImage === 'string' && rawImage.trim() !== ''
      ? rawImage.startsWith('http') ? rawImage : `${storageBase}/${rawImage}`
      : null;

  const handleAdd = async (variant, qty) => {
    const toastId = toast.loading('Adding to cart…');
    try {
      await addToCart(product.id, variant.id, qty);
      toast.update(toastId, {
        render: `Added to cart`,
        type: 'success', isLoading: false, autoClose: 2000,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not add to cart.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3000 });
      throw err;
    }
  };

  return (
    <>
      <Card
        className="card-3d"
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        {/* Image */}
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
          <Box sx={{ position: 'relative', overflow: 'hidden', background: '#F5F5F4' }}>
            {imageUrl ? (
              <CardMedia
                component="img"
                image={imageUrl}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
                sx={{
                  height: 200,
                  width: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.35s ease',
                  '&:hover': { transform: 'scale(1.04)' },
                }}
              />
            ) : null}
            <Box
              sx={{
                height: 200,
                display: imageUrl ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F5F5F4',
                fontSize: 56,
              }}
              role="img"
              aria-label={product.name}
            >
              🛍️
            </Box>
          </Box>
        </Link>

        {/* Content */}
        <CardContent sx={{ pb: 1, pt: 1.75, px: 2, flex: 1 }}>
          {categoryName && (
            <Typography sx={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#FF5722', mb: 0.5,
            }}>
              {categoryName}
            </Typography>
          )}
          <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#0F0F0F',
                lineHeight: 1.35,
                mb: 0.5,
                '&:hover': { color: '#FF5722' },
                transition: 'color 0.15s',
              }}
            >
              {product.name}
            </Typography>
          </Link>
          {product.short_description && (
            <Typography sx={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.5, mt: 0.25 }} noWrap>
              {product.short_description}
            </Typography>
          )}
        </CardContent>

        {/* Variants CTA */}
        <VariantsSummary product={product} onOpen={() => setDialogOpen(true)} />
      </Card>

      {dialogOpen && (
        <VariantPickerDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          product={product}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}
