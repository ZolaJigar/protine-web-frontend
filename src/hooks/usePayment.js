'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { paymentsAPI } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { useRazorpay } from './useRazorpay';
import config from '@/lib/config';

/** sessionStorage key used to survive accidental page refreshes mid-payment */
const PENDING_ORDER_KEY = 'pendingPaymentOrderId';

/**
 * usePayment
 *
 * Manages the full Razorpay payment lifecycle:
 *   1. initiatePayment(orderId) — creates Razorpay order, opens checkout modal
 *   2. retryPayment(orderId)    — retries a failed/dismissed payment
 *
 * State:
 *   loading       — true while any async operation is in progress
 *   error         — last error message, or null
 *   paymentStatus — 'idle' | 'creating' | 'pending' | 'success' | 'failed'
 */
export function usePayment() {
  const router = useRouter();
  const { state } = useApp();
  const { openRazorpay } = useRazorpay();

  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle');

  // ── Verify payment server-side ─────────────────────────────────────────────
  const verifyPayment = useCallback(
    async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }) => {
      try {
        await paymentsAPI.verify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });

        setPaymentStatus('success');
        sessionStorage.removeItem(PENDING_ORDER_KEY);
        toast.success('Payment successful! Your order is confirmed.');
        router.push(`/orders/${orderId}/success`);
      } catch (err) {
        const data    = err?.response?.data;
        const message = data?.message ?? 'Payment verification failed.';
        const paymentNumber = data?.data?.payment_number ?? '';

        setPaymentStatus('failed');
        setError(message);

        const detail = paymentNumber ? ` (Ref: ${paymentNumber})` : '';
        toast.error(
          `Payment verification failed${detail}. Contact support if amount was deducted.`,
          { autoClose: 8000 },
        );
      }
    },
    [router],
  );

  // ── Open Razorpay modal ────────────────────────────────────────────────────
  const openModal = useCallback(
    ({ payment, razorpay_key_id, orderId }) => {
      const user = state.user;

      const options = {
        key:         razorpay_key_id || config.razorpayKeyId,
        // amount is in rupees from backend — multiply by 100 for paise
        amount:      Math.round(Number(payment.amount) * 100),
        currency:    'INR',
        order_id:    payment.razorpay_order_id,
        name:        config.appName || 'Protine Web',
        description: 'Order Payment',
        prefill: {
          name:    user?.name    ?? '',
          email:   user?.email   ?? '',
          contact: user?.phone   ?? '',
        },
        theme: {
          color: '#FF5722',
        },

        // Called by Razorpay on successful payment (client-side)
        handler: async (response) => {
          setPaymentStatus('pending');
          setLoading(true);
          try {
            await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId,
            });
          } finally {
            setLoading(false);
          }
        },

        modal: {
          // Do NOT auto-retry — show a retry button and let the user decide
          ondismiss: () => {
            setPaymentStatus('failed');
            setLoading(false);
            toast.warn(
              (t) => (
                <div>
                  <span>Payment cancelled.</span>{' '}
                  <button
                    style={{ marginLeft: 8, fontWeight: 700, background: 'none', border: 'none', color: '#FF5722', cursor: 'pointer' }}
                    onClick={() => {
                      toast.dismiss(t.id);
                      retryPayment(orderId);
                    }}
                  >
                    Retry
                  </button>
                </div>
              ),
              { autoClose: 10000 },
            );
          },
        },
      };

      setPaymentStatus('pending');
      openRazorpay(options).catch((err) => {
        setPaymentStatus('failed');
        setError(err?.message ?? 'Could not open payment gateway.');
        toast.error(err?.message ?? 'Could not open payment gateway. Please try again.');
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openRazorpay, state.user, verifyPayment],
  );

  // ── Initiate payment ───────────────────────────────────────────────────────
  const initiatePayment = useCallback(
    async (orderId) => {
      setLoading(true);
      setError(null);
      setPaymentStatus('creating');

      // Persist order ID in case of page refresh
      sessionStorage.setItem(PENDING_ORDER_KEY, String(orderId));

      try {
        const res = await paymentsAPI.createOrder({ order_id: orderId });
        const { payment, razorpay_key_id } = res.data?.data ?? {};

        if (!payment?.razorpay_order_id) {
          throw new Error('Invalid payment order response from server.');
        }

        openModal({ payment, razorpay_key_id, orderId });
      } catch (err) {
        const status  = err?.response?.status;
        const message = err?.response?.data?.message ?? err?.message ?? 'Could not create payment order.';

        // Already paid — redirect to success
        if (status === 400 && message.toLowerCase().includes('already paid')) {
          toast.info('This order has already been paid.');
          router.push(`/orders/${orderId}/success`);
          return;
        }

        setPaymentStatus('failed');
        setError(message);
        setLoading(false);
        toast.error(message);
      }
    },
    [openModal, router],
  );

  // ── Retry payment ──────────────────────────────────────────────────────────
  const retryPayment = useCallback(
    async (orderId) => {
      setLoading(true);
      setError(null);
      setPaymentStatus('creating');

      sessionStorage.setItem(PENDING_ORDER_KEY, String(orderId));

      try {
        const res = await paymentsAPI.retry({ order_id: orderId });
        const { payment, razorpay_key_id } = res.data?.data ?? {};

        if (!payment?.razorpay_order_id) {
          throw new Error('Invalid retry payment order response from server.');
        }

        openModal({ payment, razorpay_key_id, orderId });
      } catch (err) {
        const message = err?.response?.data?.message ?? err?.message ?? 'Could not retry payment.';
        setPaymentStatus('failed');
        setError(message);
        setLoading(false);
        toast.error(message);
      }
    },
    [openModal],
  );

  return {
    loading,
    error,
    paymentStatus,
    initiatePayment,
    retryPayment,
  };
}
