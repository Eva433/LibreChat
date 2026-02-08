/**
 * SSE Headers Middleware
 *
 * Sets appropriate headers for Server-Sent Events streams.
 * Uses secure CORS settings based on the request origin.
 */

/**
 * Get allowed origins for SSE connections
 */
function getAllowedOrigins() {
  const origins = new Set();

  // Allow the configured client domain
  if (process.env.DOMAIN_CLIENT) {
    origins.add(process.env.DOMAIN_CLIENT.replace(/\/$/, ''));
  }

  // Allow additional origins from env var (comma-separated)
  if (process.env.SSE_ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.SSE_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    additionalOrigins.forEach((origin) => {
      if (origin) {
        origins.add(origin);
      }
    });
  }

  // In development, allow common localhost ports
  if (process.env.NODE_ENV !== 'production') {
    const devPorts = ['3080', '3090', '5173', '5174', '4173'];
    devPorts.forEach((port) => {
      origins.add(`http://localhost:${port}`);
      origins.add(`http://127.0.0.1:${port}`);
    });
  }

  return origins;
}

/**
 * Determine the CORS origin to use for SSE headers
 */
function getSSECorsOrigin(req) {
  const requestOrigin = req.get('origin');

  // If strict SSE CORS is disabled, use wildcard for backwards compatibility
  if (process.env.ENABLE_STRICT_SSE_CORS !== 'true') {
    return '*';
  }

  // If no origin header (same-origin request), allow it
  if (!requestOrigin) {
    return process.env.DOMAIN_CLIENT || '*';
  }

  // Check if the request origin is allowed
  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.has(requestOrigin)) {
    return requestOrigin;
  }

  // If not in allowed list, use the configured client domain
  // This will cause CORS to fail for unauthorized origins
  return process.env.DOMAIN_CLIENT || '';
}

function setHeaders(req, res, next) {
  const corsOrigin = getSSECorsOrigin(req);

  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'X-Accel-Buffering': 'no',
  });
  next();
}

module.exports = setHeaders;
