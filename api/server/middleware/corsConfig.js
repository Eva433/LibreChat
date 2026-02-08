/**
 * CORS Configuration
 *
 * Provides secure CORS settings that:
 * 1. Allow requests from configured DOMAIN_CLIENT
 * 2. Support development environments (localhost)
 * 3. Allow additional origins via CORS_ALLOWED_ORIGINS env var
 * 4. Properly handle credentials
 */

const { logger } = require('@librechat/data-schemas');

/**
 * Parse allowed origins from environment
 */
const getAllowedOrigins = () => {
  const origins = new Set();

  // Always allow the configured client domain
  if (process.env.DOMAIN_CLIENT) {
    origins.add(process.env.DOMAIN_CLIENT);

    // Also add without trailing slash and with trailing slash
    const clientUrl = process.env.DOMAIN_CLIENT.replace(/\/$/, '');
    origins.add(clientUrl);
  }

  // Allow additional origins from env var (comma-separated)
  if (process.env.CORS_ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
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

  return Array.from(origins);
};

/**
 * Check if strict CORS is enabled
 * When disabled, allows all origins (legacy behavior)
 */
const isStrictCORSEnabled = () => {
  return process.env.ENABLE_STRICT_CORS === 'true';
};

/**
 * CORS options factory
 */
const getCorsOptions = () => {
  // If strict CORS is not enabled, return permissive options (legacy behavior)
  if (!isStrictCORSEnabled()) {
    return {
      origin: true, // Reflect the request origin
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
      exposedHeaders: ['X-CSRF-Token'],
      maxAge: 86400, // 24 hours
    };
  }

  const allowedOrigins = getAllowedOrigins();

  logger.info('[CORS] Strict mode enabled. Allowed origins:', allowedOrigins);

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn('[CORS] Blocked request from origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    exposedHeaders: ['X-CSRF-Token'],
    maxAge: 86400,
  };
};

module.exports = {
  getCorsOptions,
  getAllowedOrigins,
  isStrictCORSEnabled,
};
