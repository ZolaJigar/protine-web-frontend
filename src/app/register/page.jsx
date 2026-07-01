'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, InputAdornment, IconButton,
  CircularProgress, Alert, LinearProgress, Divider,
  Select, MenuItem, MenuList, InputLabel, FormControl,
} from '@mui/material';
import { Email, Lock, Person, Wc, CalendarMonth, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { usersAPI } from '@/lib/api';
import { parseZodErrors } from '@/lib/auth';
import { isValidEmail, isValidPhone, getPasswordStrength } from '@/lib/functions';
import { TextInput } from '@/components/ui';
import PhoneInput from '@/components/PhoneInput';

// Default customer role ID — update if your backend uses a different ID
const CUSTOMER_ROLE_ID = 2;

const strengthConfig = {
  weak:   { color: '#EF4444', bar: 33,  label: 'Weak' },
  medium: { color: '#F59E0B', bar: 66,  label: 'Medium' },
  strong: { color: '#22C55E', bar: 100, label: 'Strong' },
};

// ─── Store illustration ───────────────────────────────────────────────────────
function StoreIllustration() {
  return (
    <svg viewBox="0 0 420 380" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 420, height: 'auto' }}>
      <ellipse cx="210" cy="362" rx="148" ry="13" fill="rgba(0,0,0,0.20)" />
      <rect x="75" y="148" width="270" height="200" rx="6" fill="#ffffff" opacity="0.96" />
      <rect x="84"  y="238" width="116" height="7" rx="3" fill="#92400E" opacity="0.8" />
      <rect x="220" y="238" width="116" height="7" rx="3" fill="#92400E" opacity="0.8" />
      {/* MAGGI */}
      <rect x="88" y="206" width="28" height="32" rx="3" fill="#DC2626" />
      <rect x="88" y="206" width="28" height="11" rx="2" fill="#FBBF24" />
      <text x="102" y="215" textAnchor="middle" fill="#7F1D1D" fontSize="6" fontWeight="900" fontFamily="sans-serif">MAGGI</text>
      <text x="102" y="233" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="700" fontFamily="sans-serif">NOODLES</text>
      {/* KETCHUP */}
      <rect x="122" y="210" width="18" height="28" rx="6" fill="#DC2626" />
      <rect x="126" y="204" width="10" height="8" rx="3" fill="#B91C1C" />
      <rect x="124" y="215" width="14" height="12" rx="2" fill="#FEF2F2" />
      <text x="131" y="222" textAnchor="middle" fill="#B91C1C" fontSize="4.5" fontWeight="800" fontFamily="sans-serif">KEK</text>
      <text x="131" y="226" textAnchor="middle" fill="#B91C1C" fontSize="4" fontWeight="700" fontFamily="sans-serif">CHUP</text>
      {/* MAYO */}
      <rect x="148" y="209" width="22" height="29" rx="5" fill="#FEF3C7" />
      <rect x="148" y="209" width="22" height="29" rx="5" stroke="#D97706" strokeWidth="1.5" />
      <rect x="148" y="209" width="22" height="9" rx="4" fill="#F59E0B" />
      <rect x="150" y="221" width="18" height="12" rx="2" fill="#ffffff" opacity="0.8" />
      <text x="159" y="226" textAnchor="middle" fill="#92400E" fontSize="5" fontWeight="900" fontFamily="sans-serif">MAYO</text>
      {/* PROTEIN TUB */}
      <rect x="224" y="202" width="30" height="36" rx="6" fill="#1B4332" />
      <rect x="224" y="202" width="30" height="11" rx="5" fill="#0D2B1F" />
      <rect x="226" y="216" width="26" height="16" rx="2" fill="#2D6A4F" />
      <text x="239" y="223" textAnchor="middle" fill="#F59E0B" fontSize="6" fontWeight="900" fontFamily="sans-serif">WHEY</text>
      <text x="239" y="229" textAnchor="middle" fill="#d8f3dc" fontSize="5" fontWeight="700" fontFamily="sans-serif">PROTEIN</text>
      {/* MUSTARD */}
      <rect x="260" y="208" width="18" height="30" rx="5" fill="#FCD34D" />
      <rect x="260" y="208" width="18" height="30" rx="5" stroke="#D97706" strokeWidth="1.2" />
      <rect x="262" y="215" width="14" height="12" rx="2" fill="#ffffff" opacity="0.7" />
      <text x="269" y="225" textAnchor="middle" fill="#92400E" fontSize="4" fontWeight="700" fontFamily="sans-serif">TARD</text>
      {/* CHILLI */}
      <rect x="286" y="206" width="20" height="32" rx="5" fill="#7F1D1D" />
      <rect x="288" y="214" width="16" height="14" rx="2" fill="#FEF2F2" opacity="0.9" />
      <polygon points="296,216 294,221 298,221" fill="#DC2626" />
      <text x="296" y="225" textAnchor="middle" fill="#B91C1C" fontSize="4.5" fontWeight="800" fontFamily="sans-serif">CHILLI</text>
      {/* Door */}
      <rect x="172" y="258" width="76" height="90" rx="4" fill="#d8f3dc" />
      <rect x="172" y="258" width="76" height="90" rx="4" stroke="#52b788" strokeWidth="2.5" />
      <circle cx="240" cy="305" r="4" fill="#52b788" />
      <rect x="180" y="266" width="26" height="20" rx="3" fill="#a7f3d0" stroke="#34d399" strokeWidth="1" />
      <rect x="214" y="266" width="26" height="20" rx="3" fill="#a7f3d0" stroke="#34d399" strokeWidth="1" />
      {/* Windows */}
      <rect x="88"  y="160" width="72" height="36" rx="4" fill="#d8f3dc" stroke="#52b788" strokeWidth="2" />
      <rect x="260" y="160" width="72" height="36" rx="4" fill="#d8f3dc" stroke="#52b788" strokeWidth="2" />
      <line x1="124" y1="160" x2="124" y2="196" stroke="#52b788" strokeWidth="1.5" />
      <line x1="88"  y1="178" x2="160" y2="178" stroke="#52b788" strokeWidth="1.5" />
      <line x1="296" y1="160" x2="296" y2="196" stroke="#52b788" strokeWidth="1.5" />
      <line x1="260" y1="178" x2="332" y2="178" stroke="#52b788" strokeWidth="1.5" />
      {/* Awning */}
      <path d="M63 148 L357 148 L345 118 L75 118 Z" fill="#0F172A" />
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <path key={i} d={`M${76+i*29} 118 L${63+i*29} 148 L${77+i*29} 148 L${90+i*29} 118 Z`} fill="#1B4332" opacity="0.6" />
      ))}
      {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
        <ellipse key={i} cx={69+i*28.5} cy="148" rx="13" ry="9" fill="#0F172A" />
      ))}
      {/* Sign */}
      <rect x="68"  y="112" width="284" height="14" rx="4" fill="#0D2B1F" />
      <rect x="130" y="118" width="160" height="26" rx="6" fill="#1B4332" />
      <text x="210" y="136" textAnchor="middle" fill="#F59E0B" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="1">PROTINE STORE</text>
      {/* Boxes */}
      <rect x="32" y="296" width="52" height="48" rx="4" fill="#D97706" opacity="0.85" />
      <line x1="58" y1="296" x2="58" y2="344" stroke="#92400E" strokeWidth="1.5" />
      <line x1="32" y1="320" x2="84" y2="320" stroke="#92400E" strokeWidth="1.5" />
      <rect x="336" y="298" width="52" height="46" rx="4" fill="#D97706" opacity="0.85" />
      <line x1="362" y1="298" x2="362" y2="344" stroke="#92400E" strokeWidth="1.5" />
      <line x1="336" y1="321" x2="388" y2="321" stroke="#92400E" strokeWidth="1.5" />
      {/* Supplement bottle */}
      <rect x="18" y="198" width="22" height="52" rx="8" fill="#2D6A4F" />
      <rect x="18" y="198" width="22" height="16" rx="7" fill="#1B4332" />
      <text x="29" y="228" textAnchor="middle" fill="#FFF8F0" fontSize="5" fontWeight="800" fontFamily="sans-serif">PRO</text>
      {/* Milk carton */}
      <rect x="380" y="200" width="22" height="46" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <polygon points="380,200 391,192 402,200" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="382" y="210" width="18" height="22" rx="2" fill="#DBEAFE" />
      <text x="391" y="219" textAnchor="middle" fill="#1D4ED8" fontSize="5" fontWeight="900" fontFamily="sans-serif">MILK</text>
      {/* Badge */}
      <circle cx="210" cy="104" r="19" fill="#1B4332" />
      <circle cx="210" cy="104" r="19" stroke="#F59E0B" strokeWidth="2.5" />
      <polyline points="202,104 208,111 220,96" stroke="#FFF8F0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Stars */}
      <polygon points="46,110 48,116 54,116 49,120 51,126 46,122 41,126 43,120 38,116 44,116" fill="#F59E0B" opacity="0.9" />
      <polygon points="364,114 365.5,119 371,119 366.5,122 368,127 364,124 360,127 361.5,122 357,119 362.5,119" fill="#F59E0B" opacity="0.65" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', gender: '', dob: '' });
  const [phone, setPhone]       = useState('');
  const [dialCode, setDialCode] = useState('91');
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [generalError, setGeneralError] = useState('');

  const strength = getPasswordStrength(form.password);
  const sc = strengthConfig[strength];

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
    setGeneralError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!phone) errs.phone = 'Phone number is required';
    else if (dialCode === '91' && phone.replace(/\D/g, '').length < 10)
      errs.phone = 'Enter a valid 10-digit mobile number';
    else if (!isValidPhone(phone.replace(/\D/g, '')))
      errs.phone = 'Enter a valid mobile number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const toastId = toast.loading('Creating your account…');
    try {
      // API requires multipart/form-data
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('email', form.email.trim());
      formData.append('password', form.password);
      formData.append('phone', phone.replace(/\D/g, ''));
      formData.append('country_code', `+${dialCode}`);
      formData.append('role_id', CUSTOMER_ROLE_ID);
      if (form.gender) formData.append('gender', form.gender);
      if (form.dob)    formData.append('dob', form.dob);

      await usersAPI.create(formData);

      toast.update(toastId, {
        render: '🎉 Account created! Please log in.',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      router.push('/login');
    } catch (err) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      const data    = err?.response?.data?.data;

      toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: 4000 });

      // 422 — map Zod field errors
      if (status === 422 && Array.isArray(data) && data.length) {
        setErrors(parseZodErrors(data));
      } else {
        setGeneralError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Shared primary button style
  const primaryBtn = {
    py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: 15, borderRadius: '50px',
    background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
    boxShadow: '0 4px 14px rgba(27,67,50,0.35)',
    color: '#FFF8F0',
    '&:hover': { background: 'linear-gradient(135deg, #0D2B1F 0%, #1B4332 100%)', boxShadow: '0 6px 20px rgba(27,67,50,0.45)' },
    '&.Mui-disabled': { background: '#A8A29E', boxShadow: 'none' },
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ══ LEFT PANEL ══ */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: '0 0 50%',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        height: '100vh',
        background: 'linear-gradient(160deg, #060d0a 0%, #0F172A 40%, #1B4332 100%)',
      }}>
        <Box sx={{ position: 'absolute', top: -10, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #F59E0B, #D97706)', zIndex: 10 }} />
        <Box sx={{ position: 'absolute', top: -120, left: -100, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,67,50,0.5) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.05, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

        <Box sx={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column',
          height: '100%',
          px: { md: 4, lg: 5 }, pt: { md: 2.5, lg: 3 }, pb: { md: 2.5, lg: 3 },
          overflow: 'hidden',
        }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_without_bg.png" alt="Protine Web" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
          </Box>

          {/* Floating illustration */}
          <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            flex: 1, minHeight: 0,
            animation: 'storeFloat 5s ease-in-out infinite',
            '@keyframes storeFloat': {
              '0%,100%': { transform: 'translateY(0px)' },
              '50%':     { transform: 'translateY(-14px)' },
            },
            '& svg': { maxHeight: '46vh', width: 'auto' },
          }}>
            <StoreIllustration />
          </Box>

          {/* Copy */}
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontWeight: 800, color: '#FFF8F0', lineHeight: 1.15, mb: 1, fontSize: { md: 24, lg: 30 } }}>
              Join<br />
              <Box component="span" sx={{ color: '#F59E0B' }}>Protine Web</Box>
            </Typography>
            <Typography sx={{ color: 'rgba(255,248,240,0.6)', fontSize: 12.5, lineHeight: 1.6, maxWidth: 360, mb: 1.5 }}>
              Create an account to order premium proteins, sauces &amp; healthy groceries with fast delivery.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {['🥛 Proteins', '🍅 Sauces', '🛒 Easy Orders', '🚚 Fast Delivery'].map(f => (
                <Box key={f} sx={{
                  px: 1.4, py: 0.45, borderRadius: 99,
                  bgcolor: 'rgba(255,248,240,0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#FCD34D', fontSize: 11.5, fontWeight: 600,
                }}>{f}</Box>
              ))}
            </Box>
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255,248,240,0.28)', mt: 1.5, display: 'block' }}>
            © {new Date().getFullYear()} Protine Web
          </Typography>
        </Box>
      </Box>

      {/* ══ RIGHT PANEL ══ */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F1F5F0', p: { xs: 3, sm: 4 }, overflow: 'auto', height: '100vh' }}>
        <Box sx={{ width: '100%', maxWidth: 400, py: 2 }}>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1C1917', mb: 0.4 }}>
            Create your account
          </Typography>
          <Typography variant="body2" sx={{ mb: 2.5, color: '#57534E' }}>
            Join thousands of happy customers today.
          </Typography>

          {generalError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{generalError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Full Name */}
            <TextInput
              label="Full Name *"
              value={form.name}
              autoFocus
              onChange={e => setField('name', e.target.value)}
              error={errors.name}
              placeholder="Enter your full name"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
            />

            {/* Email */}
            <TextInput
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              error={errors.email}
              placeholder="Enter your email address"
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
            />

            {/* Phone */}
            <Box>
              <PhoneInput
                label="Mobile Number *"
                value={phone}
                dialCode={dialCode}
                onChange={(phoneNumber, newDialCode) => {
                  setPhone(phoneNumber);
                  setDialCode(newDialCode);
                  setErrors(prev => ({ ...prev, phone: '' }));
                  setGeneralError('');
                }}
                error={errors.phone}
              />
            </Box>

            {/* Password */}
            <Box>
              <TextInput
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                error={errors.password}
                placeholder="Enter your password (min. 6 characters)"
                slotProps={{ input: {
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small" aria-label="Toggle password visibility">
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}}
              />
              {form.password && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={sc.bar}
                    sx={{
                      borderRadius: 4, height: 5,
                      bgcolor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': { bgcolor: sc.color, borderRadius: 4 },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: sc.color, fontWeight: 600, mt: 0.4, display: 'block' }}>
                    Password strength: {sc.label}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Confirm Password */}
            <TextInput
              label="Confirm Password *"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              slotProps={{ input: {
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(v => !v)} edge="end" size="small" aria-label="Toggle confirm password visibility">
                      {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}}
            />

            {/* Gender + DOB — side by side */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Gender */}
              <FormControl fullWidth>
                <InputLabel id="gender-label" sx={{ '&.Mui-focused': { color: '#1B4332' } }}>
                  Gender
                </InputLabel>
                <Select
                  labelId="gender-label"
                  value={form.gender}
                  onChange={e => setField('gender', e.target.value)}
                  label="Gender"
                  startAdornment={<InputAdornment position="start"><Wc sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>}
                  sx={{
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2D6A4F' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1B4332' },
                  }}
                >
                  <MenuList disablePadding>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </MenuList>
                </Select>
              </FormControl>

              {/* Date of Birth */}
              <TextInput
                label="Date of Birth"
                type="date"
                value={form.dob}
                onChange={e => setField('dob', e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { max: new Date().toISOString().split('T')[0] },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={primaryBtn}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }} />
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#57534E' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#1B4332', fontWeight: 700, textDecoration: 'none' }}>
              Login here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
