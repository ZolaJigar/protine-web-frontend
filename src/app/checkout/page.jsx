﻿'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Container, Typography, Paper, Button, Divider,
  CircularProgress, Alert, Stepper, Step, StepLabel, Chip,
  TextField, Radio, FormControlLabel, IconButton, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem,
} from '@mui/material';
import {
  LocationOn, LocalOffer, CheckCircle, Add, Edit,
  ArrowForward, ArrowBack, ShoppingCart,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import PhoneInput from '@/components/PhoneInput';
import { useApp } from '@/context/AppContext';
import { usePayment } from '@/hooks/usePayment';
import { addressesAPI, couponsAPI, ordersAPI, locationsAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/functions';

// ΓöÇΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
    .format(Number(v) || 0);

const STEPS = ['Select Address', 'Apply Coupon', 'Confirm & Place'];

// ΓöÇΓöÇΓöÇ Address Card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function AddressCard({ address, selected, onSelect }) {
  return (
    <Paper
      onClick={onSelect}
      elevation={selected ? 4 : 1}
      sx={{
        p: 2.5, borderRadius: 3, cursor: 'pointer', border: '2px solid',
        borderColor: selected ? '#16A34A' : '#E5E7EB',
        bgcolor: selected ? '#F0FDF4' : '#fff',
        transition: 'all 0.2s',
        '&:hover': { borderColor: '#16A34A' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <FormControlLabel
          control={<Radio checked={selected} onChange={onSelect} sx={{ color: '#16A34A', '&.Mui-checked': { color: '#16A34A' }, pt: 0 }} />}
          label=""
          sx={{ m: 0 }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{address.name}</Typography>
            <Chip label={address.address_type} size="small" sx={{ fontSize: 10, height: 18, textTransform: 'capitalize' }} />
            {address.is_default && <Chip label="Default" size="small" color="success" sx={{ fontSize: 10, height: 18 }} />}
          </Box>
          <Typography variant="body2" color="text.secondary">{address.mobile}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {address.address_line_1}
            {address.address_line_2 ? `, ${address.address_line_2}` : ''}
            {address.landmark ? ` (${address.landmark})` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {address.city?.name}, {address.state?.name} ΓÇö {address.postal_code}
          </Typography>
          <Typography variant="body2" color="text.secondary">{address.country?.name}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ΓöÇΓöÇΓöÇ New Address Form ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function AddressForm({ userId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: '', mobile: '', dialCode: '91', email: '',
    address_line_1: '', address_line_2: '', landmark: '',
    postal_code: '', address_type: 'home',
    city_id: '', state_id: '', country_id: '',
  });
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);

  // Location cascades
  const [countries,       setCountries]       = useState([]);
  const [states,          setStates]          = useState([]);
  const [cities,          setCities]          = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates,    setLoadingStates]    = useState(false);
  const [loadingCities,    setLoadingCities]    = useState(false);

  // Load countries once
  useEffect(() => {
    locationsAPI.listCountries({ page: 1, limit: 100 })
      .then((res) => setCountries(res.data?.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!form.country_id) { setStates([]); setCities([]); return; }
    setLoadingStates(true);
    setForm((p) => ({ ...p, state_id: '', city_id: '' }));
    setStates([]); setCities([]);
    locationsAPI.listStates({ country_id: Number(form.country_id), page: 1, limit: 200 })
      .then((res) => setStates(res.data?.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingStates(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country_id]);

  // Load cities when state changes
  useEffect(() => {
    if (!form.state_id) { setCities([]); return; }
    setLoadingCities(true);
    setForm((p) => ({ ...p, city_id: '' }));
    setCities([]);
    locationsAPI.listCities({ state_id: Number(form.state_id), country_id: Number(form.country_id) || undefined, page: 1, limit: 500 })
      .then((res) => setCities(res.data?.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.state_id]);

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    error: !!errors[key],
    helperText: errors[key] || '',
    size: 'small',
    fullWidth: true,
  });

  const handleSave = async () => {
    // Basic client-side validation
    const errs = {};
    if (!form.name.trim())          errs.name           = 'Required';
    if (!form.mobile.trim())        errs.mobile         = 'Required';
    if (!form.address_line_1.trim()) errs.address_line_1 = 'Required';
    if (!form.postal_code.trim())   errs.postal_code    = 'Required';
    if (!form.country_id)           errs.country_id     = 'Required';
    if (!form.state_id)             errs.state_id       = 'Required';
    if (!form.city_id)              errs.city_id        = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        user_id:    userId,
        mobile:     form.mobile, // backend just wants the number; dial code stored separately if needed
        city_id:    Number(form.city_id),
        state_id:   Number(form.state_id),
        country_id: Number(form.country_id),
      };
      delete payload.dialCode;
      const res = await addressesAPI.create(payload);
      onSaved(res.data?.data);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === 'object') {
        setErrors(data.errors);
        toast.error('Please fix the highlighted fields.');
      } else {
        toast.error(data?.message || 'Could not save address.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
      <TextField label="Full Name *" {...field('name')} />
      <PhoneInput
        label="Mobile *"
        value={form.mobile}
        dialCode={form.dialCode}
        onChange={(number, code) => setForm((p) => ({ ...p, mobile: number, dialCode: code }))}
        error={errors.mobile || ''}
      />
      <TextField label="Email" {...field('email')} sx={{ gridColumn: { sm: '1 / -1' } }} />
      <TextField label="Address Line 1 *" {...field('address_line_1')} sx={{ gridColumn: { sm: '1 / -1' } }} />
      <TextField label="Address Line 2" {...field('address_line_2')} sx={{ gridColumn: { sm: '1 / -1' } }} />
      <TextField label="Landmark" {...field('landmark')} sx={{ gridColumn: { sm: '1 / -1' } }} />
      <TextField label="Postal Code *" {...field('postal_code')} slotProps={{ htmlInput: { maxLength: 6 } }} />
      <TextField label="Address Type" {...field('address_type')} select size="small" fullWidth>
        {['home', 'work', 'other'].map((t) => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
      </TextField>

      {/* Country */}
      <TextField
        label="Country *" select size="small" fullWidth
        value={form.country_id} onChange={(e) => setForm((p) => ({ ...p, country_id: e.target.value }))}
        error={!!errors.country_id} helperText={errors.country_id || ''}
        disabled={loadingCountries}
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {loadingCountries
          ? <MenuItem disabled>LoadingΓÇª</MenuItem>
          : countries.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)
        }
      </TextField>

      {/* State */}
      <TextField
        label="State *" select size="small" fullWidth
        value={form.state_id} onChange={(e) => setForm((p) => ({ ...p, state_id: e.target.value }))}
        error={!!errors.state_id} helperText={errors.state_id || ''}
        disabled={!form.country_id || loadingStates}
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {loadingStates
          ? <MenuItem disabled>LoadingΓÇª</MenuItem>
          : states.length === 0
            ? <MenuItem disabled>{form.country_id ? 'No states found' : 'Select country first'}</MenuItem>
            : states.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)
        }
      </TextField>

      {/* City */}
      <TextField
        label="City *" select size="small" fullWidth
        value={form.city_id} onChange={(e) => setForm((p) => ({ ...p, city_id: e.target.value }))}
        error={!!errors.city_id} helperText={errors.city_id || ''}
        disabled={!form.state_id || loadingCities}
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {loadingCities
          ? <MenuItem disabled>LoadingΓÇª</MenuItem>
          : cities.length === 0
            ? <MenuItem disabled>{form.state_id ? 'No cities found' : 'Select state first'}</MenuItem>
            : cities.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)
        }
      </TextField>

      <Box sx={{ gridColumn: { sm: '1 / -1' }, display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
        <Button onClick={onCancel} variant="text" disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ background: 'linear-gradient(135deg, #16A34A, #4ADE80)', '&:hover': { background: '#15803D' } }}>
          Save Address
        </Button>
      </Box>
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Order Summary Sidebar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function OrderSummary({ summary, coupon, items }) {
  const subtotal  = Number(summary.subtotal_amount || 0);
  const discount  = coupon ? Number(coupon.discount_amount || 0) : 0;
  const tax       = Number(summary.tax_amount || 0);
  const shipping  = Number(summary.shipping_amount || 0);
  const total     = subtotal - discount + tax + shipping;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Order Summary</Typography>

      {/* Items list */}
      {items.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {items.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#4B5563', flex: 1 }}>
                {item.product?.name ?? item.product_name}
                {item.productVariant?.name ? ` ΓÇö ${item.productVariant.name}` : ''}
                {' '}<Typography component="span" variant="caption" color="text.disabled">├ù{item.quantity}</Typography>
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                {fmt(item.total_price)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography fontWeight={600}>{fmt(subtotal)}</Typography>
        </Box>
        {discount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">
              Coupon <Chip label={coupon.coupon_code} size="small" sx={{ fontSize: 10, height: 18, ml: 0.5 }} />
            </Typography>
            <Typography fontWeight={600} color="success.main">ΓêÆ {fmt(discount)}</Typography>
          </Box>
        )}
        {tax > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Tax</Typography>
            <Typography fontWeight={600}>{fmt(tax)}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Shipping</Typography>
          <Typography fontWeight={600} color={shipping === 0 ? 'success.main' : 'text.primary'}>
            {shipping === 0 ? 'FREE' : fmt(shipping)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>Total</Typography>
        <Typography variant="h6" fontWeight={900} sx={{ color: '#16A34A' }}>{fmt(total)}</Typography>
      </Box>
    </Paper>
  );
}

// ΓöÇΓöÇΓöÇ Step 1: Address ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function AddressStep({ user, selectedId, onSelect, onSelectObj }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await addressesAPI.list({ user_id: user?.id });
      const list = res.data?.data?.data ?? [];
      setAddresses(list);
      // Auto-select default or first
      if (!selectedId && list.length > 0) {
        const def = list.find((a) => a.is_default) ?? list[0];
        onSelect(def.id);
        onSelectObj?.(def);
      }
    } catch {
      setError('Could not load addresses.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleAddressSaved = (newAddr) => {
    setShowForm(false);
    toast.success('Address saved!');
    load();
    if (newAddr?.id) onSelect(newAddr.id);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={110} />)}
    </Box>
  );

  if (error) return (
    <Alert severity="error" action={<Button size="small" onClick={load}>Retry</Button>}>{error}</Alert>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Saved Addresses</Typography>
        <Button size="small" startIcon={<Add />} onClick={() => setShowForm((p) => !p)}
          sx={{ fontWeight: 600, color: '#16A34A' }}>
          {showForm ? 'Cancel' : 'Add New'}
        </Button>
      </Box>

      {showForm && (
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2, bgcolor: '#F8FAFC' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>New Address</Typography>
          <AddressForm userId={user?.id} onSaved={handleAddressSaved} onCancel={() => setShowForm(false)} />
        </Paper>
      )}

      {addresses.length === 0 && !showForm && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocationOn sx={{ fontSize: 56, color: '#CBD5E1', mb: 1 }} />
          <Typography color="text.secondary">No saved addresses yet. Add one above.</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            selected={selectedId === addr.id}
            onSelect={() => { onSelect(addr.id); onSelectObj?.(addr); }}
          />
        ))}
      </Box>
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Step 2: Coupon ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function CouponStep({ subtotal, appliedCoupon, onApply, onRemove }) {
  const [code, setCode]         = useState(appliedCoupon?.coupon_code ?? '');
  const [validating, setValidating] = useState(false);
  const [available, setAvailable]   = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showList, setShowList]     = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (code === '' && appliedCoupon) setCode(appliedCoupon.coupon_code);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCoupon]);

  const loadAvailable = async () => {
    setLoadingList(true);
    try {
      const res = await couponsAPI.getAvailable();
      setAvailable(res.data?.data?.data ?? []);
      setShowList(true);
    } catch {
      toast.error('Could not load coupons.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleApply = async (couponCode = code) => {
    const trimmed = (couponCode || '').trim().toUpperCase();
    if (!trimmed) { setError('Enter a coupon code.'); return; }
    setValidating(true);
    setError('');
    try {
      const res = await couponsAPI.apply({ coupon_code: trimmed, order_amount: subtotal });
      onApply(res.data?.data);
      toast.success(`Coupon "${trimmed}" applied! You saved ${fmt(res.data?.data?.discount_amount)}`);
      setShowList(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid coupon.';
      setError(msg);
    } finally {
      setValidating(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Have a coupon?</Typography>

      {appliedCoupon ? (
        <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F0FDF4', border: '2px solid #16A34A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOffer sx={{ color: '#16A34A', fontSize: 20 }} />
              <Typography fontWeight={700} color="#16A34A">{appliedCoupon.coupon_code}</Typography>
            </Box>
            <Typography variant="body2" color="#4ADE80" sx={{ mt: 0.5 }}>
              You save {fmt(appliedCoupon.discount_amount)} ΓåÆ Final: {fmt(appliedCoupon.final_amount)}
            </Typography>
          </Box>
          <Button size="small" color="error" onClick={() => { onRemove(); setCode(''); }} sx={{ fontWeight: 700 }}>
            Remove
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
            <TextField
              size="small" fullWidth placeholder="Enter coupon code"
              value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              error={!!error} helperText={error}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              slotProps={{ htmlInput: { style: { textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 } } }}
            />
            <Button variant="contained" onClick={() => handleApply()} disabled={validating || !code.trim()}
              sx={{ px: 3, whiteSpace: 'nowrap', background: '#16A34A', '&:hover': { background: '#15803D' } }}>
              {validating ? <CircularProgress size={18} color="inherit" /> : 'Apply'}
            </Button>
          </Box>
          <Button size="small" onClick={loadAvailable} disabled={loadingList}
            startIcon={loadingList ? <CircularProgress size={14} /> : <LocalOffer />}
            sx={{ color: '#16A34A', fontWeight: 600 }}>
            View available coupons
          </Button>
        </>
      )}

      {showList && available.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {available.map((c) => (
            <Paper key={c.id} sx={{ p: 2, borderRadius: 2, border: '1.5px dashed #CBD5E1' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#16A34A' }}>{c.coupon_code}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.title}</Typography>
                  <Typography variant="caption" color="text.disabled">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `Γé╣${c.discount_value} off`}
                    {c.minimum_order_amount > 0 ? ` ┬╖ Min Γé╣${c.minimum_order_amount}` : ''}
                    {c.end_date ? ` ┬╖ Valid till ${formatDate(c.end_date)}` : ''}
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={() => { setCode(c.coupon_code); handleApply(c.coupon_code); }}
                  sx={{ mt: 0.5, fontSize: 12, color: '#16A34A', borderColor: '#16A34A', '&:hover': { bgcolor: '#F0FDF4' } }}>
                  Apply
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Step 3: Confirm ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function ConfirmStep({ address, coupon, notes, onNotesChange, summary }) {
  const subtotal  = Number(summary.subtotal_amount || 0);
  const discount  = coupon ? Number(coupon.discount_amount || 0) : 0;
  const tax       = Number(summary.tax_amount || 0);
  const shipping  = Number(summary.shipping_amount || 0);
  const total     = subtotal - discount + tax + shipping;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Address review */}
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="overline" sx={{ color: '#FF6B35', fontWeight: 700, letterSpacing: 1.5 }}>
          Delivering To
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>{address?.name}</Typography>
        <Typography variant="body2" color="text.secondary">{address?.mobile}</Typography>
        <Typography variant="body2" color="text.secondary">
          {address?.address_line_1}{address?.address_line_2 ? `, ${address.address_line_2}` : ''}
          {address?.landmark ? ` (${address.landmark})` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {address?.city?.name}, {address?.state?.name} ΓÇö {address?.postal_code}
        </Typography>
      </Paper>

      {/* Coupon summary */}
      {coupon && (
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#F0FDF4', border: '1px solid #4ADE80' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOffer sx={{ color: '#16A34A', fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} color="#16A34A">
              Coupon <strong>{coupon.coupon_code}</strong> applied ΓÇö saving {fmt(discount)}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Amounts */}
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Amount Breakdown</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Subtotal</Typography><Typography>{fmt(subtotal)}</Typography>
          </Box>
          {discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Discount</Typography>
              <Typography color="success.main">ΓêÆ {fmt(discount)}</Typography>
            </Box>
          )}
          {tax > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Tax</Typography><Typography>{fmt(tax)}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Shipping</Typography>
            <Typography color={shipping === 0 ? 'success.main' : 'text.primary'}>
              {shipping === 0 ? 'FREE' : fmt(shipping)}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontWeight={800} variant="subtitle1">Total</Typography>
            <Typography fontWeight={900} variant="subtitle1" sx={{ color: '#16A34A' }}>{fmt(total)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Order notes */}
      <TextField
        label="Order Notes (optional)" multiline rows={2} size="small" fullWidth
        placeholder="e.g. Leave at door, call before deliveryΓÇª"
        value={notes} onChange={(e) => onNotesChange(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 500 } }}
        helperText={`${notes.length}/500`}
      />
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Success Screen ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function OrderSuccess({ order }) {
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 480 }}>
        <CheckCircle sx={{ fontSize: 96, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Order Placed! ≡ƒÄë</Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Your order has been confirmed and will be processed shortly.
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#16A34A', mb: 0.5 }}>
          {order.order_number}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Placed on {formatDate(order.placedAt)}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          <Button
            component={Link} href={`/orders/${order.id}`} variant="contained"
            endIcon={<ArrowForward />}
            sx={{ background: 'linear-gradient(135deg, #16A34A, #4ADE80)', borderRadius: '50px', px: 4, fontWeight: 700 }}>
            Track Order
          </Button>
          <Button component={Link} href="/products" variant="outlined"
            sx={{ borderRadius: '50px', px: 4, fontWeight: 700, borderColor: '#16A34A', color: '#16A34A' }}>
            Continue Shopping
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ΓöÇΓöÇΓöÇ Main Checkout Page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function CheckoutPage() {
  const router          = useRouter();
  const { state, fetchCart } = useApp();
  const user            = state.user;
  const summary         = state.cartSummary;
  const items           = state.cartItems;

  const [activeStep, setActiveStep] = useState(0);

  // Address
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress,   setSelectedAddressObj] = useState(null);

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Notes
  const [notes, setNotes] = useState('');

  // Place order + payment
  const [placing, setPlacing]         = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Payment hook — drives the Razorpay modal lifecycle
  const { initiatePayment, paymentStatus, loading: paymentLoading } = usePayment();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && !state.isAuthenticated) {
      router.replace('/login?redirect=/checkout');
    }
  }, [state.isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!state.isAuthenticated) return;
    if (items.length === 0 && summary.total_items === 0) {
      toast.info('Your cart is empty.');
      router.replace('/cart');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, state.isAuthenticated]);

  const handleAddressSelect = (id, addressObj) => {
    setSelectedAddressId(id);
    if (addressObj) setSelectedAddressObj(addressObj);
  };

  // When address step: load the address object for confirm step preview
  // Capture selected address ID and the full object for the confirm step preview
  const handleAddressIdSelect = (id, addrObj) => {
    setSelectedAddressId(id);
    if (addrObj) setSelectedAddressObj(addrObj);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedAddressId) {
      toast.error('Please select or add a delivery address.');
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address.'); return; }
    setPlacing(true);
    const toastId = toast.loading('Placing your order...');
    try {
      const payload = { address_id: selectedAddressId };
      if (appliedCoupon?.coupon_code) payload.coupon_code = appliedCoupon.coupon_code;
      if (notes.trim()) payload.notes = notes.trim();

      const res = await ordersAPI.place(payload);
      const order = res.data?.data;
      toast.update(toastId, {
        render: `Order ${order.order_number} placed! Opening payment...`,
        type: 'success', isLoading: false, autoClose: 3000,
      });
      await fetchCart(); // clear cart badge
      setPlacedOrder(order);

      // Immediately open Razorpay checkout for the new order
      initiatePayment(order.id);
    } catch (err) {
      const data = err?.response?.data;
      let msg = data?.message || 'Something went wrong. Please try again.';
      // Validation errors - show the first field error
      if (data?.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        msg = data.errors[firstKey] || msg;
      }
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 5000 });

      // Stock errors - go back to cart
      if (msg.toLowerCase().includes('stock') || msg.toLowerCase().includes('available')) {
        setTimeout(() => router.replace('/cart'), 2500);
      }
      // Coupon errors - remove coupon and stay on coupon step
      if (
        msg.toLowerCase().includes('coupon') ||
        msg.toLowerCase().includes('usage limit') ||
        msg.toLowerCase().includes('first order')
      ) {
        setAppliedCoupon(null);
        setActiveStep(1);
      }
    } finally {
      setPlacing(false);
    }
  };

  // After order is placed, show payment status screen while Razorpay modal is active
  if (placedOrder) {
    const isPaying = paymentStatus === 'creating' || paymentStatus === 'pending' || paymentLoading;
    const isFailed = paymentStatus === 'failed';
    return (
      <MainLayout>
        <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 480 }}>
            {isPaying ? (
              <>
                <CircularProgress size={72} sx={{ color: '#FF5722', mb: 3 }} />
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Processing Payment</Typography>
                <Typography color="text.secondary">
                  Complete the payment in the Razorpay window to confirm your order.
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                  Order: {placedOrder.order_number}
                </Typography>
              </>
            ) : isFailed ? (
              <>
                <Box sx={{ fontSize: 72, mb: 2 }}>&#x26A0;&#xFE0F;</Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Payment Not Completed</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Your order <strong>{placedOrder.order_number}</strong> was placed but payment was not completed.
                  You can retry the payment below.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => initiatePayment(placedOrder.id)}
                    sx={{ background: '#FF5722', '&:hover': { background: '#E64A19' }, borderRadius: '50px', px: 4, fontWeight: 700 }}
                  >
                    Retry Payment
                  </Button>
                  <Button component={Link} href={`/orders/${placedOrder.id}`} variant="outlined"
                    sx={{ borderRadius: '50px', px: 4, fontWeight: 700, borderColor: '#16A34A', color: '#16A34A' }}>
                    View Order
                  </Button>
                </Box>
              </>
            ) : (
              <OrderSuccess order={placedOrder} />
            )}
          </Box>
        </Box>
      </MainLayout>
    );
  }

  if (!state.isAuthenticated) return null;

  const stepContent = [
    <AddressStep
      key="addr"
      user={user}
      selectedId={selectedAddressId}
      onSelect={handleAddressIdSelect}
      onSelectObj={setSelectedAddressObj}
    />,
    <CouponStep
      key="coupon"
      subtotal={Number(summary.subtotal_amount || 0)}
      appliedCoupon={appliedCoupon}
      onApply={setAppliedCoupon}
      onRemove={() => setAppliedCoupon(null)}
    />,
    <ConfirmStep
      key="confirm"
      address={selectedAddress}
      coupon={appliedCoupon}
      notes={notes}
      onNotesChange={setNotes}
      summary={summary}
    />,
  ];

  return (
    <MainLayout>
      {/* Banner */}
      <Box className="page-banner" sx={{ py: { xs: 4, md: 5 } }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCart sx={{ fontSize: 26, color: '#FF5722' }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Checkout</Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stepper */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 3, alignItems: 'start' }}>
          {/* Main content */}
          <Box>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 2.5 }}>
              {stepContent[activeStep]}
            </Paper>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined" onClick={handleBack} disabled={activeStep === 0}
                startIcon={<ArrowBack />} sx={{ px: 3, fontWeight: 600 }}>
                Back
              </Button>
              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained" onClick={handleNext} endIcon={<ArrowForward />}
                  sx={{ px: 4, fontWeight: 700 }}>
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained" onClick={handlePlaceOrder} disabled={placing || paymentLoading}
                  startIcon={(placing || paymentLoading) ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                  sx={{ px: 5, fontWeight: 700 }}>
                  {placing ? 'Placing Order...' : paymentLoading ? 'Processing Payment...' : 'Place Order & Pay'}
                </Button>
              )}
            </Box>
          </Box>

          {/* Order summary */}
          <OrderSummary summary={summary} coupon={appliedCoupon} items={items} />
        </Box>
      </Container>
    </MainLayout>
  );
}