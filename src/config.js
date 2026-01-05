import * as dotenv from 'dotenv'
import crypto from 'crypto';
import { z } from 'zod';

dotenv.config({
	quiet: true
})

// Helper to coerce string environment variables to boolean
const booleanSchema = z
	.string()
	.optional()
	.transform((val) => {
		if (val === undefined) return undefined;
		return val.toLowerCase() === 'true';
	})
	.pipe(z.boolean());

// Helper for inverted boolean (defaults to true, false when set to 'false')
const invertedBooleanSchema = z
	.string()
	.optional()
	.transform((val) => {
		if (val === undefined) return true;
		return val.toLowerCase() !== 'false';
	})
	.pipe(z.boolean());

// Helper to coerce string environment variables to number
const numberSchema = (defaultValue) => z
	.string()
	.optional()
	.transform((val) => {
		if (!val) return defaultValue;
		const num = Number(val);
		return isNaN(num) ? defaultValue : num;
	});

// Helper to normalize paths
const pathSchema = z
	.string()
	.optional()
	.transform((val) => (val || '').replace(/\/$/, ''))
	.pipe(z.string());

// Define the configuration schema
const ConfigSchema = z.object({
	// Redis configuration
	REDIS_PORT: numberSchema(6379),
	REDIS_HOST: z.string().default('localhost'),
	REDIS_DB: z.string().default('0'),
	REDIS_USER: z.string().optional(),
	REDIS_PASSWORD: z.string().optional(),
	REDIS_USE_TLS: z.string().optional(),
	REDIS_FAMILY: numberSchema(0),
	SENTINEL_NAME: z.string().optional(),
	SENTINEL_HOSTS: z.string().optional(),
	MAX_RETRIES_PER_REQUEST: z.string().optional(),

	// Additional Sentinel configuration
	SENTINEL_ROLE: z.string().default('master'),
	SENTINEL_USERNAME: z.string().optional(),
	SENTINEL_PASSWORD: z.string().optional(),
	SENTINEL_RETRY_STRATEGY: z.string().optional(),
	SENTINEL_RECONNECT_STRATEGY: z.string().optional(),
	SENTINEL_COMMAND_TIMEOUT: numberSchema(undefined),
	SENTINEL_TLS_ENABLED: booleanSchema.default(false),
	SENTINEL_UPDATE: booleanSchema.default(false),
	SENTINEL_MAX_CONNECTIONS: numberSchema(10),
	SENTINEL_FAILOVER_DETECTOR: booleanSchema.default(false),

	// Additional Redis configuration
	REDIS_COMMAND_TIMEOUT: numberSchema(undefined),
	REDIS_SOCKET_TIMEOUT: numberSchema(undefined),
	REDIS_KEEP_ALIVE: numberSchema(0),
	REDIS_NO_DELAY: invertedBooleanSchema,
	REDIS_CONNECTION_NAME: z.string().optional(),
	REDIS_AUTO_RESUBSCRIBE: invertedBooleanSchema,
	REDIS_AUTO_RESEND_UNFULFILLED: invertedBooleanSchema,
	REDIS_CONNECT_TIMEOUT: numberSchema(10000),
	REDIS_ENABLE_OFFLINE_QUEUE: invertedBooleanSchema,
	REDIS_ENABLE_READY_CHECK: invertedBooleanSchema,

	// Queue configuration
	BULL_PREFIX: z.string().default('bull'),
	BULL_VERSION: z.string().default('BULLMQ'),
	BACKOFF_STARTING_DELAY: numberSchema(500),
	BACKOFF_MAX_DELAY: numberSchema(Infinity),
	BACKOFF_TIME_MULTIPLE: numberSchema(2),
	BACKOFF_NB_ATTEMPTS: numberSchema(10),

	// App configuration
	BULL_BOARD_HOSTNAME: z.string().default('0.0.0.0'),
	PORT: numberSchema(3000),
	PROXY_PATH: pathSchema,
	USER_LOGIN: z.string().optional(),
	USER_PASSWORD: z.string().optional(),

	// Bullboard UI configuration
	BULL_BOARD_TITLE: z.string().optional(),
	BULL_BOARD_LOGO_PATH: z.string().optional(),
	BULL_BOARD_LOGO_WIDTH: z.string().optional(),
	BULL_BOARD_LOGO_HEIGHT: z.string().optional(),
	BULL_BOARD_FAVICON: z.string().optional(),
	BULL_BOARD_FAVICON_ALTERNATIVE: z.string().optional(),
	BULL_BOARD_LOCALE: z.string().optional(),
	BULL_BOARD_DATE_FORMATS_SHORT: z.string().optional(),
	BULL_BOARD_DATE_FORMATS_COMMON: z.string().optional(),
	BULL_BOARD_DATE_FORMATS_FULL: z.string().optional(),

	// Security configuration
	SESSION_SECRET: z.string().default(crypto.randomBytes(32).toString('hex')),
	COOKIE_HTTP_ONLY: booleanSchema.default(true),
	COOKIE_SECURE: booleanSchema.default(process.env.NODE_ENV === 'production'),
	COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('strict'),
	COOKIE_MAX_AGE: numberSchema(24 * 60 * 60 * 1000),

	// Rate limiting configuration
	RATE_LIMIT_ENABLED: booleanSchema.default(true),
	RATE_LIMIT_LOGIN_WINDOW_MS: numberSchema(15 * 60 * 1000),
	RATE_LIMIT_LOGIN_MAX: numberSchema(5),
	RATE_LIMIT_API_WINDOW_MS: numberSchema(1 * 60 * 1000),
	RATE_LIMIT_API_MAX: numberSchema(500),

	// CSRF protection
	CSRF_ENABLED: booleanSchema.default(true),

	// Redis SCAN configuration
	REDIS_SCAN_COUNT: numberSchema(100),
}).transform((data) => ({
	...data,
	// Computed fields
	AUTH_ENABLED: Boolean(data.USER_LOGIN && data.USER_PASSWORD),
	HOME_PAGE: data.PROXY_PATH || '/',
	LOGIN_PAGE: `${data.PROXY_PATH}/login`,
}));

// Parse and validate the configuration
export const config = ConfigSchema.parse(process.env);
