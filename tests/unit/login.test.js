import {describe, expect, it, vi} from 'vitest';

describe('Authentication', () => {
	// Default config
	const defaultConfig = {
		USER_LOGIN: 'admin',
		USER_PASSWORD: 'password',
		HOME_PAGE: '/',
		LOGIN_PAGE: '/login',
	};

	// Common mocks
	let mockPassport;
	let mockLocalStrategy;
	let mockRouter;

	// Helper function to setup common mocks
	const setupCommonMocks = (config = defaultConfig) => {
		// Mock passport
		mockPassport = {
			use: vi.fn(),
			authenticate: vi.fn().mockReturnValue('passport-authenticate-middleware'),
			serializeUser: vi.fn(),
			deserializeUser: vi.fn(),
		};
		vi.doMock('passport', () => ({default: mockPassport}));

		// Mock passport-local
		mockLocalStrategy = vi.fn();
		vi.doMock('passport-local', () => ({
			Strategy: mockLocalStrategy,
		}));

    // Mock express
    mockRouter = {
      route: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      post: vi.fn().mockReturnThis(),
      use: vi.fn().mockReturnThis(),
    };
    vi.doMock('express', () => ({
      default: {
        Router: vi.fn().mockReturnValue(mockRouter),
      },
    }));

		// Mock cookie-parser
		vi.doMock('cookie-parser', () => ({
			default: vi.fn().mockReturnValue((req, res, next) => next()),
		}));

		// Mock csrf-csrf
		const mockGenerateToken = vi.fn().mockReturnValue('mock-csrf-token');
		const mockDoubleCsrfProtection = vi.fn().mockImplementation((req, res, next) => next());
		vi.doMock('csrf-csrf', () => ({
			doubleCsrf: vi.fn().mockReturnValue({
				generateToken: mockGenerateToken,
				doubleCsrfProtection: mockDoubleCsrfProtection,
			}),
		}));

		// Mock password utils
		vi.doMock('../../src/utils/password.js', () => ({
			verifyPassword: vi.fn().mockImplementation(async (password, hash) => {
				// Simulate plaintext comparison for tests
				return password === hash;
			}),
		}));

		// Mock config
		vi.doMock('../../src/config.js', () => ({
			config: {
				...config,
				SESSION_SECRET: 'test-secret',
				CSRF_ENABLED: config.CSRF_ENABLED !== undefined ? config.CSRF_ENABLED : true,
				COOKIE_SAME_SITE: 'strict',
				COOKIE_SECURE: false,
			},
		}));

		return {mockPassport, mockLocalStrategy, mockRouter};
	};

	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();

		// Reset modules to ensure clean imports
		vi.resetModules();
	});

	describe('Passport Strategy', () => {
		it('should set up Passport.js with LocalStrategy', async () => {
			// Setup mocks
			setupCommonMocks();

			// Import the module to test
			await import('../../src/login');

			// Verify that passport.use was called with a LocalStrategy
			expect(mockPassport.use).toHaveBeenCalledWith(expect.any(mockLocalStrategy));

			// Get the strategy callback
			const strategyCallback = mockLocalStrategy.mock.calls[0][0];

			// Test the strategy with correct credentials (now async)
			const doneCb = vi.fn();
			await strategyCallback('admin', 'password', doneCb);
			expect(doneCb).toHaveBeenCalledWith(null, {user: 'bull-board'});

			// Test the strategy with incorrect username
			doneCb.mockClear();
			await strategyCallback('wrong', 'password', doneCb);
			expect(doneCb).toHaveBeenCalledWith(null, false);

			// Test the strategy with incorrect password
			doneCb.mockClear();
			await strategyCallback('admin', 'wrong', doneCb);
			expect(doneCb).toHaveBeenCalledWith(null, false);
		});
	});

	describe('User Serialization', () => {
		it('should set up serialization and deserialization', async () => {
			// Setup mocks
			setupCommonMocks();

			// Import the module to test
			await import('../../src/login');

			// Verify that passport.serializeUser and passport.deserializeUser were called
			expect(mockPassport.serializeUser).toHaveBeenCalled();
			expect(mockPassport.deserializeUser).toHaveBeenCalled();

			// Get the serialization callback
			const serializeCallback = mockPassport.serializeUser.mock.calls[0][0];

			// Test the serialization callback
			const doneCb = vi.fn();
			const user = {user: 'bull-board'};
			serializeCallback(user, doneCb);
			expect(doneCb).toHaveBeenCalledWith(null, user);

			// Get the deserialization callback
			const deserializeCallback = mockPassport.deserializeUser.mock.calls[0][0];

			// Test the deserialization callback
			doneCb.mockClear();
			deserializeCallback(user, doneCb);
			expect(doneCb).toHaveBeenCalledWith(null, user);
		});
	});

	describe('Authentication Routes', () => {
		it('should set up authentication routes', async () => {
			// Setup mocks
			setupCommonMocks();

			// Import the module to test
			await import('../../src/login');

			// Verify that router.route was called with the correct path
			expect(mockRouter.route).toHaveBeenCalledWith('/');

			// Verify that router.get was called
			expect(mockRouter.get).toHaveBeenCalled();

			// Get the GET route handler
			const getHandler = mockRouter.get.mock.calls[0][0];

			// Create mock request and response objects
			const req = {};
			const res = {
				render: vi.fn(),
			};

			// Call the handler
			getHandler(req, res);

			// Verify that res.render was called with the correct template and CSRF parameters
			expect(res.render).toHaveBeenCalledWith('login', {
				csrfToken: 'mock-csrf-token',
				csrfEnabled: true,
			});

			// Verify that router.post was called
			expect(mockRouter.post).toHaveBeenCalled();

			// Verify that passport.authenticate was called with the correct arguments
			expect(mockPassport.authenticate).toHaveBeenCalledWith('local', {
				successRedirect: '/',
				failureRedirect: '/login',
			});
		});

		it('should use custom redirect paths from config', async () => {
			// Setup mocks with custom paths
			setupCommonMocks({
				USER_LOGIN: 'admin',
				USER_PASSWORD: 'password',
				HOME_PAGE: '/custom-home',
				LOGIN_PAGE: '/custom-login',
			});

			// Import the module to test
			await import('../../src/login');

			// Verify that passport.authenticate was called with the correct arguments
			expect(mockPassport.authenticate).toHaveBeenCalledWith('local', {
				successRedirect: '/custom-home',
				failureRedirect: '/custom-login',
			});
		});
	});
});
