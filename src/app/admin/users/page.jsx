'use client';

import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, MenuItem,
  InputAdornment, IconButton, CircularProgress, LinearProgress,
  Avatar, Stack, Divider,
} from '@mui/material';
import {
  Person, Email, Lock, Phone, Wc, CalendarMonth,
  Visibility, VisibilityOff, CloudUpload, Badge,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { usersAPI } from '@/lib/api';
import { isValidEmail, isValidPhone, getPasswordStrength } from '@/lib/functions';

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;

const strengthConfig = {
  weak:   { color: 'error',   value: 33,  label: 'Weak' },
  medium: { color: 'warning', value: 66,  label: 'Medium' },
  strong: { color: 'success', value: 100, label: 'Strong' },
};

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  role_id: '',
  gender: '',
  phone: '',
  dob: '',
};

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(form, imageFile) {
  const errs = {};

  // name — required, max 255
  if (!form.name.trim()) {
    errs.name = 'Full name is required';
  } else if (form.name.trim().length > 255) {
    errs.name = 'Name must be 255 characters or fewer';
  }

  // email — required, valid, max 255
  if (!form.email.trim()) {
    errs.email = 'Email is required';
  } else if (!isValidEmail(form.email)) {
    errs.email = 'Enter a valid email address';
  } else if (form.email.length > 255) {
    errs.email = 'Email must be 255 characters or fewer';
  }

  // password — required, min 6
  if (!form.password) {
    errs.password = 'Password is required';
  } else if (form.password.length < 6) {
    errs.password = 'Password must be at least 6 characters';
  }

  // role_id — required, must be a number
  if (!form.role_id && form.role_id !== 0) {
    errs.role_id = 'Role ID is required';
  } else if (isNaN(Number(form.role_id)) || Number(form.role_id) <= 0) {
    errs.role_id = 'Role ID must be a valid positive number';
  }

  // phone — optional, max 20 chars, valid format if provided
  if (form.phone) {
    if (form.phone.length > 20) {
      errs.phone = 'Phone must be 20 characters or fewer';
    } else if (!isValidPhone(form.phone)) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
  }

  // dob — optional, must be YYYY-MM-DD and a past date if provided
  if (form.dob) {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(form.dob)) {
      errs.dob = 'Date of birth must be in YYYY-MM-DD format';
    } else if (new Date(form.dob) >= new Date()) {
      errs.dob = 'Date of birth must be in the past';
    }
  }

  // gender — optional, must be one of the allowed values
  if (form.gender && !GENDER_OPTIONS.includes(form.gender)) {
    errs.gender = 'Gender must be Male, Female, or Other';
  }

  // image — optional, type + size check
  if (imageFile) {
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      errs.image = 'Only JPEG, PNG, GIF, or WebP images are allowed';
    } else if (imageFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      errs.image = `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB`;
    }
  }

  return errs;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminCreateUserPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // clear field error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate immediately for fast feedback
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Only JPEG, PNG, GIF, or WebP images are allowed' }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB` }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, imageFile);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the highlighted errors before submitting.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating user...');

    try {
      // Build FormData — handles both file upload and plain fields
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('email', form.email.trim());
      payload.append('password', form.password);
      payload.append('role_id', Number(form.role_id));
      if (form.gender)  payload.append('gender', form.gender);
      if (form.phone)   payload.append('phone', form.phone.trim());
      if (form.dob)     payload.append('dob', form.dob);
      if (imageFile)    payload.append('image', imageFile);

      const res = await usersAPI.create(payload);
      const { data } = res.data;

      toast.update(toastId, {
        render: `User "${data.name}" created successfully!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      handleReset();
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to create user. Please try again.';

      // Map server-side validation errors back onto fields
      const serverErrs = err.response?.data?.data;
      if (Array.isArray(serverErrs)) {
        const mapped = {};
        serverErrs.forEach(({ path, message }) => {
          if (path?.length) mapped[path[0]] = message;
        });
        if (Object.keys(mapped).length) setErrors(mapped);
      }

      toast.update(toastId, {
        render: serverMessage,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Create User
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add a new user account. Fields marked <strong>*</strong> are required.
      </Typography>

      <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>

          {/* ── Profile Image ── */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar
              src={imagePreview || undefined}
              sx={{ width: 72, height: 72, bgcolor: 'primary.light', fontSize: 32 }}
            >
              {!imagePreview && <Person fontSize="large" />}
            </Avatar>
            <Box>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<CloudUpload />}
                aria-label="Upload profile image"
              >
                Upload Photo
                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                />
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                JPEG, PNG, GIF, or WebP · max {MAX_IMAGE_SIZE_MB} MB
              </Typography>
              {errors.image && (
                <Typography variant="caption" color="error">{errors.image}</Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* ── Required Fields ── */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Required Information
          </Typography>

          {/* Name */}
          <TextField
            fullWidth required
            label="Full Name"
            value={form.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name || `${form.name.length}/255`}
            inputProps={{ maxLength: 255 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> } }}
            sx={{ mb: 2 }}
          />

          {/* Email */}
          <TextField
            fullWidth required
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            inputProps={{ maxLength: 255 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> } }}
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            fullWidth required
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange('password')}
            error={!!errors.password}
            helperText={errors.password || 'Minimum 6 characters'}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="Toggle password visibility">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
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

          {/* Role ID */}
          <TextField
            fullWidth required
            label="Role ID"
            type="number"
            value={form.role_id}
            onChange={handleChange('role_id')}
            error={!!errors.role_id}
            helperText={errors.role_id || 'Must be a valid existing role ID'}
            inputProps={{ min: 1 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Badge color="action" /></InputAdornment> } }}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 3 }} />

          {/* ── Optional Fields ── */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Optional Information
          </Typography>

          {/* Phone */}
          <TextField
            fullWidth
            label="Phone Number"
            value={form.phone}
            onChange={handleChange('phone')}
            error={!!errors.phone}
            helperText={errors.phone || 'Max 20 characters'}
            inputProps={{ maxLength: 20 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> } }}
            sx={{ mb: 2 }}
          />

          {/* Gender */}
          <TextField
            fullWidth select
            label="Gender"
            value={form.gender}
            onChange={handleChange('gender')}
            error={!!errors.gender}
            helperText={errors.gender}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Wc color="action" /></InputAdornment> } }}
            sx={{ mb: 2 }}
          >
            <MenuItem value=""><em>Select gender</em></MenuItem>
            {GENDER_OPTIONS.map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </TextField>

          {/* Date of Birth */}
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={handleChange('dob')}
            error={!!errors.dob}
            helperText={errors.dob || 'Format: YYYY-MM-DD'}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            slotProps={{
              inputLabel: { shrink: true },
              input: { startAdornment: <InputAdornment position="start"><CalendarMonth color="action" /></InputAdornment> },
            }}
            sx={{ mb: 4 }}
          />

          {/* ── Actions ── */}
          <Stack direction="row" spacing={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                flex: 1, py: 1.5, fontWeight: 700, fontSize: 15,
                background: 'linear-gradient(135deg, #4ADE80, #4ADE80)',
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={handleReset}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              Reset
            </Button>
          </Stack>

        </Box>
      </Paper>
    </Box>
  );
}
