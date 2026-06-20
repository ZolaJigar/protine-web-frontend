/**
 * functions.js - Shared utility functions for Protine Web
 */

// ─── DATE & TIME ─────────────────────────────────────────────────────────────

/**
 * Format a date string or Date object to a readable format
 * e.g. "20 Jun 2026"
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date with time
 * e.g. "20 Jun 2026, 10:30 AM"
 */
export function formatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get relative time string
 * e.g. "2 days ago", "just now"
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// ─── CURRENCY & PRICE ────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees
 * e.g. 1999 → "₹1,999.00"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discounted price
 */
export function calculateDiscount(originalPrice, discountPercent) {
  if (!originalPrice || !discountPercent) return originalPrice;
  return originalPrice - (originalPrice * discountPercent) / 100;
}

/**
 * Calculate cart total from items array
 */
export function calculateCartTotal(items) {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Calculate GST amount
 */
export function calculateGST(amount, gstRate = 18) {
  return (amount * gstRate) / 100;
}

// ─── STRING HELPERS ──────────────────────────────────────────────────────────

/**
 * Truncate a string to a given length
 */
export function truncate(str, maxLength = 100) {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to slug format
 * e.g. "Ketchup & Sauce" → "ketchup-sauce"
 */
export function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Get initials from a name
 * e.g. "John Doe" → "JD"
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── VALIDATION ──────────────────────────────────────────────────────────────

/**
 * Validate email address
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Indian mobile number
 */
export function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

/**
 * Validate Indian pincode
 */
export function isValidPincode(pincode) {
  return /^\d{6}$/.test(pincode);
}

/**
 * Password strength checker
 * Returns: 'weak' | 'medium' | 'strong'
 */
export function getPasswordStrength(password) {
  if (!password) return 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial, password.length >= 8].filter(Boolean).length;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────

/**
 * Safely get item from localStorage
 */
export function getFromStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
export function setInStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ─── ORDER HELPERS ───────────────────────────────────────────────────────────

/**
 * Get order status color for MUI chips
 */
export function getOrderStatusColor(status) {
  const map = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'default',
  };
  return map[status?.toLowerCase()] || 'default';
}

/**
 * Get order status label
 */
export function getOrderStatusLabel(status) {
  return capitalize(status?.replace(/_/g, ' ') || '');
}

// ─── MISC ────────────────────────────────────────────────────────────────────

/**
 * Generate a random ID (client-side only, for temp keys)
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Group an array of objects by a key
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Format file size in bytes to human readable
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
