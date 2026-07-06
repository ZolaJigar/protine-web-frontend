'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar, Toolbar, IconButton, Badge, Box, Drawer,
  List, ListItem, ListItemButton, InputBase, Avatar,
  Menu, MenuItem, Divider, Typography,
} from '@mui/material';
import {
  ShoppingCart, Search, Menu as MenuIcon, Close, AccountCircle,
  Favorite, LocalShipping, Support, GridView, Home, Logout, Person, X,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useApp } from '@/context/AppContext';
import { getInitials } from '@/lib/functions';

const navLinks = [
  { label: 'Home',       href: '/'           },
  { label: 'Products',   href: '/products'   },
  { label: 'Categories', href: '/categories' },
  { label: 'Orders',     href: '/orders'     },
];

export default function Navbar() {
  const pathname = usePathname();
  const { state, dispatch, cartCount, wishlistCount } = useApp();
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [anchorEl, setAnchorEl]       = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleAccountMenu  = (e) => setAnchorEl(e.currentTarget);
  const handleAccountClose = ()  => setAnchorEl(null);
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    handleAccountClose();
    toast.success('Logged out successfully');
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1, minHeight: { xs: 60, md: 68 }, px: { xs: 1.5, md: 3 } }}>

          {/* Mobile hamburger */}
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: 'none' }, color: '#0F0F0F', mr: 0.5 }}
            aria-label="Open navigation menu"
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Box
              component="img"
              src="/logo_without_bg.png"
              alt="Protine Web"
              sx={{
                height: { xs: 38, md: 44 },
                width:  { xs: 38, md: 44 },
                objectFit: 'contain',
              }}
            />
            <Box
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 800,
                fontSize: { sm: 16, md: 18 },
                color: '#0F0F0F',
                letterSpacing: '-0.03em',
              }}
            >
              Protine<Box component="span" sx={{ color: '#FF5722' }}>.</Box>
            </Box>
          </Link>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 3, alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    color: isActive(link.href) ? '#FF5722' : '#525252',
                    px: 1.5, py: 0.75, borderRadius: '6px',
                    fontWeight: isActive(link.href) ? 700 : 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s',
                    position: 'relative',
                    '&:hover': { color: '#0F0F0F', background: '#F5F5F4' },
                  }}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <Box sx={{
                      position: 'absolute', bottom: -2, left: '50%',
                      transform: 'translateX(-50%)',
                      width: 20, height: 2,
                      background: '#FF5722',
                      borderRadius: 2,
                    }} />
                  )}
                </Box>
              </Link>
            ))}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Search — desktop expandable */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {searchOpen ? (
              <Box
                sx={{
                  display: 'flex', alignItems: 'center',
                  background: '#F5F5F4',
                  borderRadius: '8px',
                  px: 1.5, py: 0.6, gap: 0.5,
                  border: '1.5px solid #FF5722',
                  width: 260,
                }}
              >
                <Search sx={{ color: '#A3A3A3', fontSize: 18 }} />
                <InputBase
                  inputRef={searchRef}
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ color: '#0F0F0F', fontSize: '0.875rem', flex: 1 }}
                  inputProps={{ 'aria-label': 'Search products' }}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                />
                {searchQuery && (
                  <IconButton size="small" onClick={() => { setSearchQuery(''); setSearchOpen(false); }} sx={{ p: 0.25 }}>
                    <Close sx={{ fontSize: 16, color: '#A3A3A3' }} />
                  </IconButton>
                )}
              </Box>
            ) : (
              <IconButton
                onClick={() => setSearchOpen(true)}
                sx={{ color: '#525252', '&:hover': { color: '#0F0F0F', background: '#F5F5F4' } }}
                aria-label="Search"
              >
                <Search sx={{ fontSize: 20 }} />
              </IconButton>
            )}
          </Box>

          {/* Mobile search */}
          <IconButton
            onClick={() => setSearchOpen(!searchOpen)}
            sx={{ display: { md: 'none' }, color: '#525252' }}
            aria-label="Search"
          >
            <Search sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Wishlist */}
          <Link href="/wishlist" style={{ textDecoration: 'none' }}>
            <IconButton
              sx={{ color: '#525252', '&:hover': { color: '#0F0F0F', background: '#F5F5F4' } }}
              aria-label="Wishlist"
            >
              <Badge
                badgeContent={wishlistCount}
                sx={{ '& .MuiBadge-badge': { bgcolor: '#FF5722', color: '#FFFFFF', fontSize: '0.65rem', minWidth: 18, height: 18 } }}
              >
                <Favorite sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Link>

          {/* Cart */}
          <Link href="/cart" style={{ textDecoration: 'none' }}>
            <IconButton
              sx={{ color: '#525252', '&:hover': { color: '#0F0F0F', background: '#F5F5F4' } }}
              aria-label={`Cart, ${cartCount} items`}
            >
              <Badge
                badgeContent={cartCount}
                sx={{ '& .MuiBadge-badge': { bgcolor: '#FF5722', color: '#FFFFFF', fontSize: '0.65rem', minWidth: 18, height: 18 } }}
              >
                <ShoppingCart sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Link>

          {/* Account */}
          <IconButton onClick={handleAccountMenu} size="small" sx={{ ml: 0.5 }} aria-label="Account menu">
            {state.isAuthenticated ? (
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0F0F0F', color: '#FFFFFF', fontWeight: 700, fontSize: 13 }}>
                {getInitials(state.user?.name || 'U')}
              </Avatar>
            ) : (
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '1.5px solid #E7E5E4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#525252',
                  '&:hover': { borderColor: '#A3A3A3' },
                }}
              >
                <Person sx={{ fontSize: 18 }} />
              </Box>
            )}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleAccountClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 2, mt: 1, minWidth: 220,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid #E7E5E4',
                  overflow: 'hidden',
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {state.isAuthenticated ? [
              <Box key="info" sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F0F0F' }}>{state.user?.name}</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#737373', mt: 0.25 }}>{state.user?.email}</Typography>
              </Box>,
              <Divider key="div1" />,
              <MenuItem key="profile" component={Link} href="/profile" onClick={handleAccountClose}
                sx={{ py: 1.25, gap: 1.5, fontSize: '0.875rem' }}>
                <Person sx={{ fontSize: 18, color: '#525252' }} /> My Profile
              </MenuItem>,
              <MenuItem key="orders" component={Link} href="/orders" onClick={handleAccountClose}
                sx={{ py: 1.25, gap: 1.5, fontSize: '0.875rem' }}>
                <LocalShipping sx={{ fontSize: 18, color: '#525252' }} /> My Orders
              </MenuItem>,
              <Divider key="div2" />,
              <MenuItem key="logout" onClick={handleLogout}
                sx={{ py: 1.25, gap: 1.5, fontSize: '0.875rem', color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}>
                <Logout sx={{ fontSize: 18 }} /> Sign Out
              </MenuItem>,
            ] : [
              <Box key="guest" sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F0F0F' }}>Welcome</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#737373', mt: 0.25 }}>Sign in to your account</Typography>
              </Box>,
              <Box key="btns" sx={{ px: 2, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MenuItem component={Link} href="/login" onClick={handleAccountClose}
                  sx={{ borderRadius: 1.5, bgcolor: '#0F0F0F', color: '#FFFFFF', fontWeight: 600, justifyContent: 'center', py: 1.25, fontSize: '0.875rem', '&:hover': { bgcolor: '#262626' } }}>
                  Sign In
                </MenuItem>
                <MenuItem component={Link} href="/register" onClick={handleAccountClose}
                  sx={{ borderRadius: 1.5, border: '1.5px solid #E7E5E4', color: '#0F0F0F', fontWeight: 600, justifyContent: 'center', py: 1.25, fontSize: '0.875rem', '&:hover': { bgcolor: '#F5F5F4' } }}>
                  Create Account
                </MenuItem>
              </Box>,
              <Divider key="div" />,
              <MenuItem key="support" component={Link} href="/support" onClick={handleAccountClose}
                sx={{ py: 1.25, gap: 1.5, fontSize: '0.875rem', color: '#525252' }}>
                <Support sx={{ fontSize: 18 }} /> Support
              </MenuItem>,
            ]}
          </Menu>
        </Toolbar>

        {/* Mobile search bar */}
        {searchOpen && (
          <Box sx={{ px: 2, pb: 1.5, display: { md: 'none' } }}>
            <Box sx={{
              display: 'flex', alignItems: 'center',
              background: '#F5F5F4',
              borderRadius: '8px',
              px: 1.5, py: 0.75, gap: 1,
              border: '1.5px solid #FF5722',
            }}>
              <Search sx={{ color: '#A3A3A3', fontSize: 18 }} />
              <InputBase
                autoFocus
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ color: '#0F0F0F', fontSize: '0.875rem' }}
                inputProps={{ 'aria-label': 'Search products' }}
              />
              <IconButton size="small" onClick={() => setSearchOpen(false)} sx={{ p: 0.25 }}>
                <Close sx={{ fontSize: 16, color: '#A3A3A3' }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 280 } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} role="navigation" aria-label="Mobile navigation">
          {/* Header */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2, py: 1.5, borderBottom: '1px solid #E7E5E4',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box component="img" src="/logo_without_bg.png" alt="Protine Web" sx={{ height: 36, width: 36, objectFit: 'contain' }} />
              <Typography sx={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em' }}>
                Protine<Box component="span" sx={{ color: '#FF5722' }}>.</Box>
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" size="small">
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Nav links */}
          <List sx={{ pt: 1, px: 1 }}>
            {navLinks.map((link) => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    py: 1.25, borderRadius: 1.5, mb: 0.25,
                    bgcolor: isActive(link.href) ? 'rgba(255,87,34,0.06)' : 'transparent',
                    color: isActive(link.href) ? '#FF5722' : '#0F0F0F',
                    fontWeight: isActive(link.href) ? 700 : 500,
                    fontSize: '0.9rem',
                    '&:hover': { bgcolor: '#F5F5F4' },
                  }}
                >
                  {link.label}
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ mx: 1 }} />

          <List sx={{ px: 1 }}>
            {state.isAuthenticated ? (
              <>
                <Box sx={{ px: 1.5, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#0F0F0F', fontSize: 14, fontWeight: 700 }}>
                      {getInitials(state.user?.name || 'U')}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{state.user?.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#737373' }}>{state.user?.email}</Typography>
                    </Box>
                  </Box>
                </Box>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/profile" onClick={() => setDrawerOpen(false)}
                    sx={{ borderRadius: 1.5, py: 1.25, fontSize: '0.875rem', '&:hover': { bgcolor: '#F5F5F4' } }}>
                    My Profile
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => { dispatch({ type: 'LOGOUT' }); toast.success('Logged out'); setDrawerOpen(false); }}
                    sx={{ borderRadius: 1.5, py: 1.25, fontSize: '0.875rem', color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                  >
                    Sign Out
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/login" onClick={() => setDrawerOpen(false)}
                    sx={{ borderRadius: 1.5, py: 1.25, fontSize: '0.875rem', bgcolor: '#0F0F0F', color: '#FFFFFF', mx: 0, mb: 1, '&:hover': { bgcolor: '#262626' } }}>
                    Sign In
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/register" onClick={() => setDrawerOpen(false)}
                    sx={{ borderRadius: 1.5, py: 1.25, fontSize: '0.875rem', border: '1.5px solid #E7E5E4', '&:hover': { bgcolor: '#F5F5F4' } }}>
                    Create Account
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>

          {/* Bottom links */}
          <Box sx={{ mt: 'auto', borderTop: '1px solid #E7E5E4', px: 2, py: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                { label: 'Support', href: '/support' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms',   href: '/terms'   },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setDrawerOpen(false)}
                  style={{ fontSize: 12, color: '#737373', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              ))}
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
