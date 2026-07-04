'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button, Avatar,
  Divider, List, ListItem, CircularProgress, Alert,
  Skeleton, InputAdornment, IconButton, MenuItem, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox,
} from '@mui/material';
import {
  Person, Email, Lock, Edit, Save,
  ShoppingBag, LocationOn, Visibility, VisibilityOff, CameraAlt,
  Wc, CalendarMonth, Add, Delete, Home, Work, Place,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import PhoneInput from '@/components/PhoneInput';
import { useApp } from '@/context/AppContext';
import { getInitials, setInStorage } from '@/lib/functions';
import { profileAPI, ordersAPI, addressesAPI, locationsAPI } from '@/lib/api';

const GENDER_OPTIONS = [
  { value: 'Male',   label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other',  label: 'Other' },
];

const EMPTY_ADDR_FORM = {
  name: '', mobile: '', dialCode: '91', email: '',
  address_line_1: '', address_line_2: '', landmark: '',
  postal_code: '', address_type: 'home', is_default: false,
  city_id: '', state_id: '', country_id: '',
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, loading }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
      <Box sx={{ color, display: 'flex', justifyContent: 'center', mb: 1 }}>{icon}</Box>
      {loading
        ? <Skeleton width={48} height={40} sx={{ mx: 'auto' }} />
        : <Typography variant="h4" sx={{ fontWeight: 900, color }}>{value ?? '—'}</Typography>
      }
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
    </Paper>
  );
}

