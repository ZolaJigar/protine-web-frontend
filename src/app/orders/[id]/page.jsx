'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Paper, Chip, Button, Divider,
  CircularProgress, Alert, Avatar, Stepper, Step, StepLabel,
  StepConnector, stepConnectorClasses, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, LocalShipping, Pending, Cancel,
  Download, Replay, Receipt, LocationOn, Inventory,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { ordersAPI } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime, getOrderStatusColor, getOrderStatusLabel } from '@/lib/functions';

// ─── Custom step connector ────────────────────────────────────────────────────
const ColorConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? '#555' : '#E0E0E0',
    borderTopWidth: 3, borderRadius: 1,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: { borderColor: '#1B4332' },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: { borderColor: '#1B4332' },
}));

const TRACKING_STEPS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];

const stepIcons = {
  pending: <Pending sx={{ fontSize: 20 }} />,
  confirmed: <CheckCircle sx={{ fontSize: 20 }} />,
  processing: <Inventory sx={{ fontSize: 20 }} />,
  packed: <Inventory sx={{ fontSize: 20 }} />,
  shipped: <LocalShipping sx={{ fontSize: 20 }} />,
  delivered: <CheckCircle sx={{ fontSize: 20 }} />,
};

function CustomStepIcon({ status, isCompleted, isCurrent }) {
  const bg = isCompleted || isCurrent ? '#1B4332' : '#CBD5E1';
  return (
    <Box sx={{
      width: 44, height: 44, borderRadius: '50%',
      bgcolor: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: isCurrent ? '3px solid #F59E0B' : '3px solid transparent',
      boxShadow: isCurrent ? '0 0 0 3px rgba(245,158,11,0.25)' : 'none',
      transition: 'all 0.3s',
    }}>
      {stepIcons[status] ?? <Pending sx={{ fontSize: 20 }} />}
    </Box>
  );
}

