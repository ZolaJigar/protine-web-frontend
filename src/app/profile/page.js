'use client';

import { useState } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button, Avatar,
  Divider, List, ListItem, ListItemText, ListItemIcon, Chip, Switch,
} from '@mui/material';
import {
  Person, Email, Phone, LocationOn, Lock, Notifications, Edit, Save,
  ShoppingBag, Star,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { getInitials } from '@/lib/functions';

const notificationItems = [
  'Order updates via WhatsApp',
  'Order updates via Email',
  'Promotional offers and discounts',
  'New product launches',
  'Delivery reminders',
];

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const [tab, setTab]       = useState('profile');
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name:    state.user?.name    || 'Demo User',
    email:   state.user?.email   || 'user@example.com',
    phone:   state.user?.phone   || '9999988888',
    address: '123, Sample Street, Mumbai - 400001',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifications, setNotifications] = useState(
    Object.fromEntries(notificationItems.map((k) => [k, true]))
  );

  const handleSave = () => {
    dispatch({ type: 'SET_USER', payload: { ...state.user, ...profile } });
    setEditing(false);
    toast.success('✅ Profile updated successfully!');
  };

  const handlePasswordUpdate = () => {
    if (!passwords.current)           { toast.error('Enter your current password.');            return; }
    if (passwords.newPass.length < 8) { toast.error('New password must be at least 8 characters.'); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match.'); return; }
    toast.success('🔒 Password updated successfully!');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  const handleNotificationToggle = (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    toast.info(next[key] ? `🔔 "${key}" enabled` : `🔕 "${key}" disabled`, { autoClose: 1800 });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('👋 Logged out successfully!');
  };

  const stats = [
    { icon: <ShoppingBag sx={{ fontSize: 28 }} />, label: 'Orders',    value: 12,  color: '#1B4332' },
    { icon: <Star        sx={{ fontSize: 28 }} />, label: 'Points',    value: 480, color: '#F59E0B' },
    { icon: <LocationOn  sx={{ fontSize: 28 }} />, label: 'Addresses', value: 2,   color: '#1565C0' },
  ];

  const navItems = [
    { key: 'profile',       label: 'My Profile',    icon: <Person fontSize="small" /> },
    { key: 'security',      label: 'Security',      icon: <Lock fontSize="small" /> },
    { key: 'notifications', label: 'Notifications', icon: <Notifications fontSize="small" /> },
  ];

  return (
    <MainLayout>
      {/* ── Banner ── */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: '#F59E0B', color: '#1C1917', fontSize: 28, fontWeight: 800 }}>
              {getInitials(profile.name)}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{profile.name}</Typography>
              <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>{profile.email}</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Stats row — full width ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            width: '100%',
            mb: 4,
          }}
        >
          {stats.map((stat) => (
            <Paper key={stat.label} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Box sx={{ color: stat.color, display: 'flex', justifyContent: 'center', mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: stat.color }}>{stat.value}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{stat.label}</Typography>
            </Paper>
          ))}
        </Box>

        {/* ── Sidebar + content ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
            gap: 3,
            alignItems: 'start',
            width: '100%',
          }}
        >
          {/* Sidebar */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', position: { md: 'sticky' }, top: { md: 88 } }}>
            <List disablePadding>
              {navItems.map((item, i) => (
                <Box key={item.key}>
                  <ListItem
                    button
                    onClick={() => setTab(item.key)}
                    sx={{
                      py: 1.8, px: 2.5, gap: 1.5,
                      bgcolor: tab === item.key ? '#D8F3DC' : 'transparent',
                      borderLeft: tab === item.key ? '4px solid #1B4332' : '4px solid transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#F5F0E8' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ color: tab === item.key ? '#1B4332' : '#57534E' }}>{item.icon}</Box>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: tab === item.key ? 700 : 500, color: tab === item.key ? '#1B4332' : '#57534E', fontSize: 14 }}
                    />
                  </ListItem>
                  {i < navItems.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button fullWidth color="error" variant="outlined" size="small" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Paper>

          {/* ── Content panel ── */}
          <Box sx={{ width: '100%', minWidth: 0 }}>

            {/* Profile tab */}
            {tab === 'profile' && (
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>Personal Information</Typography>
                  <Button
                    startIcon={editing ? <Save /> : <Edit />}
                    variant={editing ? 'contained' : 'outlined'}
                    onClick={editing ? handleSave : () => setEditing(true)}
                  >
                    {editing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </Box>
                {/* 2-col form grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2.5,
                    width: '100%',
                  }}
                >
                  <TextField
                    fullWidth label="Full Name" value={profile.name} disabled={!editing}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}><Person fontSize="small" /></Box> }}
                  />
                  <TextField
                    fullWidth label="Email Address" type="email" value={profile.email} disabled={!editing}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}><Email fontSize="small" /></Box> }}
                  />
                  <TextField
                    fullWidth label="Mobile Number" value={profile.phone} disabled={!editing}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}><Phone fontSize="small" /></Box> }}
                  />
                  <TextField
                    fullWidth label="Address" value={profile.address} disabled={!editing}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}><LocationOn fontSize="small" /></Box> }}
                  />
                </Box>
              </Paper>
            )}

            {/* Security tab */}
            {tab === 'security' && (
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Change Password</Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2.5,
                    width: '100%',
                  }}
                >
                  <TextField
                    fullWidth label="Current Password" type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    sx={{ gridColumn: '1 / -1' }}
                  />
                  <TextField
                    fullWidth label="New Password" type="password"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Confirm New Password" type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </Box>
                <Button
                  variant="contained" onClick={handlePasswordUpdate}
                  sx={{ mt: 3, px: 4 }}
                >
                  Update Password
                </Button>
              </Paper>
            )}

            {/* Notifications tab */}
            {tab === 'notifications' && (
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Notification Preferences</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {notificationItems.map((item) => (
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
                        onChange={() => handleNotificationToggle(item)}
                        color="primary"
                        inputProps={{ 'aria-label': item }}
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
