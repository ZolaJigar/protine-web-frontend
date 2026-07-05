'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box, Typography, Button, InputAdornment, IconButton,
  CircularProgress, Alert, Tabs, Tab, Divider,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, Phone, Sms, ArrowBack, Email } from '@mui/icons-material';
import { toast } from 'react-toastify';
import OtpInput from 'react-otp-input';
import { useApp } from '@/context/AppContext';
import { authAPI } from '@/lib/api';
import { parseZodErrors, sendLoginOtpRequest } from '@/lib/auth';
import { isValidEmail, setInStorage } from '@/lib/functions';
import log from '@/lib/logger';
import { TextInput } from '@/components/ui';
import PhoneInput from '@/components/PhoneInput';

const MODE_IDENTIFIER = 'identifier';
const MODE_PASSWORD   = 'password';
const MODE_OTP        = 'otp';
const TAB_EMAIL = 0;
const TAB_PHONE = 1;

// ΓöÇΓöÇΓöÇ Store illustration ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
      <rect x="148" y="209" width="22" height="29" rx="5" fill="#FFF0EB" />
      <rect x="148" y="209" width="22" height="29" rx="5" stroke="#E5501A" strokeWidth="1.5" />
      <rect x="148" y="209" width="22" height="9" rx="4" fill="#FF6B35" />
      <rect x="150" y="221" width="18" height="12" rx="2" fill="#ffffff" opacity="0.8" />
      <text x="159" y="226" textAnchor="middle" fill="#92400E" fontSize="5" fontWeight="900" fontFamily="sans-serif">MAYO</text>
      {/* PROTEIN TUB */}
      <rect x="224" y="202" width="30" height="36" rx="6" fill="#16A34A" />
      <rect x="224" y="202" width="30" height="11" rx="5" fill="#15803D" />
      <rect x="226" y="216" width="26" height="16" rx="2" fill="#4ADE80" />
      <text x="239" y="223" textAnchor="middle" fill="#FF6B35" fontSize="6" fontWeight="900" fontFamily="sans-serif">WHEY</text>
      <text x="239" y="229" textAnchor="middle" fill="#d8f3dc" fontSize="5" fontWeight="700" fontFamily="sans-serif">PROTEIN</text>
      {/* MUSTARD */}
      <rect x="260" y="208" width="18" height="30" rx="5" fill="#FF8C5A" />
      <rect x="260" y="208" width="18" height="30" rx="5" stroke="#E5501A" strokeWidth="1.2" />
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
      <path d="M63 148 L357 148 L345 118 L75 118 Z" fill="#15803D" />
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <path key={i} d={`M${76+i*29} 118 L${63+i*29} 148 L${77+i*29} 148 L${90+i*29} 118 Z`} fill="#16A34A" opacity="0.6" />
      ))}
      {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
        <ellipse key={i} cx={69+i*28.5} cy="148" rx="13" ry="9" fill="#15803D" />
      ))}
      {/* Sign */}
      <rect x="68"  y="112" width="284" height="14" rx="4" fill="#15803D" />
      <rect x="130" y="118" width="160" height="26" rx="6" fill="#16A34A" />
      <text x="210" y="136" textAnchor="middle" fill="#FF6B35" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="1">PROTINE STORE</text>
      {/* Boxes left */}
      <rect x="32" y="296" width="52" height="48" rx="4" fill="#E5501A" opacity="0.85" />
      <line x1="58" y1="296" x2="58" y2="344" stroke="#92400E" strokeWidth="1.5" />
      <line x1="32" y1="320" x2="84" y2="320" stroke="#92400E" strokeWidth="1.5" />
      {/* Boxes right */}
      <rect x="336" y="298" width="52" height="46" rx="4" fill="#E5501A" opacity="0.85" />
      <line x1="362" y1="298" x2="362" y2="344" stroke="#92400E" strokeWidth="1.5" />
      <line x1="336" y1="321" x2="388" y2="321" stroke="#92400E" strokeWidth="1.5" />
      {/* Supplement bottle */}
      <rect x="18" y="198" width="22" height="52" rx="8" fill="#4ADE80" />
      <rect x="18" y="198" width="22" height="16" rx="7" fill="#16A34A" />
      <text x="29" y="228" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="800" fontFamily="sans-serif">PRO</text>
      {/* Milk carton */}
      <rect x="380" y="200" width="22" height="46" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <polygon points="380,200 391,192 402,200" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="382" y="210" width="18" height="22" rx="2" fill="#DBEAFE" />
      <text x="391" y="219" textAnchor="middle" fill="#1D4ED8" fontSize="5" fontWeight="900" fontFamily="sans-serif">MILK</text>
      {/* Badge */}
      <circle cx="210" cy="104" r="19" fill="#16A34A" />
      <circle cx="210" cy="104" r="19" stroke="#FF6B35" strokeWidth="2.5" />
      <polyline points="202,104 208,111 220,96" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Stars */}
      <polygon points="46,110 48,116 54,116 49,120 51,126 46,122 41,126 43,120 38,116 44,116" fill="#FF6B35" opacity="0.9" />
      <polygon points="364,114 365.5,119 371,119 366.5,122 368,127 364,124 360,127 361.5,122 357,119 362.5,119" fill="#FF6B35" opacity="0.65" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { state, dispatch, mergeGuestCart } = useApp();

  const [tab, setTab]                   = useState(TAB_EMAIL);
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [dialCode, setDialCode]         = useState('91');
  const [mode, setMode]                 = useState(MODE_IDENTIFIER);
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp]                   = useState('');
  const [otpTimer, setOtpTimer]         = useState(0);
  const timerRef                        = useRef(null);
  const [submitting, setSubmitting]     = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [generalError, setGeneralError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (state.isAuthenticated) router.replace('/');
  }, [state.isAuthenticated, router]);

  const startTimer = useCallback(() => {
    setOtpTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const isPhone     = tab === TAB_PHONE;
  const clearErrors = () => { setFieldErrors({}); setGeneralError(''); };

  const validateIdentifier = () => {
    if (!(isPhone ? phone : email).trim()) {
      setFieldErrors({ identifier: isPhone ? 'Phone number is required' : 'Email is required' });
      return false;
    }
    if (isPhone && phone.replace(/\D/g, '').length < 10) {
      setFieldErrors({ identifier: 'Enter a valid 10-digit phone number' });
      return false;
    }
    if (!isPhone && !isValidEmail(email)) {
      setFieldErrors({ identifier: 'Enter a valid email address' });
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    // OTP is phone-only ΓÇö tab must be TAB_PHONE
    clearErrors();
    if (!validateIdentifier()) return;
    setSubmitting(true);
    const toastId = toast.loading('Sending OTPΓÇª');
    try {
      const msg = await sendLoginOtpRequest(phone, `+${dialCode}`);
      toast.update(toastId, { render: msg || 'OTP sent to your registered email', type: 'success', isLoading: false, autoClose: 3000 });
      setMode(MODE_OTP);
      startTimer();
    } catch (err) {
      const m = typeof err === 'string' ? err : err?.response?.data?.message || 'Failed to send OTP';
      toast.update(toastId, { render: m, type: 'error', isLoading: false, autoClose: 4000 });
      setGeneralError(m);
    } finally { setSubmitting(false); }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtp(''); clearErrors(); setSubmitting(true);
    const toastId = toast.loading('Resending OTPΓÇª');
    try {
      const msg = await sendLoginOtpRequest(phone, `+${dialCode}`);
      toast.update(toastId, { render: msg || 'OTP resent', type: 'success', isLoading: false, autoClose: 3000 });
      startTimer();
    } catch (err) {
      toast.update(toastId, { render: err?.response?.data?.message || 'Failed', type: 'error', isLoading: false, autoClose: 4000 });
    } finally { setSubmitting(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault(); clearErrors();
    if (!password) { setFieldErrors({ password: 'Password is required' }); return; }
    setSubmitting(true);
    const toastId = toast.loading('Signing inΓÇª');
    try {
      // Email-only for password login per backend spec
      const res = await authAPI.login({ email, password });
      const { user, token, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setInStorage('user', user);
      // Verify it was actually stored
      const stored = localStorage.getItem('accessToken');
      log.info('AUTH', `Login OK ΓÇö token stored=${!!stored} length=${stored?.length}`, { userId: user.id });
      dispatch({ type: 'SET_USER', payload: user });
      // Merge any guest cart items into the user's cart
      await mergeGuestCart();
      toast.update(toastId, { render: `≡ƒæï Welcome back, ${user.name || 'User'}!`, type: 'success', isLoading: false, autoClose: 2000 });
      router.push('/');
    } catch (err) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || 'Login failed';
      const errors  = err?.response?.data?.data;
      toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: 4000 });
      if (status === 422 && Array.isArray(errors) && errors.length) setFieldErrors(parseZodErrors(errors));
      else setGeneralError(message);
    } finally { setSubmitting(false); }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault(); clearErrors();
    if (otp.length < 6) { setFieldErrors({ otp: 'Enter the 6-digit OTP' }); return; }
    setSubmitting(true);
    const toastId = toast.loading('Verifying OTPΓÇª');
    try {
      const res = await authAPI.verifyLoginOtp({ country_code: `+${dialCode}`, phone, otp });
      const { user, token, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setInStorage('user', user);
      dispatch({ type: 'SET_USER', payload: user });
      // Merge any guest cart items into the user's cart
      await mergeGuestCart();
      toast.update(toastId, { render: `≡ƒæï Welcome back, ${user.name || 'User'}!`, type: 'success', isLoading: false, autoClose: 2000 });
      router.push('/');
    } catch (err) {
      const message = err?.response?.data?.message || 'Invalid OTP';
      toast.update(toastId, { render: message, type: 'error', isLoading: false, autoClose: 4000 });
      setGeneralError(message);
    } finally { setSubmitting(false); }
  };

  const handleBack = () => {
    setMode(MODE_IDENTIFIER); setPassword(''); setOtp(''); clearErrors();
    clearInterval(timerRef.current); setOtpTimer(0);
  };

  const handleTabChange = (_, newTab) => {
    setTab(newTab); setMode(MODE_IDENTIFIER); setEmail(''); setPhone(''); setDialCode('91');
    setPassword(''); setOtp(''); clearErrors();
    clearInterval(timerRef.current); setOtpTimer(0);
  };

  // Shared primary button style
  const primaryBtn = {
    py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: 15, borderRadius: '50px',
    background: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)',
    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
    color: '#FFFFFF',
    '&:hover': { background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)', boxShadow: '0 6px 20px rgba(27,67,50,0.45)' },
    '&.Mui-disabled': { background: '#9CA3AF', boxShadow: 'none' },
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ΓòÉΓòÉ LEFT PANEL ΓòÉΓòÉ */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: '0 0 50%',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        height: '100vh',
        background: 'linear-gradient(160deg, #060d0a 0%, #15803D 40%, #16A34A 100%)',
      }}>
        <Box sx={{ position: 'absolute', top: -10, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #FF6B35, #E5501A)', zIndex: 10 }} />
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
            <Typography sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, mb: 1, fontSize: { md: 24, lg: 30 } }}>
              Welcome to<br />
              <Box component="span" sx={{ color: '#FF6B35' }}>Protine Web</Box>
            </Typography>
            <Typography sx={{ color: 'rgba(255,248,240,0.6)', fontSize: 12.5, lineHeight: 1.6, maxWidth: 360, mb: 1.5 }}>
              Premium proteins, sauces &amp; healthy groceries delivered to your door.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {['≡ƒÑ¢ Proteins', '≡ƒìà Sauces', '≡ƒ¢Æ Easy Orders', '≡ƒÜÜ Fast Delivery'].map(f => (
                <Box key={f} sx={{
                  px: 1.4, py: 0.45, borderRadius: 99,
                  bgcolor: 'rgba(255,248,240,0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#FF8C5A', fontSize: 11.5, fontWeight: 600,
                }}>{f}</Box>
              ))}
            </Box>
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255,248,240,0.28)', mt: 1.5, display: 'block' }}>
            ┬⌐ {new Date().getFullYear()} Protine Web
          </Typography>
        </Box>
      </Box>

      {/* ΓòÉΓòÉ RIGHT PANEL ΓòÉΓòÉ */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F1F5F0', p: { xs: 3, sm: 4 }, overflow: 'hidden', height: '100vh' }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>

          {mode !== MODE_IDENTIFIER && (
            <Button startIcon={<ArrowBack />} onClick={handleBack} size="small"
              sx={{ mb: 1.5, color: '#16A34A', fontWeight: 600, textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', color: '#FF6B35' } }}>
              Back
            </Button>
          )}

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.4 }}>
            {mode === MODE_IDENTIFIER && 'Sign in to your account'}
            {mode === MODE_PASSWORD   && 'Enter your password'}
            {mode === MODE_OTP        && 'Enter verification code'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2.5, color: '#4B5563' }}>
            {mode === MODE_IDENTIFIER && "Welcome back! Choose how you'd like to sign in."}
            {mode === MODE_PASSWORD   && <span>Signing in as <strong style={{ color: '#16A34A' }}>{isPhone ? phone : email}</strong></span>}
            {mode === MODE_OTP        && <span>OTP sent to the email linked with <strong style={{ color: '#16A34A' }}>+{dialCode} {phone}</strong>. Check your inbox.</span>}
          </Typography>

          {generalError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{generalError}</Alert>}

          {/* STEP 1: Identifier */}
          {mode === MODE_IDENTIFIER && (
            <>
              <Tabs value={tab} onChange={handleTabChange} variant="fullWidth"
                sx={{
                  mb: 2, bgcolor: '#E5E7EB', borderRadius: 2, minHeight: 40, p: 0.5,
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': { minHeight: 36, borderRadius: 1.5, fontWeight: 600, fontSize: 13, textTransform: 'none', color: '#4B5563', transition: 'all 0.2s' },
                  '& .Mui-selected': { color: '#16A34A !important', bgcolor: '#fff', boxShadow: '0 1px 4px rgba(27,67,50,0.15)' },
                }}>
                <Tab icon={<Email sx={{ fontSize: 16 }} />} iconPosition="start" label="Email" />
                <Tab icon={<Phone sx={{ fontSize: 16 }} />} iconPosition="start" label="Phone" />
              </Tabs>

              {tab === TAB_EMAIL ? (
                <TextInput label="Email Address" type="email" value={email} autoFocus
                  onChange={e => { setEmail(e.target.value); clearErrors(); }}
                  error={fieldErrors.identifier} placeholder="Enter your email address"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
                  sx={{ mb: 2 }}
                  onKeyDown={e => { if (e.key === 'Enter') { clearErrors(); if (validateIdentifier()) setMode(MODE_PASSWORD); } }}
                />
              ) : (
                <Box sx={{ mb: 2 }}>
                  <PhoneInput label="Phone Number *" value={phone} dialCode={dialCode}
                    onChange={(phoneNumber, newDialCode) => { setPhone(phoneNumber); setDialCode(newDialCode); clearErrors(); }}
                    error={fieldErrors.identifier}
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Email tab ΓÇö password only. Phone tab ΓÇö password + OTP */}
                <Button fullWidth variant="contained" size="large" disabled={submitting} startIcon={<Lock />}
                  onClick={() => { clearErrors(); if (validateIdentifier()) setMode(MODE_PASSWORD); }}
                  sx={primaryBtn}>
                  Continue with Password
                </Button>
                {tab === TAB_PHONE && (
                  <Button fullWidth variant="outlined" size="large" disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Sms />}
                    onClick={handleSendOtp}
                    sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: 15, borderRadius: '50px', borderColor: '#16A34A', color: '#16A34A', borderWidth: '1.5px', '&:hover': { bgcolor: 'rgba(27,67,50,0.06)', borderWidth: '1.5px', borderColor: '#4ADE80' } }}>
                    {submitting ? 'Sending OTPΓÇª' : 'Continue with OTP'}
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2.5 }} />
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#4B5563' }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>
                  Register here
                </Link>
              </Typography>
            </>
          )}

          {/* STEP 2a: Password */}
          {mode === MODE_PASSWORD && (
            <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
              <TextInput label="Password" type={showPassword ? 'text' : 'password'} value={password} autoFocus
                onChange={e => { setPassword(e.target.value); clearErrors(); }}
                error={fieldErrors.password}
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
                sx={{ mb: 1 }}
              />
              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Link href="/forgot-password" style={{ color: '#16A34A', fontSize: 14, fontWeight: 600, textDecoration: 'underline' }}>
                  Forgot Password?
                </Link>
              </Box>
              <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting} sx={primaryBtn}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          )}

          {/* STEP 2b: OTP */}
          {mode === MODE_OTP && (
            <Box component="form" onSubmit={handleOtpSubmit} noValidate>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2.5 }}>
                OTP expires in 10 minutes. Enter the 6-digit code sent to you.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: fieldErrors.otp ? 1 : 3 }}>
                <OtpInput value={otp} onChange={setOtp} numInputs={6} shouldAutoFocus inputType="tel"
                  renderSeparator={<Typography sx={{ mx: 0.4, color: '#CBD5E1', fontSize: 20, userSelect: 'none' }}>ΓÇô</Typography>}
                  renderInput={props => (
                    <input {...props}
                      style={{ width: 46, height: 54, fontSize: 24, fontWeight: 700, textAlign: 'center', border: '1.5px solid #E2E8F0', borderRadius: 10, outline: 'none', background: '#fff', color: '#15803D', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                      onFocus={e => { e.target.style.borderColor = '#16A34A'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.18)'; }}
                      onBlur={e  => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                  )}
                />
              </Box>
              {fieldErrors.otp && (
                <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                  {fieldErrors.otp}
                </Typography>
              )}
              <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting || otp.length < 6} sx={primaryBtn}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Verify & Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2.5 }}>
                {otpTimer > 0
                  ? <Typography variant="body2" color="text.disabled">Resend in <strong style={{ color: '#FF6B35' }}>{otpTimer}s</strong></Typography>
                  : <Typography variant="body2" onClick={submitting ? undefined : handleResendOtp}
                      sx={{ color: '#16A34A', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: '#FF6B35' } }}>
                      Resend OTP
                    </Typography>
                }
              </Box>
            </Box>
          )}

          {mode !== MODE_IDENTIFIER && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9CA3AF' }}>
                ┬⌐ {new Date().getFullYear()} Protine Web
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}