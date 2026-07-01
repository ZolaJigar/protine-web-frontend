'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Paper, Chip, Button, Divider,
  Tab, Tabs, Avatar, CircularProgress, Pagination, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField,
} from '@mui/material';
import {
  Receipt, LocalShipping, CheckCircle, Cancel, Pending,
  ArrowForward, Replay, Download,
} from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import { ordersAPI } from '@/lib/api.jsx';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/lib/functions';

// Maps API order_status values to tab keys (API uses "confirmed" not "processing")
const STATUS_TAB_MAP = {
  all: null,
  pending: 'pending',
  confirmed: 'confirmed',
  shipped: 'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const tabs = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusIcons = {
  delivered: <CheckCircle fontSize="small" />,
  shipped: <LocalShipping fontSize="small" />,
  confirmed: <Pending fontSize="small" />,
  pending: <Pending fontSize="small" />,
  cancelled: <Cancel fontSize="small" />,
};

const PAGE_LIMIT = 9; // 3-column grid

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cancel dialog state
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null, orderNumber: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reorder state
  const [reorderLoading, setReorderLoading] = useState(null); // stores orderId being reordered

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  const fetchOrders = useCallback(async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await ordersAPI.list({ page: currentPage, limit: PAGE_LIMIT });
      const { data: payload } = res.data;
      setOrders(payload?.data ?? []);
      setTotalPages(payload?.totalPages ?? 1);
    } catch (err) {
      showSnack(err?.response?.data?.message || 'Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  const handleTabChange = (_, newTab) => {
    setActiveTab(newTab);
    setPage(1);
  };

  // Client-side filter by status (all orders are fetched paginated; tab filters locally)
  const filtered =
    activeTab === 'all'
      ? orders
      : orders.filter((o) => o.order_status === STATUS_TAB_MAP[activeTab]);

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const openCancelDialog = (order) => {
    setCancelDialog({ open: true, orderId: order.id, orderNumber: order.order_number });
    setCancelReason('');
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    try {
      await ordersAPI.cancel(cancelDialog.orderId, { cancellation_reason: cancelReason });
      showSnack(`Order ${cancelDialog.orderNumber} cancelled successfully.`);
      setCancelDialog({ open: false, orderId: null, orderNumber: '' });
      fetchOrders(page);
    } catch (err) {
      showSnack(err?.response?.data?.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Reorder ─────────────────────────────────────────────────────────────────
  const handleReorder = async (order) => {
    setReorderLoading(order.id);
    try {
      const res = await ordersAPI.reorder(order.id);
      const { added_items = [], skipped_items = [] } = res.data?.data ?? {};
      const addedCount = added_items.length;
      const skippedCount = skipped_items.length;
      if (addedCount > 0) {
        showSnack(
          `${addedCount} item(s) added to cart${skippedCount > 0 ? `, ${skippedCount} skipped (unavailable)` : ''}.`
        );
      } else {
        showSnack('No items could be added — all are unavailable.', 'warning');
      }
    } catch (err) {
      showSnack(err?.response?.data?.message || 'Failed to reorder.', 'error');
    } finally {
      setReorderLoading(null);
    }
  };

  // ── Invoice download ─────────────────────────────────────────────────────────
  const handleDownloadInvoice = async (order) => {
    try {
      const res = await ordersAPI.downloadInvoice(order.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showSnack('Failed to download invoice.', 'error');
    }
  };

  // ── Derived status helpers ───────────────────────────────────────────────────
  const canCancel = (status) => status === 'pending' || status === 'confirmed';

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
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, '& .MuiTabs-indicator': { bgcolor: 'primary.main' } }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={tab.charAt(0).toUpperCase() + tab.slice(1)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Receipt sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No orders found.</Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2.5,
                width: '100%',
              }}
            >
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  canCancel={canCancel(order.order_status)}
                  reorderLoading={reorderLoading === order.id}
                  onCancel={() => openCancelDialog(order)}
                  onReorder={() => handleReorder(order)}
                  onDownloadInvoice={() => handleDownloadInvoice(order)}
                />
              ))}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ ...cancelDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to cancel <strong>{cancelDialog.orderNumber}</strong>? This cannot be undone.
          </DialogContentText>
          <TextField
            label="Reason (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ ...cancelDialog, open: false })} disabled={cancelLoading}>
            Keep Order
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
            disabled={cancelLoading}
            startIcon={cancelLoading ? <CircularProgress size={16} /> : <Cancel />}
          >
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, canCancel, reorderLoading, onCancel, onReorder, onDownloadInvoice }) {
  const status = order.order_status;
  const isDelivered = status === 'delivered';

  return (
    <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{order.order_number}</Typography>
          <Typography variant="body2" color="text.secondary">
            Placed on {formatDate(order.placedAt ?? order.createdAt)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={statusIcons[status] ?? <Pending fontSize="small" />}
            label={getOrderStatusLabel(status)}
            color={getOrderStatusColor(status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
            {formatCurrency(parseFloat(order.total_amount))}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          {order.items.map((item) => (
            <Box
              key={item.id ?? item.product_name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#FFF8F0',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
              }}
            >
              <Avatar
                src={item.product?.image}
                alt={item.product_name}
                sx={{ width: 32, height: 32, bgcolor: '#1B4332', fontSize: 16 }}
              >
                🛒
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                  {item.product_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.variant_name && `${item.variant_name} · `}Qty: {item.quantity} × {formatCurrency(parseFloat(item.unit_price))}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          component={Link}
          href={`/orders/${order.id}`}
          variant="outlined"
          size="small"
          endIcon={<ArrowForward />}
        >
          View Details
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Download />}
          onClick={onDownloadInvoice}
        >
          Invoice
        </Button>

        {isDelivered && (
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={reorderLoading ? <CircularProgress size={14} /> : <Replay />}
            onClick={onReorder}
            disabled={reorderLoading}
          >
            Reorder
          </Button>
        )}

        {canCancel && (
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<Cancel />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Paper>
  );
}
