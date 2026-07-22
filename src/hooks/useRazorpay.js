'use client';

import { useCallback, useRef, useState } from 'react';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * useRazorpay
 *
 * Dynamically loads the Razorpay checkout.js script once and provides
 * an `openRazorpay(options)` function that opens the checkout modal.
 *
 * Usage:
 *   const { openRazorpay, loading, error } = useRazorpay();
 *   openRazorpay({ key, amount, currency, order_id, ... });
 */
export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Track whether the script is already loaded so we don't inject it twice.
  const scriptLoadedRef = useRef(false);

  /** Injects the Razorpay script and resolves when it's ready. */
  const loadScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Already available on window
      if (typeof window !== 'undefined' && window.Razorpay) {
        scriptLoadedRef.current = true;
        resolve();
        return;
      }

      // Already injected but not yet loaded
      const existing = document.getElementById('razorpay-checkout-js');
      if (existing) {
        existing.addEventListener('load', () => { scriptLoadedRef.current = true; resolve(); });
        existing.addEventListener('error', () => reject(new Error('Razorpay script failed to load.')));
        return;
      }

      const script  = document.createElement('script');
      script.id     = 'razorpay-checkout-js';
      script.src    = RAZORPAY_SCRIPT_URL;
      script.async  = true;

      script.onload = () => {
        scriptLoadedRef.current = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay checkout script. Check your internet connection.'));
      };

      document.body.appendChild(script);
    });
  }, []);

  /**
   * Opens the Razorpay checkout modal.
   *
   * @param {Object} options - Standard Razorpay checkout options
   *   (key, amount, currency, order_id, name, description, prefill, handler, modal, theme, …)
   */
  const openRazorpay = useCallback(
    async (options) => {
      setLoading(true);
      setError(null);

      try {
        await loadScript();
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        const message = err?.message ?? 'Could not open payment gateway.';
        setError(message);
        // Propagate so the caller can show a toast / update state
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadScript],
  );

  return { openRazorpay, loading, error };
}
