'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AppBar, Toolbar, IconButton, Badge, Box, Drawer,
  List, ListItem, ListItemText, ListItemButton, InputBase, Avatar,
  Menu, MenuItem, Divider, useScrollTrigger, Slide, Typography,
} from '@mui/material';
import {
  ShoppingCart, Search, Menu as MenuIcon, Close, AccountCircle,
  Favorite, LocalShipping, Support, Category, Home, Logout, Person,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { getInitials } from '@/lib/functions';

const navLinks = [
  { label: 'Home',       href: '/',           icon: <Home fontSize="small" /> },
  { label: 'Products',   href: '/products',   icon: <Category fontSize="small" /> },
  { label: 'Categories', href: '/categories', icon: <Category fontSize="small" /> },
  { label: 'Orders',     href: '/orders',     icon: <LocalShipping fontSize="small" /> },
  { label: 'Support',    href: '/support',    icon: <Support fontSize="small" /> },
];

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

export default function Navbar() {
  const { state, dispatch, cartCount, wishlistCount } = useApp();
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [anchorEl, setAnchorEl]       = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAccountMenu  = (e) => setAnchorEl(e.currentTarget);
  const handleAccountClose = ()  => setAnchorEl(null);
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    handleAccountClose();
    toast.success('👋 Logged out successfully!');
  };

  return (
    <>
      <HideOnScroll>
        {/* ── Amber golden header — logo pops on this warm background ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: '#FFFFFF',
            borderBottom: '2px solid #D1FAE5',
            boxShadow: '0 2px 12px rgba(22,163,74,0.10)',
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 64, md: 76 } }}>

            {/* Mobile hamburger */}
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { md: 'none' }, color: '#16A34A' }}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box
                component="img"
                src="/logo_without_bg.png"
                alt="Protine Web"
                sx={{
                  height: { xs: 54, md: 68 },
                  width:  { xs: 54, md: 68 },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 3px 10px rgba(27,67,50,0.3))',
                  transition: 'transform 0.25s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              />
            </Link>

            {/* Desktop nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 2 }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      color: '#374151', px: 2, py: 1, borderRadius: '50px',
                      fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                      '&:hover': { background: '#F0FDF4', color: '#16A34A' },
                    }}
                  >
                    {link.label}
                  </Box>
                </Link>
              ))}
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Search bar (desktop) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' }, alignItems: 'center',
                background: '#F0FDF4', borderRadius: '50px',
                px: 2, py: 0.75, gap: 1, width: 220,
                border: '1.5px solid #D1FAE5',
                transition: 'all 0.3s',
                '&:focus-within': { width: 280, background: '#DCFCE7', border: '1.5px solid #16A34A' },
              }}
            >
              <Search sx={{ color: '#4ADE80', fontSize: 20 }} />
              <InputBase
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ color: '#111827', fontSize: 14, '& input::placeholder': { color: '#9CA3AF' } }}
                inputProps={{ 'aria-label': 'Search products' }}
              />
            </Box>

            {/* Mobile search icon */}
            <IconButton onClick={() => setSearchOpen(!searchOpen)} sx={{ display: { md: 'none' }, color: '#16A34A' }} aria-label="Search">
              <Search />
            </IconButton>

            {/* Wishlist */}
            <Link href="/wishlist" style={{ textDecoration: 'none' }}>
              <IconButton sx={{ color: '#16A34A' }} aria-label="Wishlist">
                <Badge badgeContent={wishlistCount} sx={{ '& .MuiBadge-badge': { bgcolor: '#FF6B35', color: '#FFFFFF', fontWeight: 700 } }}>
                  <Favorite />
                </Badge>
              </IconButton>
            </Link>

            {/* Cart */}
            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <IconButton sx={{ color: '#16A34A' }} aria-label={`Cart, ${cartCount} items`}>
                <Badge badgeContent={cartCount} sx={{ '& .MuiBadge-badge': { bgcolor: '#FF6B35', color: '#FFFFFF', fontWeight: 700 } }}>
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Link>

            {/* Account — always shows dropdown */}
            <IconButton onClick={handleAccountMenu} size="small" aria-label="Account menu">
              {state.isAuthenticated ? (
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#16A34A', color: '#FFFFFF', fontWeight: 800, fontSize: 14 }}>
                  {getInitials(state.user?.name || 'U')}
                </Avatar>
              ) : (
                <AccountCircle sx={{ color: '#16A34A', fontSize: 30 }} />
              )}
            </IconButton>

            <Menu
              anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleAccountClose}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 3, mt: 1, minWidth: 210,
                    boxShadow: '0 8px 32px rgba(27,67,50,0.2)',
                    border: '1px solid #E7E5E4',
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {state.isAuthenticated ? [
                /* Logged-in header */
                <Box key="info" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E7E5E4' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16A34A' }}>{state.user?.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#4B5563' }}>{state.user?.email}</Typography>
                </Box>,
                <MenuItem key="profile" component={Link} href="/profile" onClick={handleAccountClose} sx={{ py: 1.25, gap: 1.5, '&:hover': { bgcolor: '#F0FDF4' } }}>
                  <Person fontSize="small" sx={{ color: '#16A34A' }} /> My Profile
                </MenuItem>,
                <MenuItem key="orders" component={Link} href="/orders" onClick={handleAccountClose} sx={{ py: 1.25, gap: 1.5, '&:hover': { bgcolor: '#F0FDF4' } }}>
                  <LocalShipping fontSize="small" sx={{ color: '#16A34A' }} /> My Orders
                </MenuItem>,
                <Divider key="div" />,
                <MenuItem key="logout" onClick={handleLogout} sx={{ py: 1.25, gap: 1.5, color: '#B91C1C', '&:hover': { bgcolor: '#FEE2E2' } }}>
                  <Logout fontSize="small" /> Logout
                </MenuItem>,
              ] : [
                /* Guest header */
                <Box key="guest" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #E7E5E4' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16A34A' }}>Welcome!</Typography>
                  <Typography variant="caption" sx={{ color: '#4B5563' }}>Sign in to your account</Typography>
                </Box>,
                <Box key="btns" sx={{ px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <MenuItem component={Link} href="/login" onClick={handleAccountClose}
                    sx={{ borderRadius: 2, bgcolor: '#16A34A', color: '#FFFFFF', fontWeight: 700, justifyContent: 'center', py: 1.25, '&:hover': { bgcolor: '#15803D' } }}>
                    Login
                  </MenuItem>
                  <MenuItem component={Link} href="/register" onClick={handleAccountClose}
                    sx={{ borderRadius: 2, border: '1.5px solid #16A34A', color: '#16A34A', fontWeight: 700, justifyContent: 'center', py: 1.25, '&:hover': { bgcolor: '#F0FDF4' } }}>
                    Register
                  </MenuItem>
                </Box>,
                <Divider key="div" />,
                <MenuItem key="support" component={Link} href="/support" onClick={handleAccountClose} sx={{ py: 1.25, gap: 1.5, '&:hover': { bgcolor: '#F0FDF4' } }}>
                  <Support fontSize="small" sx={{ color: '#16A34A' }} /> Support
                </MenuItem>,
              ]}
            </Menu>
          </Toolbar>

          {/* Mobile search bar */}
          {searchOpen && (
            <Box sx={{ px: 2, pb: 1.5, display: { md: 'none' } }}>
              <Box sx={{
                display: 'flex', alignItems: 'center',
                background: '#F0FDF4', borderRadius: '50px',
                px: 2, py: 0.75, gap: 1, border: '1.5px solid #16A34A',
              }}>
                <Search sx={{ color: '#4ADE80', fontSize: 20 }} />
                <InputBase autoFocus fullWidth placeholder="Search products..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ color: '#111827', fontSize: 14 }}
                  inputProps={{ 'aria-label': 'Search products' }}
                />
              </Box>
            </Box>
          )}
        </AppBar>
      </HideOnScroll>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, background: '#FFFFFF', minHeight: '100vh' }} role="navigation" aria-label="Mobile navigation">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, background: '#F0FDF4', borderBottom: '2px solid #D1FAE5' }}>
            <Box component="img" src="/logo_without_bg.png" alt="Protine Web" sx={{ height: 52, width: 52, objectFit: 'contain' }} />
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ color: '#16A34A' }}>
              <Close />
            </IconButton>
          </Box>

          <List sx={{ pt: 1 }}>
            {navLinks.map((link) => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton
                  component={Link} href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ py: 1.5, gap: 2, '&:hover': { bgcolor: '#F0FDF4' } }}
                >
                  <Box sx={{ color: '#16A34A' }}>{link.icon}</Box>
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600, color: '#111827' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {state.isAuthenticated ? (
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/profile" onClick={() => setDrawerOpen(false)} sx={{ '&:hover': { bgcolor: '#F0FDF4' } }}>
                  <Person fontSize="small" sx={{ mr: 2, color: '#16A34A' }} />
                  <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { dispatch({ type: 'LOGOUT' }); toast.success('👋 Logged out!'); setDrawerOpen(false); }} sx={{ '&:hover': { bgcolor: '#FEE2E240' } }}>
                  <Logout fontSize="small" sx={{ mr: 2, color: '#B91C1C' }} />
                  <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, color: '#B91C1C' }} />
                </ListItemButton>
              </ListItem>
            </List>
          ) : (
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/login" onClick={() => setDrawerOpen(false)} sx={{ '&:hover': { bgcolor: '#F0FDF4' } }}>
                  <AccountCircle fontSize="small" sx={{ mr: 2, color: '#16A34A' }} />
                  <ListItemText primary="Login / Register" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
}
