'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Paper, Button, Divider,
  CircularProgress, Alert, Avatar, Chip,
} from '@mui/material';
import {
  CheckCircle, ArrowForward, ShoppingBag, Receipt,
  LocalShipping, CurrencyRupee,
} from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import PaymentStatusBadge from '@/components/PaymentStatusBadge';
import { ordersAPI } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/functions';

export default function OrderSuccessPage({ params }) {
  const { id } = use(params);

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersAPI.getById(id);
      setOrder(res.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Could not load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <MainLayout>
      {/* Success Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)',
          py: { xs: 5, md: 7 },
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <Container maxWidth="sm">
          <CheckCircle sx={{ fontSize: 80, mb: 2, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }} />
          <Typography variant="h3" fontWeight={900} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
            Payment Successful!
          </Typography>
          <Typography sx={{ opacity: 0.85, fontSize: '1.1rem' }}>
            Your order has been confirmed and is being processed.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={48} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            action={<Button size="small" onClick={load}>Retry</Button>}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        ) : order ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Order number + payment status */}
            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="overline" sx={{ color: '#16A34A', fontWeight: 700, letterSpacing: 1.5 }}>
                Order Confirmed
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, mb: 1 }}>
                {order.order_number}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <PaymentStatusBadge status={order.payment_status} size="medium" />
                <Chip
                  label={`Order: ${order.order_status?.replace(/_/g, ' ')}`}
                  color="info"
                  size="medium"
                  sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Placed on {formatDateTime(order.placedAt ?? order.createdAt)}
              </Typography>
            </Paper>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Items Ordered
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {order.items.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={item.product?.image}
                        alt={item.product_name}
                        sx={{ width: 48, height: 48, bgcolor: '#F0FDF4', fontSize: 20, borderRadius: 2 }}
                      >
                        🛒
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{item.product_name}</Typography>
                        {item.variant_name && (
                          <Chip label={item.variant_name} size="small" sx={{ fontSize: 10, height: 18, mr: 0.5 }} />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Qty: {item.quantity} × {formatCurrency(parseFloat(item.unit_price))}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatCurrency(parseFloat(item.line_total ?? item.total_price))}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Payment + amount summary side by side on md+ */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

              {/* Payment details */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CurrencyRupee sx={{ color: '#16A34A' }} />
                  <Typography variant="h6" fontWeight={700}>Payment Details</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Amount Paid</Typography>
                    <Typography fontWeight={700} color="#16A34A">
                      {formatCurrency(parseFloat(order.total_amount ?? order.paid_amount ?? 0))}
                    </Typography>
                  </Box>
                  {order.payment_method && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Payment Method</Typography>
                      <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {order.payment_method?.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                  )}
                  {order.paid_at && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Paid At</Typography>
                      <Typography fontWeight={600}>{formatDateTime(order.paid_at)}</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Estimated delivery */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocalShipping sx={{ color: '#FF5722' }} />
                  <Typography variant="h6" fontWeight={700}>Delivery Info</Typography>
                </Box>
                {order.address ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{order.address.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{order.address.mobile}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.address.address_line_1}
                      {order.address.address_line_2 ? `, ${order.address.address_line_2}` : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.address.city?.name}, {order.address.state?.name} — {order.address.postal_code}
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    Delivery details will be sent to your registered email.
                  </Typography>
                )}
                {order.estimated_delivery && (
                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={700} color="#16A34A">
                      Estimated Delivery: {formatDate(order.estimated_delivery)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, pt: 1 }}>
              <Button
                component={Link}
                href={`/orders/${order.id}`}
                variant="contained"
                endIcon={<Receipt />}
                sx={{
                  background: 'linear-gradient(135deg, #16A34A, #4ADE80)',
                  borderRadius: '50px',
                  px: 4,
                  fontWeight: 700,
                  '&:hover': { background: '#15803D' },
                }}
              >
                Track Order
              </Button>
              <Button
                component={Link}
                href="/orders"
                variant="outlined"
                endIcon={<ArrowForward />}
                sx={{
                  borderRadius: '50px',
                  px: 4,
                  fontWeight: 700,
                  borderColor: '#16A34A',
                  color: '#16A34A',
                }}
              >
                View All Orders
              </Button>
              <Button
                component={Link}
                href="/products"
                variant="outlined"
                endIcon={<ShoppingBag />}
                sx={{
                  borderRadius: '50px',
                  px: 4,
                  fontWeight: 700,
                }}
              >
                Continue Shopping
              </Button>
            </Box>

          </Box>
        ) : null}
      </Container>
    </MainLayout>
  );
}
