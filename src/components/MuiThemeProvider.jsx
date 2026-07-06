'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import createEmotionCache from '@/lib/emotionCache';

const theme = createTheme({
  palette: {
    primary: {
      main:         '#FF5722',
      light:        '#FF7043',
      dark:         '#E64A19',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main:         '#22C55E',
      light:        '#4ADE80',
      dark:         '#16A34A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFAF9',
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#0F0F0F',
      secondary: '#525252',
      disabled:  '#A3A3A3',
    },
    divider: '#E7E5E4',
    success: { main: '#22C55E', contrastText: '#FFFFFF' },
    warning: { main: '#F59E0B', contrastText: '#FFFFFF' },
    error:   { main: '#EF4444', contrastText: '#FFFFFF' },
    info:    { main: '#3B82F6', contrastText: '#FFFFFF' },
  },

  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, Helvetica, sans-serif",
    h1: { fontWeight: 900, letterSpacing: '-0.03em', color: '#0F0F0F' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em', color: '#0F0F0F' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em', color: '#0F0F0F' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em', color: '#0F0F0F' },
    h5: { fontWeight: 700, color: '#0F0F0F' },
    h6: { fontWeight: 700, color: '#0F0F0F' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    body1:  { color: '#0F0F0F', lineHeight: 1.65 },
    body2:  { color: '#525252', lineHeight: 1.65 },
    caption: { color: '#737373' },
    overline: { letterSpacing: '0.1em', fontWeight: 700, fontSize: '0.7rem' },
  },

  shape: { borderRadius: 10 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '9px 22px',
          boxShadow: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.18s ease',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '0.95rem',
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8rem',
        },
        containedPrimary: {
          background: '#FF5722',
          color: '#FFFFFF',
          '&:hover': {
            background: '#E64A19',
            boxShadow: '0 4px 16px rgba(255,87,34,0.35)',
          },
        },
        containedSecondary: {
          background: '#22C55E',
          color: '#FFFFFF',
          '&:hover': {
            background: '#16A34A',
            boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
          },
        },
        outlinedPrimary: {
          borderColor: '#FF5722',
          color: '#FF5722',
          borderWidth: '1.5px',
          '&:hover': {
            background: 'rgba(255,87,34,0.05)',
            borderColor: '#E64A19',
            borderWidth: '1.5px',
          },
        },
        outlinedSecondary: {
          borderColor: '#22C55E',
          color: '#22C55E',
          borderWidth: '1.5px',
          '&:hover': {
            background: 'rgba(34,197,94,0.05)',
            borderColor: '#16A34A',
            borderWidth: '1.5px',
          },
        },
        text: {
          '&:hover': {
            background: 'rgba(0,0,0,0.04)',
          },
        },
        containedInherit: {
          background: '#0F0F0F',
          color: '#FFFFFF',
          '&:hover': {
            background: '#1A1A1A',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E7E5E4',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          background: '#FFFFFF',
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          border: '1px solid #E7E5E4',
        },
        elevation4: {
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            background: '#FFFFFF',
            '& fieldset': { borderColor: '#E7E5E4', borderWidth: 1 },
            '&:hover fieldset': { borderColor: '#A3A3A3' },
            '&.Mui-focused fieldset': { borderColor: '#FF5722', borderWidth: '1.5px' },
          },
          '& label.Mui-focused': { color: '#FF5722' },
          '& .MuiInputBase-input': { fontSize: '0.9rem' },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        colorPrimary:   { background: '#FF5722', color: '#FFFFFF' },
        colorSecondary: { background: '#22C55E', color: '#FFFFFF' },
        filled: {
          background: '#F5F5F4',
          color: '#525252',
        },
        outlinedPrimary: { borderColor: '#FF5722', color: '#FF5722' },
        outlinedSecondary: { borderColor: '#22C55E', color: '#22C55E' },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(250,250,249,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: 'none',
          borderBottom: '1px solid #E7E5E4',
          color: '#0F0F0F',
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#FF5722',
          height: 2,
          borderRadius: '2px 2px 0 0',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.85rem',
          color: '#737373',
          '&.Mui-selected': { color: '#0F0F0F' },
          minWidth: 80,
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: '#F5F5F4', height: 6 },
        bar:  { borderRadius: 4, background: '#FF5722' },
      },
    },

    MuiStepper: {
      styleOverrides: {
        root: { background: 'transparent', border: 'none', boxShadow: 'none' },
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#E7E5E4',
          '&.Mui-active':    { color: '#FF5722' },
          '&.Mui-completed': { color: '#22C55E' },
        },
        text: { fill: '#FFFFFF', fontWeight: 700 },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '10px !important',
          border: '1px solid #E7E5E4',
          '&:before': { display: 'none' },
          boxShadow: 'none',
          '&.Mui-expanded': { margin: '0 0 8px 0' },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: { background: '#FFFFFF', border: 'none' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#E7E5E4' },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: '#F5F5F4',
            color: '#0F0F0F',
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #E7E5E4',
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': { background: '#FAFAF9' },
          '&:hover': { background: '#F5F5F4' },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        standardSuccess: { background: '#F0FDF4', color: '#14532D', border: '1px solid #BBF7D0' },
        standardError:   { background: '#FEF2F2', color: '#7F1D1D', border: '1px solid #FECACA' },
        standardWarning: { background: '#FFFBEB', color: '#78350F', border: '1px solid #FDE68A' },
        standardInfo:    { background: '#EFF6FF', color: '#1E3A5F', border: '1px solid #BFDBFE' },
        filledSuccess: { background: '#22C55E' },
        filledError:   { background: '#EF4444' },
        filledWarning: { background: '#F59E0B' },
        filledInfo:    { background: '#3B82F6' },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 700,
          fontSize: '0.65rem',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: '#1A1A1A',
          borderRadius: 6,
          fontSize: '0.78rem',
          fontWeight: 500,
        },
        arrow: { color: '#1A1A1A' },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: '1px solid #E7E5E4',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 6,
          margin: '1px 4px',
          '&:hover': { background: '#F5F5F4' },
          '&.Mui-selected': { background: 'rgba(255,87,34,0.06)', color: '#FF5722' },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: '1px solid #E7E5E4',
        },
      },
    },

    MuiPagination: {
      styleOverrides: {
        root: {},
      },
    },

    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          '&.Mui-selected': {
            background: '#FF5722',
            color: '#fff',
            '&:hover': { background: '#E64A19' },
          },
        },
      },
    },
  },
});

export default function MuiThemeProvider({ children }) {
  const [cache] = useState(() => {
    const c = createEmotionCache();
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;
    let styles = '';
    let dataEmotion = cache.key;
    for (const name of names) {
      if (cache.inserted[name] !== true) {
        styles += cache.inserted[name];
      }
      dataEmotion += ` ${name}`;
    }
    return (
      <style
        key={cache.key}
        data-emotion={dataEmotion}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
