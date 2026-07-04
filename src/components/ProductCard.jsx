'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card, CardMedia, CardContent,
  Typography, Box, Button, Chip, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { ShoppingCart, Add, Remove, Close } from '@mui/icons-material';
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
  const [qty,    setQty]   = useState(1);
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
        px: 2,
        py: 1.75,
        borderBottom: '1px solid #F1F5F9',
        '&:last-child': { borderBottom: 'none' },
        opacity: inStock ? 1 : 0.55,
        bgcolor: inStock ? 'transparent' : '#FAFAFA',
      }}
    >
      {/* Name + price — takes remaining space */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 14, fontWeight: 700, color: '#1B4332', lineHeight: 1.3 }}
          noWrap
        >
          {variant.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
            {fmt(price)}
          </Typography>
          {hasDiscount && (
            <>
              <Typography sx={{ fontSize: 12, textDecoration: 'line-through', color: '#94A3B8' }}>
                {fmt(mrp)}
              </Typography>
              <Chip
                label={`${discountPct}% off`}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: 11, fontWeight: 700, '& .MuiChip-label': { px: 0.75 } }}
              />
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
              border: '1.5px solid #CBD5E1', borderRadius: '50px',
              overflow: 'hidden', flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || adding}
              aria-label="Decrease quantity"
              sx={{ p: '6px', borderRadius: 0 }}
            >
              <Remove sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ fontSize: 14, fontWeight: 700, minWidth: 26, textAlign: 'center' }}>
              {qty}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setQty((q) => Math.min(variant.quantity ?? 99, q + 1))}
              disabled={variant.quantity !== undefined && qty >= variant.quantity || adding}
              aria-label="Increase quantity"
              sx={{ p: '6px', borderRadius: 0 }}
            >
              <Add sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Add to cart button */}
          <Button
            size="small"
            variant="contained"
            onClick={handleAdd}
            disabled={adding}
            startIcon={adding ? <CircularProgress size={14} color="inherit" /> : <ShoppingCart sx={{ fontSize: 15 }} />}
            aria-label={`Add ${variant.name} to cart`}
            sx={{
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: 13,
              px: 2,
              py: 0.75,
              minWidth: 0,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
              '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' },
              '&.Mui-disabled': { background: '#A8A29E', color: '#fff' },
            }}
          >
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </>
      ) : (
        <Chip
          label="Out of stock"
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontSize: 11, fontWeight: 600, flexShrink: 0 }}
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography fontWeight={700} component="span" sx={{ display: 'block', fontSize: 16 }} noWrap>
          {product.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">Select a variant to add to cart</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close"
          sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : variants.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3, fontSize: 14 }}>
            No variants available
          </Typography>
        ) : (
          variants.map((v) => (
            <VariantRow key={v.id} variant={v} onAdd={onAdd} />
          ))
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 600 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Variants Summary (inside card) ──────────────────────────────────────────
function VariantsSummary({ product, onOpen }) {
  const [count,   setCount]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    variantsAPI
      .getByProduct({ product_id: product.id, page: 1, limit: 20 })
      .then((res) => {
        if (!cancelled) {
          const list = res.data?.data?.data ?? [];
          setCount(list.length);
        }
      })
      .catch(() => { if (!cancelled) setCount(0); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [product.id]);

  return (
    <Box
      onClick={count > 0 ? onOpen : undefined}
      sx={{
        px: 2, py: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: count > 0 ? 'pointer' : 'default',
        borderTop: '1px solid #F1F5F9',
        '&:hover': count > 0 ? { bgcolor: '#F8FAFC' } : {},
        transition: 'background 0.15s',
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        Variants
      </Typography>
      {loading ? (
        <CircularProgress size={14} />
      ) : count > 0 ? (
        <Chip
          label={count}
          size="small"
          sx={{ bgcolor: '#1B4332', color: '#fff', fontWeight: 700, height: 22, fontSize: 12, '& .MuiChip-label': { px: 1 } }}
        />
      ) : (
        <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>None</Typography>
      )}
    </Box>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { addToCart } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Normalize API shape
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
        render: `🛒 ${variant.name} added!`,
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
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
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
                height: 220,
                width: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'scale(1.06)' },
              }}
            />
          ) : null}
          <Box
            sx={{
              height: 220,
              display: imageUrl ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #CCEFDB, #E8F5E9)',
              fontSize: 72,
            }}
            role="img"
            aria-label={product.name}
          >
            🛍️
          </Box>
        </Link>

        {/* Product info */}
        <CardContent sx={{ pb: 0.5, pt: 1.5 }}>
          {categoryName && (
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, textTransform: 'uppercase' }}>
              {categoryName}
            </Typography>
          )}
          <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700, color: 'text.primary', mt: 0.25, lineHeight: 1.3,
                '&:hover': { color: 'primary.main' },
              }}
            >
              {product.name}
            </Typography>
          </Link>
          {product.short_description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }} noWrap>
              {product.short_description}
            </Typography>
          )}
        </CardContent>

        {/* Variants summary row */}
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
