'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box, Container, Paper, Typography, TextField, Button,
  InputAdornment, CircularProgress,
} from '@mui/material';
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authAPI } from '@/lib/api';
import { isValidEmail } from '@/lib/functions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setFieldError('Email is required');
      toast.error('Please enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setFieldError('Enter a valid email address');
      toast.error("That email address doesn't look right.");
      return;
    }
    setFieldError('');

    setLoading(true);
    const toastId = toast.loading('Sending reset link...');
    try {
      await authAPI.forgotPassword({ email });
      toast.update(toastId, {
        render: `📧 Reset link sent to ${email}!`,
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      });
      setSent(true);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || 'Failed to send reset email. Try again.',
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
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper sx={{ p: 5, borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
          {sent ? (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Check Your Inbox!</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                We've sent a password reset link to <strong>{email}</strong>.
              </Typography>
              <Button component={Link} href="/login" variant="contained" fullWidth>
                Back to Login
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark' }}>Forgot Password?</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Enter your registered email and we'll send you a reset link.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth label="Email Address" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                  error={!!fieldError} helperText={fieldError}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> } }}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit" fullWidth variant="contained" size="large" disabled={loading}
                  sx={{ py: 1.5, fontWeight: 700, background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                </Button>
                <Button
                  component={Link} href="/login" fullWidth startIcon={<ArrowBack />}
                  sx={{ color: 'text.secondary' }}
                >
                  Back to Login
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
