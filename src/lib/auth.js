/**
 * auth.js — Authentication utilities for Protine Web
 */

import { authAPI } from './api';

/**
 * Send a login OTP via phone.
 * Backend: POST /auth/send-login-otp { country_code, phone }
 * Note: OTP is sent to the user's registered EMAIL, phone is just the identifier.
 *
 * @param {string} phone        - Digits only, no country code prefix
 * @param {string} countryCode  - e.g. "+91"
 * @returns {Promise<string>}   - Success message from the server
 */
export async function sendLoginOtpRequest(phone, countryCode = '+91') {
  const res = await authAPI.sendLoginOtp({ country_code: countryCode, phone });
  return res.data?.message || null;
}

/**
 * Parse Zod validation errors (from the server's 422 response)
 * into a flat { fieldName: errorMessage } object.
 *
 * Expected shape of the `errors` array from the server:
 *   [{ path: ['email'], message: 'Invalid email' }, ...]
 *
 * @param {Array} errors  - Array of Zod-style error objects
 * @returns {Object}      - { fieldName: firstErrorMessage }
 */
export function parseZodErrors(errors) {
  if (!Array.isArray(errors)) return {};
  return errors.reduce((acc, err) => {
    const key = Array.isArray(err.path) ? err.path[0] : err.path;
    if (key && !acc[key]) acc[key] = err.message;
    return acc;
  }, {});
}
