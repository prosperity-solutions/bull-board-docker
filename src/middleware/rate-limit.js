import rateLimit from 'express-rate-limit';
import {config} from '../config.js';

/**
 * Rate limit for login attempts
 * Prevents brute force attacks on authentication
 */
export const loginRateLimit = rateLimit({
	windowMs: config.RATE_LIMIT_LOGIN_WINDOW_MS,
	max: config.RATE_LIMIT_LOGIN_MAX,
	message: 'Too many login attempts, please try again later',
	standardHeaders: true,      // Return rate limit info in RateLimit-* headers
	legacyHeaders: false,       // Disable X-RateLimit-* headers
	skipSuccessfulRequests: false,  // Count successful logins too
	skip: () => !config.RATE_LIMIT_ENABLED,  // Can be disabled via env var
});

/**
 * General API rate limit
 * Prevents API abuse and DoS
 */
export const apiRateLimit = rateLimit({
	windowMs: config.RATE_LIMIT_API_WINDOW_MS,
	max: config.RATE_LIMIT_API_MAX,
	message: 'Too many requests, please slow down',
	standardHeaders: true,
	legacyHeaders: false,
	skip: () => !config.RATE_LIMIT_ENABLED,  // Can be disabled via env var
});
