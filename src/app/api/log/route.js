/**
 * POST /api/log
 * Receives log entries from the browser and prints them to the Next.js terminal.
 */

const LEVEL_COLORS = {
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[35m',  // magenta
};
const RESET = '\x1b[0m';

export async function POST(request) {
  try {
    const body = await request.json();
    const { level = 'info', tag = 'CLIENT', message, data } = body;

    const color  = LEVEL_COLORS[level] ?? LEVEL_COLORS.info;
    const time   = new Date().toISOString().slice(11, 23); // HH:mm:ss.mmm
    const prefix = `${color}[${time}] [${level.toUpperCase()}] [${tag}]${RESET}`;

    if (data !== undefined) {
      console.log(prefix, message);
      console.log('         ', JSON.stringify(data, null, 2));
    } else {
      console.log(prefix, message);
    }
  } catch {
    // swallow — don't break the app for a logging failure
  }

  return new Response(null, { status: 204 });
}
