'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Paper, Chip, Button, Divider,
  Tab, Tabs, Avatar,
} from '@mui/material';
import { Receipt, LocalShipping, CheckCircle, Cancel, Pending, ArrowForward } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/lib/functions';

const mockOrders = [
  {
    id: 'ORD-2026-001', date: '2026-06-18', status: 'delivered', total: 648,
    items: [
      { name: 'Classic Tomato Ketchup', qty: 2, price: 149 },
      { name: 'Garlic Mayonnaise', qty: 1, price: 199 },
    ],
    deliveryDate: '2026-06-20',
  },
  {
    id: 'ORD-2026-002', date: '2026-06-19', status: 'shipped', total: 299,
    items: [{ name: 'Smoky BBQ Sauce', qty: 1, price: 159 }, { name: 'Spicy Chilli Sauce', qty: 1, price: 129 }],
    deliveryDate: '2026-06-22',
  },
  {
    id: 'ORD-2026-003', date: '2026-06-20', status: 'processing', total: 189,
    items: [{ name: 'Italian Herb Dressing', qty: 1, price: 189 }],
    deliveryDate: '2026-06-24',
  },
  {
    id: 'ORD-2026-004', date: '2026-06-10', status: 'cancelled', total: 348,
    items: [{ name: 'Eggless Mayo', qty: 1, price: 219 }, { name: 'Mint Chutney', qty: 1, price: 99 }],
    deliveryDate: null,
  },
];

const statusIcons = {
  delivered: <CheckCircle fontSize="small" />,
  shipped: <LocalShipping fontSize="small" />,
  processing: <Pending fontSize="small" />,
  pending: <Pending fontSize="small" />,
  cancelled: <Cancel fontSize="small" />,
};

const tabs = ['all', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all' ? mockOrders : mockOrders.filter((o) => o.status === activeTab);

  return (
    <MainLayout>
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>My Orders</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
            Track and manage your orders
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Tabs */}
        <Tabs
          value={activeTab} onChange={(_, v) => setActiveTab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{ mb: 3, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab} value={tab}
              label={tab.charAt(0).toUpperCase() + tab.slice(1)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Receipt sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No orders found.</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2.5,
              width: '100%',
            }}
          >
            {filtered.map((order) => (
              <Paper key={order.id} sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{order.id}</Typography>
                      <Typography variant="body2" color="text.secondary">Placed on {formatDate(order.date)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        icon={statusIcons[order.status]}
                        label={getOrderStatusLabel(order.status)}
                        color={getOrderStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                        {formatCurrency(order.total)}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Items */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    {order.items.map((item) => (
                      <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFF8F0', borderRadius: 2, px: 1.5, py: 0.75 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1B4332', fontSize: 16 }}>🍅</Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Qty: {item.qty} × {formatCurrency(item.price)}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {order.deliveryDate && (
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600, mb: 2 }}>
                      {order.status === 'delivered'
                        ? `Delivered on ${formatDate(order.deliveryDate)}`
                        : `Expected by ${formatDate(order.deliveryDate)}`}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button component={Link} href={`/orders/${order.id}`} variant="outlined" size="small" endIcon={<ArrowForward />}>
                      View Details
                    </Button>
                    <Button component={Link} href={`/invoices/${order.id}`} variant="outlined" size="small" startIcon={<Receipt />}>
                      Invoice
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="outlined" size="small" color="secondary">Reorder</Button>
                    )}
                  </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </MainLayout>
  );
}
