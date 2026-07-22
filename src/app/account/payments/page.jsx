'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Paper, Button, CircularProgress,
  Alert, Pagination, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Skeleton,
} from '@mui/material';
import { CurrencyRupee, ArrowForward, ReceiptLong } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import PaymentStatusBadge from '@/components/PaymentStatusBadge';
import { usePayment } from '@/hooks/usePayment';
import { paymentsAPI } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/functions';

const PAGE_LIMIT = 10;

export default function PaymentHistoryPage() {
  const [payments,    setPayments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);

  // For retrying a failed payment
  const { retryPayment, loading: retryLoading } = usePayment();
  const [retryingId, setRetryingId] = useState(null);

  const fetchPayments = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res   = await paymentsAPI.getHistory({ page: currentPage, limit: PAGE_LIMIT });
      const data  = res.data?.data;
      setPayments(data?.data ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalCount(data?.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(page); }, [fetchPayments, page]);

  const handleRetry = async (payment) => {
    setRetryingId(payment.id);
    try {
      await retryPayment(payment.order_id);
    } finally {
      setRetryingId(null);
    }
  };

  const canRetry = (status) => status === 'failed' || status === 'cancelled';

  return (
    <MainLayout>
      {/* Banner */}
      <Box className="page-banner" sx={{ py: { xs: 4, md: 5 } }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CurrencyRupee sx={{ fontSize: 28, color: '#FF5722' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Payment History
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.25, fontSize: '0.875rem' }}>
                View and manage your payment transactions
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        {error && (
          <Alert
            severity="error"
            action={<Button size="small" onClick={() => fetchPayments(page)}>Retry</Button>}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {!error && totalCount > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {payments.length} of {totalCount} transactions
          </Typography>
        )}

        {/* Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Payment #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  // Skeleton rows
                  Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <ReceiptLong sx={{ fontSize: 64, color: 'grey.300', mb: 1.5, display: 'block', mx: 'auto' }} />
                      <Typography color="text.secondary" variant="h6">No payments found</Typography>
                      <Typography color="text.disabled" variant="body2" sx={{ mt: 0.5 }}>
                        Your payment history will appear here after your first order.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#16A34A' }}>
                          {payment.payment_number}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Button
                          component={Link}
                          href={`/orders/${payment.order_id}`}
                          size="small"
                          sx={{ p: 0, minWidth: 0, fontWeight: 600, color: '#FF5722', textDecoration: 'underline' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {payment.order?.order_number ?? `#${payment.order_id}`}
                        </Button>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={700}>
                          {formatCurrency(parseFloat(payment.paid_amount || payment.amount))}
                        </Typography>
                        {payment.paid_amount !== payment.amount && (
                          <Typography variant="caption" color="text.disabled">
                            of {formatCurrency(parseFloat(payment.amount))}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {payment.payment_method ? (
                          <Chip
                            label={payment.payment_method.replace(/_/g, ' ').toUpperCase()}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: 10 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.disabled">—</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {payment.paid_at
                            ? formatDateTime(payment.paid_at)
                            : payment.created_at
                            ? formatDateTime(payment.created_at)
                            : '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {/* View order detail */}
                          <Button
                            component={Link}
                            href={`/orders/${payment.order_id}`}
                            size="small"
                            variant="outlined"
                            endIcon={<ArrowForward />}
                            sx={{ fontSize: 12, borderRadius: '50px' }}
                          >
                            Order
                          </Button>

                          {/* Retry failed payments */}
                          {canRetry(payment.status) && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleRetry(payment)}
                              disabled={retryLoading || retryingId === payment.id}
                              startIcon={
                                retryingId === payment.id ? <CircularProgress size={12} color="inherit" /> : null
                              }
                              sx={{
                                fontSize: 12,
                                borderRadius: '50px',
                                background: '#FF5722',
                                '&:hover': { background: '#E64A19' },
                              }}
                            >
                              Retry Pay
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
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

      </Container>
    </MainLayout>
  );
}
