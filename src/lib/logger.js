/**
 * logger.js — client-side logger that forwards entries to the Next.js terminal
 * via POST /api/log so you can see them in the dev server console.
 *
 * Usage:
 *   import log from '@/lib/logger';
 *   log.info('TAG', 'message', optionalData);
 *   log.error('API', 'Request failed', { status: 401, url: '/orders/list' });
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

async function send(level, tag, message, data) {
  // Always log to browser console too
  const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[method](`[${tag}]`, message, data ?? '');

  if (!IS_DEV || typeof window === 'undefined') return;

  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, tag, message, data }),
      // fire-and-forget — don't await result for logging
    });
  } catch {
    // never let logger crash the app
  }
}

const log = {
  info:  (tag, message, data) => send('info',  tag, message, data),
  warn:  (tag, message, data) => send('warn',  tag, message, data),
  error: (tag, message, data) => send('error', tag, message, data),
  debug: (tag, message, data) => send('debug', tag, message, data),
};

export default log;
