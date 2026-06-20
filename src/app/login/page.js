'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Paper, Typography, TextField, Button, Divider,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Google } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { authAPI } from '@/lib/api';
import { isValidEmail, setInStorage } from '@/lib/functions';

export default function LoginPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the form errors before submitting.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Logging you in...');
    try {
      const res = await authAPI.login(form);
      const { user, accessToken, refreshToken } = res.data;
      setInStorage('accessToken', accessToken);
      setInStorage('refreshToken', refreshToken);
      setInStorage('user', user);
      dispatch({ type: 'SET_USER', payload: user });
      toast.update(toastId, {
        render: `👋 Welcome back, ${user.name || 'User'}!`,
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      });
      router.push('/');
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || 'Login failed. Please check your credentials.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper sx={{ p: 5, borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/logo_without_bg.png"
              alt="Protine Web"
              sx={{ width: 100, height: 100, objectFit: 'contain', mb: 1, mx: 'auto', display: 'block', filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.15))' }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark' }}>
              Welcome Back!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Login to your Protine Web account
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link href="/forgot-password" style={{ color: '#2E7D32', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5, fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>OR</Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={() => toast.info('Google login coming soon!')}
              sx={{ py: 1.5, mb: 3, borderColor: '#ddd', color: 'text.primary', '&:hover': { borderColor: '#aaa' } }}
            >
              Continue with Google
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: '#2E7D32', fontWeight: 700, textDecoration: 'none' }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
