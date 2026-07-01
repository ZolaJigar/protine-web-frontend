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
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
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
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  /**
   * Place a new order from the active cart.
   * POST /orders/place — multipart/form-data
   * Fields: address_id (required), notes (optional)
   */
  place: (data) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return api.post('/orders/place', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  /**
   * List orders for the logged-in user.
   * POST /orders/list — multipart/form-data
   * Fields: page (default 1), limit (default 10)
   */
  list: (data = {}) => {
    const form = new FormData();
    if (data.page) form.append('page', data.page);
    if (data.limit) form.append('limit', data.limit);
    return api.post('/orders/list', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Get order detail by ID.
   * GET /orders/:id
   */
  getById: (id) => api.get(`/orders/${id}`),

  /**
   * Cancel a pending or confirmed order.
   * PUT /orders/cancel/:id — multipart/form-data
   * Fields: cancellation_reason (optional)
   */
  cancel: (id, data = {}) => {
    const form = new FormData();
    if (data.cancellation_reason) form.append('cancellation_reason', data.cancellation_reason);
    return api.put(`/orders/cancel/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Reorder — adds items from a previous order back into the cart.
   * POST /orders/reorder/:id
   */
  reorder: (id) => api.post(`/orders/reorder/${id}`),

  /**
   * View invoice as HTML in browser.
   * GET /orders/invoice/view/:id
   */
  viewInvoice: (id) => `${BASE_URL}/orders/invoice/view/${id}`,

  /**
   * Download invoice as PDF.
   * GET /orders/invoice/download/:id
   */
  downloadInvoice: (id) =>
    api.get(`/orders/invoice/download/${id}`, { responseType: 'blob' }),
};

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: (params) => api.get('/payments/history', { params }),
  refund: (paymentId, data) => api.post(`/payments/${paymentId}/refund`, data),
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