// ─── Address Form Dialog ──────────────────────────────────────────────────────
function AddressFormDialog({ open, userId, editData, onSaved, onClose }) {
  const [form, setForm]     = useState(EMPTY_ADDR_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [countries, setCountries]             = useState([]);
  const [states,    setStates]                = useState([]);
  const [cities,    setCities]                = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates,    setLoadingStates]    = useState(false);
  const [loadingCities,    setLoadingCities]    = useState(false);

  // Load countries once
  useEffect(() => {
    locationsAPI.listCountries({ page: 1, limit: 100 })
      .then((r) => setCountries(r.data?.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (!open) return;
    if (editData) {
      setForm({
        name:           editData.name           ?? '',
        mobile:         editData.mobile         ?? '',
        dialCode:       '91',
        email:          editData.email          ?? '',
        address_line_1: editData.address_line_1 ?? '',
        address_line_2: editData.address_line_2 ?? '',
        landmark:       editData.landmark       ?? '',
        postal_code:    editData.postal_code    ?? '',
        address_type:   editData.address_type   ?? 'home',
        is_default:     !!editData.is_default,
        city_id:        editData.city?.id    ?? editData.city_id    ?? '',
        state_id:       editData.state?.id   ?? editData.state_id   ?? '',
        country_id:     editData.country?.id ?? editData.country_id ?? '',
      });
    } else {
      setForm(EMPTY_ADDR_FORM);
    }
    setErrors({});
  }, [open, editData]);

  // States when country changes
  useEffect(() => {
    if (!form.country_id) { setStates([]); setCities([]); return; }
    setLoadingStates(true);
    locationsAPI.listStates({ country_id: Number(form.country_id), page: 1, limit: 200 })
      .then((r) => setStates(r.data?.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingStates(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country_id]);

  // Cities when state changes
  useEffect(() => {
    if (!form.state_id) { setCities([]); return; }
    setLoadingCities(true);
    locationsAPI.listCities({ state_id: Number(form.state_id), country_id: Number(form.country_id) || undefined, page: 1, limit: 500 })
      .then((r) => setCities(r.data?.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.state_id]);

  const f = (key) => ({
    value: form[key], size: 'small', fullWidth: true,
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    error: !!errors[key], helperText: errors[key] || '',
  });

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim())            errs.name           = 'Required';
    if (!form.mobile.trim())          errs.mobile         = 'Required';
    if (!form.address_line_1.trim())  errs.address_line_1 = 'Required';
    if (!form.postal_code.trim())     errs.postal_code    = 'Required';
    if (!form.country_id)             errs.country_id     = 'Required';
    if (!form.state_id)               errs.state_id       = 'Required';
    if (!form.city_id)                errs.city_id        = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setErrors({});
    try {
      const payload = {
        user_id:        userId,
        name:           form.name,
        mobile:         form.mobile,
        email:          form.email   || undefined,
        address_line_1: form.address_line_1,
        address_line_2: form.address_line_2 || undefined,
        landmark:       form.landmark       || undefined,
        postal_code:    form.postal_code,
        address_type:   form.address_type,
        is_default:     form.is_default,
        city_id:        Number(form.city_id),
        state_id:       Number(form.state_id),
        country_id:     Number(form.country_id),
      };
      let res;
      if (editData?.id) {
        res = await addressesAPI.update(editData.id, payload);
      } else {
        res = await addressesAPI.create(payload);
      }
      onSaved(res.data?.data);
      toast.success(editData?.id ? 'Address updated!' : 'Address added!');
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editData?.id ? 'Edit Address' : 'Add New Address'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
          <TextField label="Full Name *" {...f('name')} />
          <PhoneInput
            label="Mobile *"
            value={form.mobile} dialCode={form.dialCode}
            onChange={(num, code) => setForm((p) => ({ ...p, mobile: num, dialCode: code }))}
            error={errors.mobile || ''}
          />
          <TextField label="Email" {...f('email')} sx={{ gridColumn: { sm: '1 / -1' } }} />
          <TextField label="Address Line 1 *" {...f('address_line_1')} sx={{ gridColumn: { sm: '1 / -1' } }} />
          <TextField label="Address Line 2" {...f('address_line_2')} sx={{ gridColumn: { sm: '1 / -1' } }} />
          <TextField label="Landmark" {...f('landmark')} sx={{ gridColumn: { sm: '1 / -1' } }} />
          <TextField label="Postal Code *" {...f('postal_code')} slotProps={{ htmlInput: { maxLength: 10 } }} />
          <TextField label="Address Type" select size="small" fullWidth
            value={form.address_type}
            onChange={(e) => setForm((p) => ({ ...p, address_type: e.target.value }))}>
            {['home', 'work', 'other'].map((t) => (
              <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField label="Country *" select size="small" fullWidth
            value={form.country_id} onChange={(e) => setForm((p) => ({ ...p, country_id: e.target.value, state_id: '', city_id: '' }))}
            error={!!errors.country_id} helperText={errors.country_id || ''}
            disabled={loadingCountries} slotProps={{ inputLabel: { shrink: true } }}>
            {loadingCountries ? <MenuItem disabled>Loading…</MenuItem>
              : countries.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField label="State *" select size="small" fullWidth
            value={form.state_id} onChange={(e) => setForm((p) => ({ ...p, state_id: e.target.value, city_id: '' }))}
            error={!!errors.state_id} helperText={errors.state_id || ''}
            disabled={!form.country_id || loadingStates} slotProps={{ inputLabel: { shrink: true } }}>
            {loadingStates ? <MenuItem disabled>Loading…</MenuItem>
              : states.length === 0 ? <MenuItem disabled>{form.country_id ? 'No states' : 'Select country first'}</MenuItem>
              : states.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="City *" select size="small" fullWidth
            value={form.city_id} onChange={(e) => setForm((p) => ({ ...p, city_id: e.target.value }))}
            error={!!errors.city_id} helperText={errors.city_id || ''}
            disabled={!form.state_id || loadingCities} slotProps={{ inputLabel: { shrink: true } }}>
            {loadingCities ? <MenuItem disabled>Loading…</MenuItem>
              : cities.length === 0 ? <MenuItem disabled>{form.state_id ? 'No cities' : 'Select state first'}</MenuItem>
              : cities.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
            <FormControlLabel
              control={<Checkbox checked={form.is_default} onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))} sx={{ color: '#1B4332', '&.Mui-checked': { color: '#1B4332' } }} />}
              label={<Typography variant="body2" fontWeight={600}>Set as default address</Typography>}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', '&:hover': { background: '#0D2B1F' } }}>
          {saving ? 'Saving…' : editData?.id ? 'Update Address' : 'Save Address'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────
function AddressesTab({ userId }) {
  const [addresses, setAddresses]   = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData,   setEditData]   = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await addressesAPI.list({ user_id: userId });
      setAddresses(res.data?.data?.data ?? []);
    } catch {
      setError('Could not load addresses.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    setDeleting(id);
    try {
      await addressesAPI.delete(id);
      toast.success('Address deleted.');
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete address.');
    } finally {
      setDeleting(null);
    }
  };

  const typeIcon = (type) => {
    if (type === 'work')  return <Work   sx={{ fontSize: 16, color: '#1565C0' }} />;
    if (type === 'home')  return <Home   sx={{ fontSize: 16, color: '#1B4332' }} />;
    return                       <Place  sx={{ fontSize: 16, color: '#78716C' }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography variant="h6" fontWeight={700}>My Addresses</Typography>
        <Button variant="contained" startIcon={<Add />}
          onClick={() => { setEditData(null); setDialogOpen(true); }}
          sx={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', borderRadius: '50px', fontWeight: 700, '&:hover': { background: '#0D2B1F' } }}>
          Add Address
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : error ? (
        <Alert severity="error" action={<Button size="small" onClick={load}>Retry</Button>}>{error}</Alert>
      ) : addresses.length === 0 ? (
        <Paper sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <LocationOn sx={{ fontSize: 64, color: '#CBD5E1', mb: 1 }} />
          <Typography color="text.secondary" fontWeight={500}>No addresses yet. Add one to get started.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {addresses.map((addr) => (
            <Paper key={addr.id} sx={{ p: 2.5, borderRadius: 3, border: addr.is_default ? '2px solid #1B4332' : '1px solid #E7E5E4' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{addr.name}</Typography>
                    <Chip icon={typeIcon(addr.address_type)} label={addr.address_type} size="small"
                      sx={{ fontSize: 10, height: 20, textTransform: 'capitalize' }} />
                    {addr.is_default && <Chip label="Default" size="small" color="success" sx={{ fontSize: 10, height: 20, fontWeight: 700 }} />}
                  </Box>
                  <Typography variant="body2" color="text.secondary">{addr.mobile}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
                    {addr.landmark ? ` (${addr.landmark})` : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {addr.city?.name}, {addr.state?.name} — {addr.postal_code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{addr.country?.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  <IconButton size="small" onClick={() => { setEditData(addr); setDialogOpen(true); }}
                    sx={{ color: '#1B4332', bgcolor: '#D8F3DC', '&:hover': { bgcolor: '#B7E4C7' } }}
                    aria-label={`Edit address for ${addr.name}`}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(addr.id)} disabled={deleting === addr.id}
                    sx={{ color: '#EF4444', bgcolor: '#FEE2E2', '&:hover': { bgcolor: '#FECACA' } }}
                    aria-label={`Delete address for ${addr.name}`}>
                    {deleting === addr.id ? <CircularProgress size={16} color="inherit" /> : <Delete fontSize="small" />}
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <AddressFormDialog
        open={dialogOpen}
        userId={userId}
        editData={editData}
        onSaved={() => { setDialogOpen(false); load(); }}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState('profile');

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError,   setProfileError]   = useState(null);
  const [editing,        setEditing]        = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', dialCode: '91', gender: '', date_of_birth: '',
  });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [serverImage,   setServerImage]   = useState(null);
  const fileInputRef = useRef(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [orderCount,   setOrderCount]   = useState(null);
  const [addressCount, setAddressCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Security state ────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ newPass: '', confirm: '' });
  const [showPwd,   setShowPwd]   = useState({ newPass: false, confirm: false });
  const [pwdSaving, setPwdSaving] = useState(false);

  // ── Fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    profileAPI.get()
      .then((res) => {
        const u = res.data?.data ?? res.data;
        setProfile({
          name:          u.name          ?? '',
          email:         u.email         ?? '',
          phone:         u.phone         ?? '',
          dialCode:      u.country_code  ? u.country_code.replace('+', '') : '91',
          gender:        u.gender        ?? '',
          date_of_birth: u.date_of_birth ? u.date_of_birth.slice(0, 10) : '',
        });
        setServerImage(u.image ?? null);
        dispatch({ type: 'SET_USER', payload: u });
        setInStorage('user', u);
      })
      .catch((err) => {
        const u = state.user;
        if (u) {
          setProfile({
            name: u.name ?? '', email: u.email ?? '',
            phone: u.phone ?? '', dialCode: u.country_code ? u.country_code.replace('+', '') : '91',
            gender: u.gender ?? '', date_of_birth: u.date_of_birth ? u.date_of_birth.slice(0, 10) : '',
          });
          setServerImage(u.image ?? null);
        } else {
          setProfileError(err?.response?.data?.message || 'Could not load profile.');
        }
      })
      .finally(() => setProfileLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.allSettled([
      ordersAPI.dashboard(),
      addressesAPI.list({ page: 1, limit: 1 }),
    ]).then(([ordRes, adrRes]) => {
      if (ordRes.status === 'fulfilled')
        setOrderCount(ordRes.value.data?.data?.totalOrders ?? 0);
      if (adrRes.status === 'fulfilled')
        setAddressCount(adrRes.value.data?.data?.count ?? 0);
    }).finally(() => setStatsLoading(false));
  }, []);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setEditing(true);
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving profile…');
    try {
      const form = new FormData();
      if (profile.name)          form.append('name',          profile.name);
      if (profile.phone)         form.append('phone',         profile.phone);
      if (profile.dialCode)      form.append('country_code',  `+${profile.dialCode}`);
      if (profile.gender)        form.append('gender',        profile.gender);
      if (profile.date_of_birth) form.append('date_of_birth', profile.date_of_birth);
      if (avatarFile)            form.append('image',         avatarFile);

      const res     = await profileAPI.update(form);
      const updated = res.data?.data ?? res.data;
      setProfile({
        name:          updated.name          ?? profile.name,
        email:         updated.email         ?? profile.email,
        phone:         updated.phone         ?? profile.phone,
        dialCode:      updated.country_code  ? updated.country_code.replace('+', '') : profile.dialCode,
        gender:        updated.gender        ?? profile.gender,
        date_of_birth: updated.date_of_birth ? updated.date_of_birth.slice(0, 10) : profile.date_of_birth,
      });
      setServerImage(updated.image ?? serverImage);
      if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); }
      setAvatarFile(null);
      dispatch({ type: 'SET_USER', payload: updated });
      setInStorage('user', updated);
      setEditing(false);
      toast.update(toastId, { render: '✅ Profile updated!', type: 'success', isLoading: false, autoClose: 2500 });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not save profile.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3500 });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); }
    const u = state.user;
    if (u) setProfile({
      name: u.name ?? '', email: u.email ?? '',
      phone: u.phone ?? '', dialCode: u.country_code ? u.country_code.replace('+', '') : '91',
      gender: u.gender ?? '', date_of_birth: u.date_of_birth ? u.date_of_birth.slice(0, 10) : '',
    });
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passwords.newPass || passwords.newPass.length < 6) {
      toast.error('New password must be at least 6 characters.'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Passwords do not match.'); return;
    }
    setPwdSaving(true);
    const toastId = toast.loading('Changing password…');
    try {
      await profileAPI.changePassword({ newPassword: passwords.newPass });
      toast.update(toastId, { render: '🔒 Password changed!', type: 'success', isLoading: false, autoClose: 2500 });
      setPasswords({ newPass: '', confirm: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not change password.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3500 });
    } finally {
      setPwdSaving(false);
    }
  };

  const storageBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';
  const avatarSrc   = avatarPreview
    ?? (serverImage
      ? serverImage.startsWith('http') ? serverImage : `${storageBase}/${serverImage}`
      : null);
  const displayName = profile.name || state.user?.name || '…';

  const stats = [
    { icon: <ShoppingBag sx={{ fontSize: 28 }} />, label: 'Orders',    value: orderCount,   color: '#1B4332' },
    { icon: <LocationOn  sx={{ fontSize: 28 }} />, label: 'Addresses', value: addressCount, color: '#1565C0' },
  ];

  const navItems = [
    { key: 'profile',   label: 'My Profile', icon: <Person   fontSize="small" /> },
    { key: 'addresses', label: 'Addresses',  icon: <LocationOn fontSize="small" /> },
    { key: 'security',  label: 'Security',   icon: <Lock     fontSize="small" /> },
  ];

  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar src={avatarSrc ?? undefined}
                sx={{ width: 72, height: 72, bgcolor: '#F59E0B', color: '#1C1917', fontSize: 28, fontWeight: 800 }}>
                {getInitials(displayName)}
              </Avatar>
              <IconButton size="small" onClick={() => fileInputRef.current?.click()} aria-label="Change avatar"
                sx={{ position: 'absolute', bottom: -4, right: -4, bgcolor: '#F59E0B', color: '#1C1917', width: 26, height: 26, '&:hover': { bgcolor: '#D97706' }, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                <CameraAlt sx={{ fontSize: 14 }} />
              </IconButton>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }} onChange={handleAvatarChange} aria-label="Upload profile photo" />
            </Box>
            <Box>
              {profileLoading
                ? <Skeleton width={180} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                : <Typography variant="h4" sx={{ fontWeight: 800 }}>{displayName}</Typography>}
              {profileLoading
                ? <Skeleton width={140} height={22} sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
                : <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>{profile.email}</Typography>}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Sidebar + content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, gap: 3, alignItems: 'start' }}>

          {/* Sidebar nav */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', position: { md: 'sticky' }, top: { md: 88 } }}>
            <List disablePadding>
              {navItems.map((item, i) => (
                <Box key={item.key}>
                  <ListItem disablePadding onClick={() => setTab(item.key)}
                    sx={{
                      py: 1.8, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
                      bgcolor: tab === item.key ? '#D8F3DC' : 'transparent',
                      borderLeft: tab === item.key ? '4px solid #1B4332' : '4px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#F5F0E8' },
                    }}>
                    <Box sx={{ color: tab === item.key ? '#1B4332' : '#57534E', display: 'flex' }}>{item.icon}</Box>
                    <Typography variant="body2" sx={{ fontWeight: tab === item.key ? 700 : 500, color: tab === item.key ? '#1B4332' : '#57534E', fontSize: 14 }}>
                      {item.label}
                    </Typography>
                  </ListItem>
                  {i < navItems.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button fullWidth color="error" variant="outlined" size="small" onClick={() => dispatch({ type: 'LOGOUT' })}>
                Logout
              </Button>
            </Box>
          </Paper>

          {/* Content area */}
          <Box sx={{ width: '100%', minWidth: 0 }}>

            {/* ── My Profile tab ── */}
            {tab === 'profile' && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Personal Information</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {editing && (
                      <Button variant="text" onClick={handleCancelEdit} disabled={saving} sx={{ color: 'text.secondary' }}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : editing ? <Save /> : <Edit />}
                      variant={editing ? 'contained' : 'outlined'} disabled={saving}
                      onClick={editing ? handleSave : () => setEditing(true)}
                      sx={editing ? { background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', '&:hover': { background: '#0D2B1F' } } : {}}>
                      {saving ? 'Saving…' : editing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </Box>
                </Box>

                {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

                {profileLoading ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    {[1,2,3,4,5].map((i) => <Skeleton key={i} height={56} variant="rounded" sx={{ borderRadius: 2 }} />)}
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    <TextField fullWidth label="Full Name"
                      value={profile.name} disabled={!editing || saving}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                    <TextField fullWidth label="Email Address"
                      value={profile.email} disabled
                      helperText="Email cannot be changed"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                    <PhoneInput label="Mobile Number"
                      value={profile.phone} dialCode={profile.dialCode}
                      onChange={(num, code) => setProfile((p) => ({ ...p, phone: num, dialCode: code }))}
                      error="" disabled={!editing || saving}
                    />
                    <TextField select fullWidth label="Gender"
                      value={profile.gender} disabled={!editing || saving}
                      onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Wc fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}>
                      <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                      {GENDER_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                    <TextField fullWidth label="Date of Birth" type="date"
                      value={profile.date_of_birth} disabled={!editing || saving}
                      onChange={(e) => setProfile((p) => ({ ...p, date_of_birth: e.target.value }))}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: { startAdornment: <InputAdornment position="start"><CalendarMonth fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            )}

            {/* ── Addresses tab ── */}
            {tab === 'addresses' && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <AddressesTab userId={state.user?.id} />
              </Paper>
            )}

            {/* ── Security tab ── */}
            {tab === 'security' && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Change Password</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter a new password for your account.
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {(['newPass', 'confirm']).map((key) => (
                    <TextField key={key} fullWidth
                      label={key === 'newPass' ? 'New Password' : 'Confirm New Password'}
                      type={showPwd[key] ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                      slotProps={{ input: { endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPwd((s) => ({ ...s, [key]: !s[key] }))} edge="end">
                            {showPwd[key] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )}}}
                    />
                  ))}
                </Box>
                <Button variant="contained" onClick={handleChangePassword}
                  disabled={pwdSaving || !passwords.newPass || !passwords.confirm}
                  startIcon={pwdSaving ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={{ mt: 3, px: 4, background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', '&:hover': { background: '#0D2B1F' } }}>
                  {pwdSaving ? 'Changing…' : 'Change Password'}
                </Button>
              </Paper>
            )}

          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
