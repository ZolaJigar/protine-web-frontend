/**
 * api.js - Centralized API layer for Protine Web
 * All HTTP methods (GET, POST, DELETE) using Axios
 */

import axios from 'axios';
import config from './config';
import log from './logger';

const BASE_URL = config.apiUrl;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('accessToken');
      if (raw) {
        const token = raw.startsWith('"') ? JSON.parse(raw) : raw;
        config.headers.Authorization = `Bearer ${token}`;
        log.debug('API:REQ', `${config.method?.toUpperCase()} ${config.url}`, {
          hasToken: true,
          tokenPrefix: token.slice(0, 20) + '…',
        });
      } else {
        // Log all localStorage keys to help diagnose why token is missing
        const allKeys = Object.keys(localStorage);
        log.warn('API:REQ', `${config.method?.toUpperCase()} ${config.url} — no token in localStorage`, {
          storedKeys: allKeys,
        });
      }
    }
    return config;
  },
  (error) => {
    log.error('API:REQ', 'Request setup error', { message: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 and refresh
api.interceptors.response.use(
  (response) => {
    log.debug('API:RES', `${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status  = error.response?.status;
    const url     = originalRequest?.url ?? '?';
    const method  = originalRequest?.method?.toUpperCase() ?? '?';
    const message = error.response?.data?.message ?? error.message;

    log.error('API:RES', `${status} ${method} ${url}`, {
      message,
      data: error.response?.data,
    });

    // Attach a normalised message to the error so callers can do
    // err?.response?.data?.message reliably even when the server returns 500 with {}
    if (error.response && !error.response.data?.message) {
      error.response.data = {
        ...(error.response.data ?? {}),
        message: message || `Server error (${status})`,
      };
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      log.warn('API:REFRESH', 'Access token expired — attempting refresh');
      try {
        const raw = localStorage.getItem('refreshToken');
        const refreshToken = raw ? (raw.startsWith('"') ? JSON.parse(raw) : raw) : null;

        if (!refreshToken) {
          log.error('API:REFRESH', 'No refresh token found — redirecting to login');
          if (typeof window !== 'undefined') window.location.href = '/login';
          return Promise.reject(error);
        }

        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        const { token } = res.data.data ?? res.data;
        localStorage.setItem('accessToken', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        log.info('API:REFRESH', 'Token refreshed — retrying original request');
        return api(originalRequest);
      } catch (refreshErr) {
        log.error('API:REFRESH', 'Refresh failed — clearing session and redirecting to login', {
          status: refreshErr?.response?.status,
          message: refreshErr?.response?.data?.message ?? refreshErr.message,
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  /** Option 1: Email + Password → { user, token, refreshToken } */
  login: (data) => api.post('/auth/login', data),

  /** Option 2a: Send OTP to phone → POST { country_code, phone } */
  sendLoginOtp: (data) => api.post('/auth/send-login-otp', data),

  /** Option 2b: Verify OTP → POST { country_code, phone, otp } → { user, token, refreshToken } */
  verifyLoginOtp: (data) => api.post('/auth/verify-login-otp', data),

  /** Forgot password → POST { email } */
  forgotPassword: (data) => api.post('/auth/forgot-password', data),

  /** Reset password → POST { email, otp, newPassword, confirmPassword } */
  resetPassword: (data) => api.post('/auth/reset-password', data),

  /** Refresh token → POST { refreshToken } → { token, refreshToken } */
  refreshToken: (data) => api.post('/auth/refresh-token', data),

  logout: () => api.post('/auth/logout'),
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────
export const profileAPI = {
  /**
   * GET /users/profile — returns the logged-in user's full profile.
   * Token identifies the user; no :id in URL.
   */
  get: () => api.get('/users/profile'),

  /**
   * PUT /users/profile-update — update profile (multipart/form-data).
   * Editable: name, phone, country_code, gender, date_of_birth, image (file, max 5MB).
   * NOT editable: email.
   */
  update: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.put('/users/profile-update', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },

  /**
   * POST /users/change-password — change password directly (no OTP needed).
   * Body: { newPassword }
   */
  changePassword: (data) => api.post('/users/change-password', data),
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  /**
   * Create a new user (POST /users).
   * Accepts either a plain object or a FormData instance.
   * When `data` contains an `image` File, pass a FormData object — the
   * Content-Type header is set to multipart/form-data automatically.
   *
   * Fields:
   *   name      string   required  max 255 chars
   *   email     string   required  valid email, max 255 chars
   *   password  string   required  min 6 chars
   *   role_id   number   required  valid existing role ID
   *   gender    string   optional  "Male" | "Female" | "Other"
   *   phone     string   optional  max 20 chars
   *   dob       string   optional  YYYY-MM-DD
   *   image     File     optional  jpeg / png / gif / webp only
   */
  create: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.post('/users', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (body) => api.post('/products/list', body),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── PRODUCT VARIANTS ────────────────────────────────────────────────────────
export const variantsAPI = {
  getByProduct: (body) => api.post('/product-variants/list', body),
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: (params) => api.get('/categories/list', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  getSubCategories: (id) => api.get(`/categories/${id}/subcategories`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─── CART ─────────────────────────────────────────────────────────────────────
// Guest callers must pass { sessionId } in options to inject x-session-id header.
// Logged-in callers rely on the request interceptor for the Bearer token.
const cartHeaders = (sessionId) =>
  sessionId ? { 'x-session-id': sessionId } : {};

export const cartAPI = {
  /**
   * GET /cart/list
   * Retrieves the active cart for the current user or guest session.
   */
  getCart: (sessionId) =>
    api.get('/cart/list', { headers: cartHeaders(sessionId) }),

  /**
   * POST /cart/add-item
   * Body: { product_id, product_variant_id, quantity }
   * Response.data.data.session_id → save to localStorage for guests
   */
  addItem: (data, sessionId) =>
    api.post('/cart/add-item', data, { headers: cartHeaders(sessionId) }),

  /**
   * PUT /cart/update-item/:id  (:id = CartItem ID)
   * Body: { quantity }
   */
  updateItem: (cartItemId, data, sessionId) =>
    api.put(`/cart/update-item/${cartItemId}`, data, { headers: cartHeaders(sessionId) }),

  /**
   * DELETE /cart/remove-item/:id  (:id = CartItem ID)
   */
  removeItem: (cartItemId, sessionId) =>
    api.delete(`/cart/remove-item/${cartItemId}`, { headers: cartHeaders(sessionId) }),

  /**
   * DELETE /cart/clear
   */
  clearCart: (sessionId) =>
    api.delete('/cart/clear', { headers: cartHeaders(sessionId) }),

  /**
   * POST /cart/merge  — call after login to merge guest cart into user cart.
   * Requires Authorization header (set by interceptor) + x-session-id header.
   * Body (optional): { session_id }
   */
  merge: (sessionId) =>
    api.post(
      '/cart/merge',
      { session_id: sessionId },
      { headers: cartHeaders(sessionId) },
    ),
};

// ─── LOCATIONS (countries / states / cities) ──────────────────────────────────
export const locationsAPI = {
  /** POST /countries/list — public, no auth */
  listCountries: (body = {}) => api.post('/countries/list', body),
  /** POST /states/list — public, filter by country_id */
  listStates: (body = {}) => api.post('/states/list', body),
  /** POST /cities/list — public, filter by state_id / country_id */
  listCities: (body = {}) => api.post('/cities/list', body),
};

// ─── ADDRESSES ───────────────────────────────────────────────────────────────
export const addressesAPI = {
  /** POST /addresses/list — body: { page, limit, user_id, address_type, is_default } (all optional) */
  list: (body = {}) => api.post('/addresses/list', body),

  /** GET /addresses/:id */
  getById: (id) => api.get(`/addresses/${id}`),

  /**
   * POST /addresses/create
   * Required: user_id, name, mobile, address_line_1, postal_code, city_id, state_id, country_id
   * Optional: address_line_2, landmark, address_type, is_default
   */
  create: (data) => api.post('/addresses/create', data),

  /** PUT /addresses/update/:id — same fields as create, all optional */
  update: (id, data) => api.put(`/addresses/update/${id}`, data),

  /** DELETE /addresses/delete/:id */
  delete: (id) => api.delete(`/addresses/delete/${id}`),
};

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  /** POST /wishlist/add-item — { product_id, product_variant_id } */
  addItem: (data) => api.post('/wishlist/add-item', data),

  /** GET /wishlist/list */
  getList: () => api.get('/wishlist/list'),

  /** DELETE /wishlist/remove-item/:id  (:id = wishlist entry ID) */
  removeItem: (id) => api.delete(`/wishlist/remove-item/${id}`),

  /** DELETE /wishlist/clear */
  clear: () => api.delete('/wishlist/clear'),
};

// ─── COUPONS ──────────────────────────────────────────────────────────────────
export const couponsAPI = {
  /**
   * GET /coupons/available — list all coupons visible to the user.
   * Requires auth.
   */
  getAvailable: () => api.get('/coupons/available'),

  /**
   * POST /coupons/validate — validate a coupon code before order placement.
   * Body: { coupon_code, order_amount }
   * Response: { coupon_code, discount_type, discount_amount, final_amount }
   * Requires auth.
   */
  validate: (data) => api.post('/coupons/validate', data),

  /**
   * POST /coupons/apply — apply a coupon to an order (records usage).
   * Body: { coupon_code, order_amount }
   * Response: { coupon_id, coupon_code, discount_type, discount_amount, original_amount, final_amount }
   * Requires auth.
   */
  apply: (data) => api.post('/coupons/apply', data),
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  /**
   * Place a new order from the active cart.
   * POST /orders/place
   * Body: { address_id (required), coupon_code (optional), notes (optional) }
   */
  place: (data) => api.post('/orders/place', data),

  /**
   * List orders for the logged-in user.
   * POST /orders/list
   * Body (optional): { page, limit }
   */
  list: (data = {}) => api.post('/orders/list', data),

  /**
   * Get order detail by ID.
   * GET /orders/:id
   */
  getById: (id) => api.get(`/orders/${id}`),

  /**
   * Get order tracking timeline.
   * GET /orders/tracking/:id
   */
  tracking: (id) => api.get(`/orders/tracking/${id}`),

  /**
   * Cancel a pending or confirmed order.
   * PUT /orders/cancel/:id
   * Body: { cancellation_reason (min 3, max 500 chars) }
   */
  cancel: (id, data = {}) => api.put(`/orders/cancel/${id}`, data),

  /**
   * Reorder — adds items from a previous order back into the cart.
   * POST /orders/reorder/:id
   */
  reorder: (id) => api.post(`/orders/reorder/${id}`),

  /**
   * View invoice as HTML in browser.
   * GET /orders/invoice/view/:id
   * Returns the URL string — open in a new tab or iframe.
   */
  viewInvoice: (id) => `${BASE_URL}/orders/invoice/view/${id}`,

  /**
   * Download invoice as PDF.
   * GET /orders/invoice/download/:id
   */
  downloadInvoice: (id) =>
    api.get(`/orders/invoice/download/${id}`, { responseType: 'blob' }),

  /**
   * Get order dashboard stats for the logged-in user.
   * GET /orders/dashboard
   * Returns: { totalOrders, ... }
   */
  dashboard: () => api.get('/orders/dashboard'),
};

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  /**
   * Create a Razorpay order for an existing order.
   * POST /payments/create-order
   * Body: { order_id }
   * Response: { data: { payment: { id, razorpay_order_id, amount }, razorpay_key_id } }
   */
  createOrder: (data) => api.post('/payments/create-order', data),

  /**
   * Verify a Razorpay payment after checkout completes.
   * POST /payments/verify
   * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * Response: { data: { id, status, paid_amount, paid_at } }
   */
  verify: (data) => api.post('/payments/verify', data),

  /**
   * Retry a failed payment for an existing order.
   * POST /payments/retry
   * Body: { order_id }
   * Response: same as createOrder
   */
  retry: (data) => api.post('/payments/retry', data),

  /**
   * Get paginated payment history for the logged-in user.
   * GET /payments/history
   */
  getHistory: (params) => api.get('/payments/history', { params }),

  /**
   * Get a single payment detail.
   * GET /payments/:id
   */
  getById: (id) => api.get(`/payments/${id}`),

  /** @deprecated use createOrder instead */
  initiate: (data) => api.post('/payments/initiate', data),

  refund: (paymentId, data) => api.post(`/payments/${paymentId}/refund`, data),
};

// ─── BANNERS ─────────────────────────────────────────────────────────────────
export const bannersAPI = {
  /** POST /banners/list — public, no auth required */
  getList: (body = { page: 1, limit: 10 }) => api.post('/banners/list', body),
};

// ─── CONTACT US ──────────────────────────────────────────────────────────────
export const contactUsAPI = {
  /** GET /contact-us/list — public, no auth required */
  getList: () => api.get('/contact-us/list'),

  /** GET /admin/contact-us/:id — auth required */
  getById: (id) => api.get(`/admin/contact-us/${id}`),

  /** POST /admin/contact-us/create — auth required */
  create: (data) => api.post('/admin/contact-us/create', data),

  /** PUT /admin/contact-us/update/:id — auth required */
  update: (id, data) => api.put(`/admin/contact-us/update/${id}`, data),

  /** DELETE /admin/contact-us/delete/:id — auth required */
  delete: (id) => api.delete(`/admin/contact-us/delete/${id}`),
};

// ─── SUPPORT ─────────────────────────────────────────────────────────────────
export const supportAPI = {
  getTickets: () => api.get('/support/tickets'),
  createTicket: (data) => api.post('/support/tickets', data),
  getTicketById: (id) => api.get(`/support/tickets/${id}`),
  replyTicket: (id, data) => api.post(`/support/tickets/${id}/reply`, data),
  closeTicket: (id) => api.put(`/support/tickets/${id}/close`),
};

// ─── INVOICES ────────────────────────────────────────────────────────────────
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  download: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

// ─── DELIVERY ────────────────────────────────────────────────────────────────
export const deliveryAPI = {
  getStatus: (orderId) => api.get(`/delivery/${orderId}/status`),
  scheduleWhatsAppReminder: (data) => api.post('/delivery/whatsapp-reminder', data),
};

export default api;
