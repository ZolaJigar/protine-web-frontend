'use client';

import {
  Box, Container, Typography, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip,
} from '@mui/material';
import { Download, Print, Visibility, Receipt } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import { formatDate, formatCurrency, getOrderStatusColor, getOrderStatusLabel } from '@/lib/functions';

const mockInvoices = [
  { id: 'INV-001', orderId: 'ORD-2026-001', date: '2026-06-18', amount: 762,  status: 'paid',     items: 3 },
  { id: 'INV-002', orderId: 'ORD-2026-002', date: '2026-06-19', amount: 352,  status: 'paid',     items: 2 },
  { id: 'INV-003', orderId: 'ORD-2026-003', date: '2026-06-20', amount: 223,  status: 'pending',  items: 1 },
  { id: 'INV-004', orderId: 'ORD-2026-004', date: '2026-06-10', amount: 410,  status: 'refunded', items: 2 },
];

const kpiCards = (invoices) => [
  { label: 'Total Invoices', value: invoices.length,                                                          color: '#16A34A', bg: '#F0FDF4', icon: '🧾' },
  { label: 'Total Spent',    value: formatCurrency(invoices.reduce((s, i) => s + i.amount, 0)),               color: '#E5501A', bg: '#FFF0EB', icon: '💰' },
  { label: 'Paid',           value: invoices.filter((i) => i.status === 'paid').length,                       color: '#1565C0', bg: '#E0F2FE', icon: '✅' },
  { label: 'Pending',        value: invoices.filter((i) => i.status === 'pending').length,                    color: '#C2410C', bg: '#FFEDD5', icon: '⏳' },
];

export default function InvoicesPage() {
  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)', py: 5, color: '#FFFFFF' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Receipt sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>My Invoices</Typography>
              <Typography sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
                Download and manage your purchase invoices
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* ── KPI cards — 4 equal columns, full width ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2.5,
            width: '100%',
            mb: 4,
          }}
        >
          {kpiCards(mockInvoices).map((card) => (
            <Paper
              key={card.label}
              className="card-3d"
              sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}
            >
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: 3,
                  bgcolor: card.bg, fontSize: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: card.color, lineHeight: 1.1 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500, mt: 0.25 }}>
                  {card.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* ── Invoices table — full width ── */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', width: '100%' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Invoice #', 'Order #', 'Date', 'Items', 'Amount', 'Status', 'Actions'].map((head) => (
                    <TableCell
                      key={head}
                      sx={{ bgcolor: '#16A34A', color: '#FFFFFF', fontWeight: 700, fontSize: 14 }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockInvoices.map((invoice, i) => (
                  <TableRow
                    key={invoice.id}
                    sx={{
                      bgcolor: i % 2 === 0 ? '#FFFFFF' : '#FFFFFF',
                      '&:hover': { bgcolor: '#F0FDF430' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#16A34A' }}>{invoice.id}</TableCell>
                    <TableCell>{invoice.orderId}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{invoice.items} items</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#16A34A' }}>
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getOrderStatusLabel(invoice.status)}
                        color={getOrderStatusColor(invoice.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Invoice">
                          <IconButton size="small" color="primary" aria-label={`View ${invoice.id}`}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton size="small" color="secondary" aria-label={`Download ${invoice.id}`}>
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print">
                          <IconButton size="small" aria-label={`Print ${invoice.id}`}>
                            <Print fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </MainLayout>
  );
}
