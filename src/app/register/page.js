'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Paper, Typography, TextField, Button,
  InputAdornment, IconButton, CircularProgress, LinearProgress,
} from '@mui/material';
import { Email, Lock, Person, Phone, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { authAPI } from '@/lib/api';
import { isValidEmail, isValidPhone, getPasswordStrength, setInStorage } from '@/lib/functions';

const strengthConfig = {
  weak:   { color: 'error',   value: 33,  label: 'Weak' },
  medium: { color: 'warning', value: 66,  label: 'Medium' },
  strong: { color: 'success', value: 100, label: 'Strong' },
};

export default function RegisterPage() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!isValidEmail(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone) errs.phone = 'Phone number is required';
    else if (!isValidPhone(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the highlighted errors to continue.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your account...');
    try {
      const res = await authAPI.register({
        name: form.name, email: form.email, phone: form.phone, password: form.password,
      });
      const { user, accessToken, refreshToken } = res.data;
      setInStorage('accessToken', accessToken);
      setInStorage('refreshToken', refreshToken);
      setInStorage('user', user);
      dispatch({ type: 'SET_USER', payload: user });
      toast.update(toastId, {
        render: `🎉 Welcome to Protine Web, ${user.name || 'User'}!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      router.push('/');
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || 'Registration failed. Please try again.',
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
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #FF8F00 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper sx={{ p: 5, borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/logo_without_bg.png"
              alt="Protine Web"
              sx={{ width: 100, height: 100, objectFit: 'contain', mb: 1, mx: 'auto', display: 'block', filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.15))' }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark' }}>Create Account</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Join Protine Web today</Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!errors.name} helperText={errors.name}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Email Address" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={!!errors.email} helperText={errors.email}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Mobile Number" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={!!errors.phone} helperText={errors.phone}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={!!errors.password} helperText={errors.password}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="Toggle password visibility">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: form.password ? 0.5 : 2 }}
            />
            {form.password && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={strengthConfig[strength].value}
                  color={strengthConfig[strength].color}
                  sx={{ borderRadius: 4, height: 6 }}
                />
                <Typography variant="caption" sx={{ color: `${strengthConfig[strength].color}.main` }}>
                  Password strength: {strengthConfig[strength].label}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth label="Confirm Password" type="password" value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword}
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment> }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', mb: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#2E7D32', fontWeight: 700, textDecoration: 'none' }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
