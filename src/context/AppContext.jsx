'use client';

import {
  createContext, useContext, useReducer, useEffect, useCallback, useRef,
} from 'react';
import { getFromStorage, removeFromStorage } from '@/lib/functions';
import { cartAPI, wishlistAPI } from '@/lib/api';
import log from '@/lib/logger';

// ─── Constants ────────────────────────────────────────────────────────────────
const GUEST_SESSION_KEY = 'guestSessionId';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  isAuthenticated: false,

  // Cart — server-driven
  cart: null,
  cartItems: [],
  cartSummary: {
    total_items: 0,
    subtotal_amount: 0,
    discount_amount: 0,
    tax_amount: 0,
    shipping_amount: 0,
    grand_total: 0,
  },

  // Wishlist — only the count is kept here for the badge; full list is managed by the wishlist page
  wishlistCount: 0,

  notifications: [],
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {

    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };

    case 'LOGOUT':
      removeFromStorage('accessToken');
      removeFromStorage('refreshToken');
      removeFromStorage('user');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: null,
        cartItems: [],
        cartSummary: { ...initialState.cartSummary },
        wishlistCount: 0,
      };

    // ── Cart ─────────────────────────────────────────────────────────────────
    case 'SET_CART': {
      const cartData = action.payload;
      if (!cartData) {
        return {
          ...state,
          cart: null,
          cartItems: [],
          cartSummary: { ...initialState.cartSummary },
        };
      }
      return {
        ...state,
        cart: cartData,
        cartItems: Array.isArray(cartData.items) ? cartData.items : [],
        cartSummary: {
          total_items:     Number(cartData.total_items     ?? 0),
          subtotal_amount: Number(cartData.subtotal_amount ?? 0),
          discount_amount: Number(cartData.discount_amount ?? 0),
          tax_amount:      Number(cartData.tax_amount      ?? 0),
          shipping_amount: Number(cartData.shipping_amount ?? 0),
          grand_total:     Number(cartData.grand_total     ?? 0),
        },
      };
    }

    case 'UPDATE_CART_SUMMARY': {
      const s = action.payload;
      return {
        ...state,
        cartSummary: {
          total_items:     Number(s.total_items     ?? state.cartSummary.total_items),
          subtotal_amount: Number(s.subtotal_amount ?? state.cartSummary.subtotal_amount),
          discount_amount: Number(s.discount_amount ?? state.cartSummary.discount_amount),
          tax_amount:      Number(s.tax_amount      ?? state.cartSummary.tax_amount),
          shipping_amount: Number(s.shipping_amount ?? state.cartSummary.shipping_amount),
          grand_total:     Number(s.grand_total     ?? state.cartSummary.grand_total),
        },
      };
    }

    // ── Wishlist ──────────────────────────────────────────────────────────────
    case 'SET_WISHLIST_COUNT':
      return { ...state, wishlistCount: Number(action.payload ?? 0) };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const cartFetchingRef   = useRef(false);

  // ── Guest session ─────────────────────────────────────────────────────────
  const getGuestSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GUEST_SESSION_KEY) || null;
  }, []);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (cartFetchingRef.current) return;
    cartFetchingRef.current = true;
    try {
      const sessionId = getGuestSessionId();
      const res       = await cartAPI.getCart(sessionId);
      const data      = res.data?.data;
      const cartData  = data?.cart === null ? null : (data?.id ? data : data?.cart ?? null);
      dispatch({ type: 'SET_CART', payload: cartData });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 400) {
        dispatch({ type: 'SET_CART', payload: null });
      } else {
        log.warn('CART', 'fetchCart failed', { message: err?.message });
      }
    } finally {
      cartFetchingRef.current = false;
    }
  }, [getGuestSessionId]);

  // ── Wishlist count ────────────────────────────────────────────────────────
  const fetchWishlistCount = useCallback(async () => {
    // Only meaningful for logged-in users
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res   = await wishlistAPI.getList();
      const count = res.data?.data?.count ?? (res.data?.data?.data ?? []).length ?? 0;
      dispatch({ type: 'SET_WISHLIST_COUNT', payload: count });
    } catch {
      // silently ignore — badge just stays at 0
    }
  }, []);

  // ── Mount hydration ───────────────────────────────────────────────────────
  useEffect(() => {
    const user = getFromStorage('user');
    if (user) dispatch({ type: 'SET_USER', payload: user });

    fetchCart();
    fetchWishlistCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId, variantId, quantity = 1) => {
    if (!productId) throw new Error('product_id is required');
    if (!variantId) throw new Error('product_variant_id is required');

    const sessionId = getGuestSessionId();
    const res       = await cartAPI.addItem(
      {
        product_id:         Number(productId),
        product_variant_id: Number(variantId),
        quantity:           Number(quantity),
      },
      sessionId,
    );
    const data = res.data?.data;
    if (data?.session_id && typeof window !== 'undefined') {
      localStorage.setItem(GUEST_SESSION_KEY, data.session_id);
      log.debug('CART', 'Guest session_id saved', { session_id: data.session_id });
    }
    if (data) dispatch({ type: 'UPDATE_CART_SUMMARY', payload: data });
    await fetchCart();
    return data;
  }, [getGuestSessionId, fetchCart]);

  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    const sessionId = getGuestSessionId();
    const res       = await cartAPI.updateItem(cartItemId, { quantity }, sessionId);
    const data      = res.data?.data;
    if (data) dispatch({ type: 'UPDATE_CART_SUMMARY', payload: data });
    await fetchCart();
    return data;
  }, [getGuestSessionId, fetchCart]);

  const removeFromCart = useCallback(async (cartItemId) => {
    const sessionId = getGuestSessionId();
    const res       = await cartAPI.removeItem(cartItemId, sessionId);
    const data      = res.data?.data;
    if (data) dispatch({ type: 'UPDATE_CART_SUMMARY', payload: data });
    await fetchCart();
    return data;
  }, [getGuestSessionId, fetchCart]);

  const clearCart = useCallback(async () => {
    const sessionId = getGuestSessionId();
    await cartAPI.clearCart(sessionId);
    dispatch({ type: 'SET_CART', payload: null });
  }, [getGuestSessionId]);

  const mergeGuestCart = useCallback(async () => {
    const sessionId = getGuestSessionId();
    if (!sessionId) return null;
    try {
      const res  = await cartAPI.merge(sessionId);
      const data = res.data?.data;
      log.info('CART', 'Guest cart merged', { message: res.data?.message });
      if (typeof window !== 'undefined') localStorage.removeItem(GUEST_SESSION_KEY);
      await fetchCart();
      return data;
    } catch (err) {
      log.warn('CART', 'mergeGuestCart failed', { message: err?.message });
      return null;
    }
  }, [getGuestSessionId, fetchCart]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const cartCount     = state.cartSummary.total_items;
  const cartTotal     = state.cartSummary.grand_total;
  const wishlistCount = state.wishlistCount;

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        // Cart
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        mergeGuestCart,
        // Wishlist
        fetchWishlistCount,
        // Counts
        cartCount,
        cartTotal,
        wishlistCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
