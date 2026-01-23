import rateLimit from 'express-rate-limit';
import { config } from '@/config';

export const loginRateLimiter = rateLimit({
  windowMs: config.auth.rateLimit.windowMs,
  max: config.auth.rateLimit.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
});
