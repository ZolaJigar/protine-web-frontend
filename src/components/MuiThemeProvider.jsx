'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import createEmotionCache from '@/lib/emotionCache';

const theme = createTheme({
  palette: {
    primary: {
      main:          '#1B4332',   // Deep Forest Green
      light:         '#40916C',
      dark:          '#0D2B1F',
      contrastText:  '#FFF8F0',
    },
    secondary: {
      main:          '#F59E0B',   // Vibrant Amber
      light:         '#FCD34D',
      dark:          '#D97706',
      contrastText:  '#1C1917',
    },
    background: {
      default: '#FFF8F0',         // Warm Cream
      paper:   '#FFFFFF',
    },
    text: {
      primary:   '#1C1917',       // Rich Charcoal
      secondary: '#57534E',
      disabled:  '#A8A29E',
    },
    divider: '#E7E5E4',
    success: { main: '#1B4332', contrastText: '#FFF8F0' },
    warning: { main: '#D97706', contrastText: '#FFF8F0' },
    error:   { main: '#B91C1C', contrastText: '#FFF8F0' },
    info:    { main: '#0369A1', contrastText: '#FFF8F0' },
  },

  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, Helvetica, sans-serif",
    h1: { fontWeight: 900, color: '#1C1917' },
    h2: { fontWeight: 800, color: '#1C1917' },
    h3: { fontWeight: 800, color: '#1C1917' },
    h4: { fontWeight: 700, color: '#1C1917' },
    h5: { fontWeight: 700, color: '#1C1917' },
    h6: { fontWeight: 700, color: '#1C1917' },
    button: { textTransform: 'none', fontWeight: 700 },
    body1:  { color: '#1C1917' },
    body2:  { color: '#57534E' },
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
          '&:hover': { boxShadow: '0 6px 20px rgba(27,67,50,0.3)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          color: '#FFF8F0',
          '&:hover': {
            background: 'linear-gradient(135deg, #0D2B1F 0%, #1B4332 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
          color: '#1C1917',
          '&:hover': {
            background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
          },
        },
        outlinedPrimary: {
          borderColor: '#1B4332',
          color: '#1B4332',
          '&:hover': { background: '#1B433210', borderColor: '#0D2B1F' },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(27,67,50,0.08)',
          background: '#FFFFFF',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': { borderColor: '#2D6A4F' },
            '&.Mui-focused fieldset': { borderColor: '#1B4332' },
          },
          '& label.Mui-focused': { color: '#1B4332' },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        colorPrimary:   { background: '#1B4332', color: '#FFF8F0' },
        colorSecondary: { background: '#F59E0B', color: '#1C1917' },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#0F172A',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          borderBottom: '3px solid #F59E0B',
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#F59E0B', height: 3, borderRadius: 2 },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          '&.Mui-selected': { color: '#1B4332' },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: '#E7E5E4' },
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
          color: '#E7E5E4',
          '&.Mui-active':    { color: '#1B4332' },
          '&.Mui-completed': { color: '#40916C' },
        },
        text: { fill: '#FFF8F0' },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
          boxShadow: '0 2px 12px rgba(27,67,50,0.08)',
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
        paper: { background: '#FFF8F0' },
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
            background: '#1B4332',
            color: '#FFF8F0',
            fontWeight: 700,
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': { background: '#FFF8F0' },
          '&:hover': { background: '#D8F3DC30' },
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        standardSuccess: { background: '#D8F3DC', color: '#1B4332' },
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