// ─── Tracking Timeline ────────────────────────────────────────────────────────
function TrackingTimeline({ timeline, currentStatus }) {
  if (!timeline || timeline.length === 0) return null;
  const currentIdx = TRACKING_STEPS.indexOf(currentStatus);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Order Timeline</Typography>
      <Stepper
        alternativeLabel
        activeStep={currentIdx}
        connector={<ColorConnector />}
      >
        {timeline.map((step) => (
          <Step key={step.status} completed={step.isCompleted}>
            <StepLabel
              StepIconComponent={() => (
                <CustomStepIcon
                  status={step.status}
                  isCompleted={step.isCompleted}
                  isCurrent={step.isCurrent}
                />
              )}
            >
              <Typography variant="caption" fontWeight={step.isCurrent ? 700 : 500}
                sx={{ color: step.isCurrent ? '#1B4332' : step.isCompleted ? '#374151' : '#9CA3AF' }}>
                {step.label}
              </Typography>
              {step.completedAt && (
                <Typography variant="caption" sx={{ display: 'block', color: '#9CA3AF', fontSize: 10 }}>
                  {formatDate(step.completedAt)}
                </Typography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
}

// ─── Order Items ──────────────────────────────────────────────────────────────
function OrderItems({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Items Ordered</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {items.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar
              src={item.product?.image} alt={item.product_name}
              sx={{ width: 48, height: 48, bgcolor: '#D8F3DC', fontSize: 20, borderRadius: 2 }}
            >
              🛒
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>{item.product_name}</Typography>
              {item.variant_name && (
                <Chip label={item.variant_name} size="small" sx={{ fontSize: 10, height: 18, mr: 0.5 }} />
              )}
              {item.sku && (
                <Typography variant="caption" color="text.secondary"> SKU: {item.sku}</Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">×{item.quantity}</Typography>
              <Typography variant="subtitle2" fontWeight={700}>{formatCurrency(parseFloat(item.line_total))}</Typography>
              <Typography variant="caption" color="text.disabled">{formatCurrency(parseFloat(item.unit_price))} each</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// ─── Amount Breakdown ─────────────────────────────────────────────────────────
function AmountBreakdown({ order }) {
  const subtotal  = parseFloat(order.subtotal_amount || 0);
  const discount  = parseFloat(order.discount_amount || 0);
  const tax       = parseFloat(order.tax_amount || 0);
  const shipping  = parseFloat(order.shipping_amount || 0);
  const total     = parseFloat(order.total_amount || 0);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Amount Breakdown</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography fontWeight={600}>{formatCurrency(subtotal)}</Typography>
        </Box>
        {discount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Discount</Typography>
            <Typography fontWeight={600} color="success.main">− {formatCurrency(discount)}</Typography>
          </Box>
        )}
        {tax > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Tax</Typography>
            <Typography fontWeight={600}>{formatCurrency(tax)}</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Shipping</Typography>
          <Typography fontWeight={600} color={shipping === 0 ? 'success.main' : 'text.primary'}>
            {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={800}>Total</Typography>
          <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#1B4332' }}>{formatCurrency(total)}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────
function DeliveryAddress({ order }) {
  const addr = order.address;
  if (!addr) return null;
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <LocationOn sx={{ color: '#1B4332' }} />
        <Typography variant="h6" fontWeight={700}>Delivery Address</Typography>
      </Box>
      <Typography fontWeight={700}>{addr.name}</Typography>
      <Typography variant="body2" color="text.secondary">{addr.mobile}</Typography>
      <Typography variant="body2" color="text.secondary">
        {addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ''}
        {addr.landmark ? ` (${addr.landmark})` : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {addr.city?.name ?? addr.city}, {addr.state?.name ?? addr.state} — {addr.postal_code}
      </Typography>
    </Paper>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderDetailPage({ params }) {
  const { id } = use(params);

  const [order,   setOrder]   = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Cancel dialog
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling,   setCancelling]   = useState(false);

  // Reorder
  const [reordering, setReordering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderRes, trackingRes] = await Promise.allSettled([
        ordersAPI.getById(id),
        ordersAPI.tracking(id),
      ]);
      if (orderRes.status === 'fulfilled') setOrder(orderRes.value.data?.data);
      else throw new Error(orderRes.reason?.response?.data?.message || 'Order not found.');
      if (trackingRes.status === 'fulfilled') setTracking(trackingRes.value.data?.data);
    } catch (err) {
      setError(err.message || 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDownloadInvoice = async () => {
    try {
      const res = await ordersAPI.downloadInvoice(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `invoice-${order.order_number}.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download invoice.');
    }
  };

  const handleCancel = async () => {
    if (cancelReason.trim().length < 3) {
      toast.error('Please provide a reason (min 3 characters).');
      return;
    }
    setCancelling(true);
    try {
      await ordersAPI.cancel(id, { cancellation_reason: cancelReason.trim() });
      toast.success('Order cancelled successfully.');
      setCancelDialog(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    setReordering(true);
    try {
      const res = await ordersAPI.reorder(id);
      const { added_items = [], skipped_items = [] } = res.data?.data ?? {};
      if (added_items.length > 0) {
        toast.success(
          `${added_items.length} item(s) added to cart${skipped_items.length > 0 ? `, ${skipped_items.length} unavailable` : ''}.`
        );
      } else {
        toast.warning('No items could be added — all are currently unavailable.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reorder.');
    } finally {
      setReordering(false);
    }
  };

  const canCancel = (status) => status === 'pending' || status === 'confirmed';

  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Button
            component={Link} href="/orders"
            startIcon={<ArrowBack />}
            sx={{ color: 'rgba(255,248,240,0.75)', mb: 1.5, fontWeight: 600, '&:hover': { color: '#FFF8F0' } }}
          >
            Back to Orders
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Receipt sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>
                {loading ? 'Order Details' : order?.order_number ?? 'Order Details'}
              </Typography>
              {order && (
                <Typography sx={{ color: 'rgba(255,248,240,0.7)', mt: 0.25 }}>
                  Placed on {formatDateTime(order.placedAt)}
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={48} />
          </Box>
        ) : error ? (
          <Alert severity="error" action={<Button size="small" onClick={load}>Retry</Button>}>
            {error}
          </Alert>
        ) : order ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Status bar */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{order.order_number}</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Order: ${getOrderStatusLabel(order.order_status)}`}
                      color={getOrderStatusColor(order.order_status)}
                      size="small" sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      label={`Payment: ${getOrderStatusLabel(order.payment_status)}`}
                      color={order.payment_status === 'paid' ? 'success' : order.payment_status === 'fail' ? 'error' : 'warning'}
                      size="small" sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" startIcon={<Download />} onClick={handleDownloadInvoice}
                    sx={{ borderRadius: '50px', fontWeight: 600 }}>
                    Invoice
                  </Button>
                  {order.order_status === 'delivered' && (
                    <Button size="small" variant="outlined" color="secondary"
                      startIcon={reordering ? <CircularProgress size={14} /> : <Replay />}
                      onClick={handleReorder} disabled={reordering}
                      sx={{ borderRadius: '50px', fontWeight: 600 }}>
                      Reorder
                    </Button>
                  )}
                  {canCancel(order.order_status) && (
                    <Button size="small" variant="outlined" color="error"
                      startIcon={<Cancel />} onClick={() => setCancelDialog(true)}
                      sx={{ borderRadius: '50px', fontWeight: 600 }}>
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Box>
              {order.notes && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {order.notes}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Tracking timeline */}
            {tracking?.timeline && (
              <TrackingTimeline timeline={tracking.timeline} currentStatus={order.order_status} />
            )}

            {/* Two-column layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 3, alignItems: 'start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <OrderItems items={order.items} />
                <DeliveryAddress order={order} />
              </Box>
              <AmountBreakdown order={order} />
            </Box>
          </Box>
        ) : null}
      </Container>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will cancel <strong>{order?.order_number}</strong>. Stock will be released. This cannot be undone.
          </DialogContentText>
          <TextField
            label="Reason for cancellation *" fullWidth multiline rows={3} size="small"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please tell us why you're cancelling…"
            inputProps={{ minLength: 3, maxLength: 500 }}
            helperText={`${cancelReason.length}/500 (min 3 characters)`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)} disabled={cancelling}>Keep Order</Button>
          <Button onClick={handleCancel} color="error" variant="contained" disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : <Cancel />}>
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
