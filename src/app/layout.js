import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import MuiThemeProvider from '@/components/MuiThemeProvider';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Protine Web — Premium Food & Sauces',
  description:
    'Discover premium ketchup, mayonnaise, and healthy food products. Fast delivery, easy ordering, and a delicious experience.',
  keywords: 'ketchup, mayonnaise, sauces, healthy food, online grocery, Protine Web',
  icons: {
    icon: [
      { url: '/logo-icon-32.png',  sizes: '32x32',   type: 'image/png' },
      { url: '/logo-icon-64.png',  sizes: '64x64',   type: 'image/png' },
      { url: '/logo-icon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/logo-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/logo-icon-192.png',
    shortcut: '/logo-icon-32.png',
  },
  openGraph: {
    title: 'Protine Web — Premium Food & Sauces',
    description: 'Fresh, healthy, and delicious food products delivered to your door.',
    type: 'website',
    images: [{ url: '/og-logo.png', width: 1200, height: 300, alt: 'Protine Web' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <MuiThemeProvider>
          <AppProvider>{children}</AppProvider>
          <ToastProvider />
        </MuiThemeProvider>
      </body>
    </html>
  );
}
