import { Chip } from '@mui/material';
import {
  CheckCircle, Cancel, HourglassEmpty, CurrencyRupee,
} from '@mui/icons-material';

/**
 * PaymentStatusBadge
 *
 * Displays a colored MUI Chip for a payment status.
 *
 * Props:
 *   status  — 'created' | 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded' | 'partial_refunded'
 *   size    — 'small' (default) | 'medium'
 */
const STATUS_CONFIG = {
  success: {
    label: 'Paid',
    color: 'success',   // green
    icon:  <CheckCircle fontSize="small" />,
  },
  failed: {
    label: 'Failed',
    color: 'error',     // red
    icon:  <Cancel fontSize="small" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'error',     // red
    icon:  <Cancel fontSize="small" />,
  },
  pending: {
    label: 'Pending',
    color: 'warning',   // yellow
    icon:  <HourglassEmpty fontSize="small" />,
  },
  created: {
    label: 'Created',
    color: 'warning',   // yellow
    icon:  <HourglassEmpty fontSize="small" />,
  },
  refunded: {
    label: 'Refunded',
    color: 'info',      // blue
    icon:  <CurrencyRupee fontSize="small" />,
  },
  partial_refunded: {
    label: 'Part Refunded',
    color: 'info',      // blue
    icon:  <CurrencyRupee fontSize="small" />,
  },
};

export default function PaymentStatusBadge({ status, size = 'small' }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status ?? 'Unknown',
    color: 'default',
    icon:  <HourglassEmpty fontSize="small" />,
  };

  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      icon={cfg.icon}
      size={size}
      sx={{ fontWeight: 700, textTransform: 'capitalize' }}
    />
  );
}
