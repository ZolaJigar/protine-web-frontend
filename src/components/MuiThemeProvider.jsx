'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import createEmotionCache from '@/lib/emotionCache';

const theme = createTheme({
  palette: {
    primary: {
      main:         '#16A34A',   // Fresh Green
      light:        '#4ADE80',
      dark:         '#15803D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main:         '#FF6B35',   // Warm Orange
      light:        '#FF8C5A',
      dark:         '#E5501A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB',
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#111827',
      secondary: '#4B5563',
      disabled:  '#9CA3AF',
    },
    divider: '#E5E7EB',
    success: { main: '#16A34A', contrastText: '#FFFFFF' },
    warning: { main: '#D97706', contrastText: '#FFFFFF' },
    error:   { main: '#DC2626', contrastText: '#FFFFFF' },
    info:    { main: '#0369A1', contrastText: '#FFFFFF' },
  },

  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, Helvetica, sans-serif",
    h1: { fontWeight: 900, color: '#111827' },
    h2: { fontWeight: 800, color: '#111827' },
    h3: { fontWeight: 800, color: '#111827' },
    h4: { fontWeight: 700, color: '#111827' },
    h5: { fontWeight: 700, color: '#111827' },
    h6: { fontWeight: 700, color: '#111827' },
    button: { textTransform: 'none', fontWeight: 700 },
    body1:  { color: '#111827' },
    body2:  { color: '#4B5563' },
  },

  shape: { borderRadius: 12 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          padding: '10px 28px',
          boxShadow: 'none',
          fontWeight: 700,
          '&:hover': { boxShadow: '0 6px 20px rgba(22,163,74,0.25)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #E5501A 0%, #FF6B35 100%)',
          },
        },
        outlinedPrimary: {
          borderColor: '#16A34A',
          color: '#16A34A',
          '&:hover': { background: '#16A34A10', borderColor: '#15803D' },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(22,163,74,0.08)',
          background: '#FFFFFF',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 8px rgba(22,163,74,0.07)',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': { borderColor: '#4ADE80' },
            '&.Mui-focused fieldset': { borderColor: '#16A34A' },
          },
          '& label.Mui-focused': { color: '#16A34A' },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        colorPrimary:   { background: '#16A34A', color: '#FFFFFF' },
        colorSecondary: { background: '#FF6B35', color: '#FFFFFF' },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          boxShadow: '0 2px 12px rgba(22,163,74,0.10)',
          borderBottom: '2px solid #D1FAE5',
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#FF6B35', height: 3, borderRadius: 2 },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          '&.Mui-selected': { color: '#16A34A' },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: '#D1FAE5' },
        bar:  { borderRadius: 4 },
      },
    },

    MuiStepper: {
      styleOverrides: {
        root: { background: 'transparent' },
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#E5E7EB',
          '&.Mui-active':    { color: '#16A34A' },
          '&.Mui-completed': { color: '#4ADE80' },
        },
        text: { fill: '#FFFFFF' },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
          boxShadow: '0 2px 12px rgba(22,163,74,0.07)',
          '&.Mui-expanded': { margin: '0 0 8px 0' },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: { '&.Mui-expanded': { minHeight: 48 } },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: { background: '#FFFFFF' },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#E5E7EB' },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: '#16A34A',
            color: '#FFFFFF',
            fontWeight: 700,
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': { background: '#F9FAFB' },
          '&:hover': { background: '#F0FDF450' },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        standardSuccess: { background: '#DCFCE7', color: '#14532D' },
        standardError:   { background: '#FEE2E2', color: '#7F1D1D' },
        standardWarning: { background: '#FEF3C7', color: '#92400E' },
        standardInfo:    { background: '#E0F2FE', color: '#0369A1' },
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
