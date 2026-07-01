'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button, Avatar,
  Divider, List, ListItem, Chip, Switch, CircularProgress, Alert,
  Skeleton, InputAdornment, IconButton, MenuItem,
} from '@mui/material';
import {
  Person, Email, Phone, Lock, Notifications, Edit, Save,
  ShoppingBag, LocationOn, Visibility, VisibilityOff, CameraAlt,
  Wc, CalendarMonth,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { getInitials, setInStorage } from '@/lib/functions';
import { profileAPI, authAPI, ordersAPI, addressesAPI } from '@/lib/api';

const NOTIFICATION_KEYS = [
  'Order updates via WhatsApp',
  'Order updates via Email',
  'Promotional offers and discounts',
  'New product launches',
  'Delivery reminders',
];

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
];

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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { state, dispatch } = useApp();

  const [tab, setTab] = useState('profile');

  // ── Profile ───────────────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError,   setProfileError]   = useState(null);
  const [editing,        setEditing]        = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', country_code: '', gender: '', dob: '',
  });
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [serverImage,   setServerImage]   = useState(null); // presigned URL from server
  const fileInputRef = useRef(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [orderCount,   setOrderCount]   = useState(null);
  const [addressCount, setAddressCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Security ──────────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({ newPass: '', confirm: '' });
  const [showPwd,   setShowPwd]   = useState({ newPass: false, confirm: false });
  const [pwdStep,   setPwdStep]   = useState('form'); // 'form' | 'otp'
  const [pwdOtp,    setPwdOtp]    = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [pwdSaving,  setPwdSaving]  = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(
    Object.fromEntries(NOTIFICATION_KEYS.map((k) => [k, true]))
  );

  // ── Fetch real profile from server ────────────────────────────────────────
  useEffect(() => {
    profileAPI.get()
      .then((res) => {
        const u = res.data?.data ?? res.data;
        setProfile({
          name:         u.name         ?? '',
          email:        u.email        ?? '',
          phone:        u.phone        ?? '',
          country_code: u.country_code ?? '',
          gender:       u.gender       ?? '',
          dob:          u.dob          ? u.dob.slice(0, 10) : '', // keep YYYY-MM-DD
        });
        setServerImage(u.image ?? null);
        // Sync context so navbar avatar stays fresh
        dispatch({ type: 'SET_USER', payload: u });
        setInStorage('user', u);
      })
      .catch((err) => {
        // Fallback to localStorage user if API fails
        const u = state.user;
        if (u) {
          setProfile({
            name: u.name ?? '', email: u.email ?? '',
            phone: u.phone ?? '', country_code: u.country_code ?? '',
            gender: u.gender ?? '', dob: u.dob ? u.dob.slice(0, 10) : '',
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
      ordersAPI.list({ page: 1, limit: 1 }),
      addressesAPI.list({ page: 1, limit: 1 }),
    ]).then(([ordRes, adrRes]) => {
      if (ordRes.status === 'fulfilled')
        setOrderCount(ordRes.value.data?.data?.count ?? 0);
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
      if (profile.name)         form.append('name',         profile.name);
      if (profile.phone)        form.append('phone',        profile.phone);
      if (profile.country_code) form.append('country_code', profile.country_code);
      if (profile.gender)       form.append('gender',       profile.gender);
      if (profile.dob)          form.append('dob',          profile.dob);
      if (avatarFile)           form.append('image',        avatarFile);

      const res     = await profileAPI.update(form);
      const updated = res.data?.data ?? res.data;

      setProfile({
        name:         updated.name         ?? profile.name,
        email:        updated.email        ?? profile.email,
        phone:        updated.phone        ?? profile.phone,
        country_code: updated.country_code ?? profile.country_code,
        gender:       updated.gender       ?? profile.gender,
        dob:          updated.dob          ? updated.dob.slice(0, 10) : profile.dob,
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
      phone: u.phone ?? '', country_code: u.country_code ?? '',
      gender: u.gender ?? '', dob: u.dob ? u.dob.slice(0, 10) : '',
    });
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!passwords.newPass || passwords.newPass.length < 6) {
      toast.error('New password must be at least 6 characters.'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Passwords do not match.'); return;
    }
    setOtpSending(true);
    const toastId = toast.loading('Sending OTP to your email…');
    try {
      await authAPI.forgotPassword({ email: profile.email });
      toast.update(toastId, { render: 'OTP sent! Check your email.', type: 'success', isLoading: false, autoClose: 3000 });
      setPwdStep('otp');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not send OTP.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3500 });
    } finally {
      setOtpSending(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwdOtp || pwdOtp.length < 4) { toast.error('Enter the OTP.'); return; }
    setPwdSaving(true);
    const toastId = toast.loading('Changing password…');
    try {
      await authAPI.resetPassword({
        email: profile.email, otp: Number(pwdOtp),
        newPassword: passwords.newPass, confirmPassword: passwords.confirm,
      });
      toast.update(toastId, { render: '🔒 Password changed!', type: 'success', isLoading: false, autoClose: 2500 });
      setPasswords({ newPass: '', confirm: '' });
      setPwdOtp(''); setPwdStep('form');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not change password.';
      toast.update(toastId, { render: msg, type: 'error', isLoading: false, autoClose: 3500 });
    } finally {
      setPwdSaving(false);
    }
  };

  // ── Avatar src ────────────────────────────────────────────────────────────
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
    { key: 'profile',       label: 'My Profile',    icon: <Person fontSize="small" /> },
    { key: 'security',      label: 'Security',      icon: <Lock fontSize="small" /> },
    { key: 'notifications', label: 'Notifications', icon: <Notifications fontSize="small" /> },
  ];

  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={avatarSrc ?? undefined}
                sx={{ width: 72, height: 72, bgcolor: '#F59E0B', color: '#1C1917', fontSize: 28, fontWeight: 800 }}
              >
                {getInitials(displayName)}
              </Avatar>
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change avatar"
                sx={{
                  position: 'absolute', bottom: -4, right: -4,
                  bgcolor: '#F59E0B', color: '#1C1917', width: 26, height: 26,
                  '&:hover': { bgcolor: '#D97706' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <CameraAlt sx={{ fontSize: 14 }} />
              </IconButton>
              <input
                ref={fileInputRef} type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                aria-label="Upload profile photo"
              />
            </Box>
            <Box>
              {profileLoading
                ? <Skeleton width={180} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                : <Typography variant="h4" sx={{ fontWeight: 800 }}>{displayName}</Typography>
              }
              {profileLoading
                ? <Skeleton width={140} height={22} sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
                : <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>{profile.email}</Typography>
              }
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 2, mb: 4 }}>
          {stats.map((s) => <StatCard key={s.label} {...s} loading={statsLoading} />)}
        </Box>

        {/* Sidebar + content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, gap: 3, alignItems: 'start' }}>

          {/* Sidebar */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', position: { md: 'sticky' }, top: { md: 88 } }}>
            <List disablePadding>
              {navItems.map((item, i) => (
                <Box key={item.key}>
                  <ListItem
                    disablePadding
                    onClick={() => setTab(item.key)}
                    sx={{
                      py: 1.8, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
                      bgcolor: tab === item.key ? '#D8F3DC' : 'transparent',
                      borderLeft: tab === item.key ? '4px solid #1B4332' : '4px solid transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#F5F0E8' },
                      transition: 'all 0.2s',
                    }}
                  >
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

          {/* Content */}
          <Box sx={{ width: '100%', minWidth: 0 }}>

            {/* ── Profile tab ── */}
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
                      variant={editing ? 'contained' : 'outlined'}
                      disabled={saving}
                      onClick={editing ? handleSave : () => setEditing(true)}
                      sx={editing ? {
                        background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                        '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' },
                      } : {}}
                    >
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
                    {/* Name */}
                    <TextField
                      fullWidth label="Full Name"
                      value={profile.name}
                      disabled={!editing || saving}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                    {/* Email — read only */}
                    <TextField
                      fullWidth label="Email Address"
                      value={profile.email}
                      disabled
                      helperText="Email cannot be changed"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                    {/* Phone */}
                    <TextField
                      fullWidth label="Mobile Number"
                      value={profile.phone}
                      disabled={!editing || saving}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    />
                    {/* Country code */}
                    <TextField
                      fullWidth label="Country Code"
                      value={profile.country_code}
                      disabled={!editing || saving}
                      placeholder="+91"
                      onChange={(e) => setProfile((p) => ({ ...p, country_code: e.target.value }))}
                    />
                    {/* Gender */}
                    <TextField
                      select fullWidth label="Gender"
                      value={profile.gender}
                      disabled={!editing || saving}
                      onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Wc fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
                    >
                      <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                      {GENDER_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                    {/* Date of birth */}
                    <TextField
                      fullWidth label="Date of Birth"
                      type="date"
                      value={profile.dob}
                      disabled={!editing || saving}
                      onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: { startAdornment: <InputAdornment position="start"><CalendarMonth fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> },
                      }}
                    />
                  </Box>
                )}
              </Paper>
            )}

            {/* ── Security tab ── */}
            {tab === 'security' && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Change Password</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  We&apos;ll send a one-time code to <strong>{profile.email}</strong> to verify your identity.
                </Typography>

                {pwdStep === 'form' ? (
                  <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                      {(['newPass', 'confirm'] ).map((key) => (
                        <TextField
                          key={key}
                          fullWidth
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
                    <Button
                      variant="contained"
                      onClick={handleSendOtp}
                      disabled={otpSending || !passwords.newPass || !passwords.confirm}
                      startIcon={otpSending ? <CircularProgress size={16} color="inherit" /> : null}
                      sx={{ mt: 3, px: 4, background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' } }}
                    >
                      {otpSending ? 'Sending OTP…' : 'Send Verification Code'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      A 6-digit code was sent to <strong>{profile.email}</strong>. Enter it below.
                    </Alert>
                    <TextField
                      label="Verification Code"
                      value={pwdOtp}
                      onChange={(e) => setPwdOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                      sx={{ width: 200 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button variant="outlined" onClick={() => { setPwdStep('form'); setPwdOtp(''); }} disabled={pwdSaving}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={pwdSaving || pwdOtp.length < 4}
                        startIcon={pwdSaving ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ px: 4, background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' } }}
                      >
                        {pwdSaving ? 'Changing…' : 'Change Password'}
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            )}

            {/* ── Notifications tab ── */}
            {tab === 'notifications' && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Notification Preferences</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose how you want to be notified.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {NOTIFICATION_KEYS.map((item) => (
                    <Box
                      key={item}
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        py: 2, px: 1,
                        borderBottom: '1px solid #E7E5E4',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip
                          label={notifications[item] ? 'ON' : 'OFF'}
                          color={notifications[item] ? 'success' : 'default'}
                          size="small"
                          sx={{ minWidth: 44, fontWeight: 700 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{item}</Typography>
                      </Box>
                      <Switch
                        checked={notifications[item]}
                        onChange={() => setNotifications((prev) => {
                          const next = { ...prev, [item]: !prev[item] };
                          toast.info(next[item] ? `🔔 "${item}" enabled` : `🔕 "${item}" disabled`, { autoClose: 1800 });
                          return next;
                        })}
                        color="primary"
                        slotProps={{ input: { 'aria-label': item } }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
