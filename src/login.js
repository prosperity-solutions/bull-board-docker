import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import express from 'express';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';

import {config} from "./config.js";
import {verifyPassword} from './utils/password.js';

export const authRouter = express.Router();

// Setup CSRF protection (conditionally based on config)
const csrfProtectionSetup = config.CSRF_ENABLED
	? doubleCsrf({
		getSecret: () => config.SESSION_SECRET,
		getSessionIdentifier: (req) => req.sessionID || '',
		cookieName: '__Host-psifi.x-csrf-token',
		cookieOptions: {
			sameSite: config.COOKIE_SAME_SITE,
			path: '/',
			secure: config.COOKIE_SECURE,
			httpOnly: true
		},
		size: 64,
		ignoredMethods: ['GET', 'HEAD', 'OPTIONS']
	})
	: null;

const { generateCsrfToken, doubleCsrfProtection } = csrfProtectionSetup || {
	generateCsrfToken: (req) => '',
	doubleCsrfProtection: (req, res, next) => next()
};

passport.use(new LocalStrategy(
	async function (username, password, cb) {
		try {
			if (username === config.USER_LOGIN && config.USER_PASSWORD) {
				const valid = await verifyPassword(password, config.USER_PASSWORD);
				if (valid) {
					return cb(null, {user: 'bull-board'});
				}
			}
			return cb(null, false);
		} catch (error) {
			console.error('Authentication error:', error);
			return cb(error);
		}
	})
);

passport.serializeUser((user, cb) => {
	cb(null, user);
});

passport.deserializeUser((user, cb) => {
	cb(null, user);
});

// Apply cookie parser for CSRF (needed by csrf-csrf)
if (config.CSRF_ENABLED) {
	authRouter.use(cookieParser());
}

// Routes with CSRF protection
authRouter.route('/')
	.get((req, res) => {
		const csrfToken = config.CSRF_ENABLED ? generateCsrfToken(req, res) : '';
		res.render('login', {
			csrfToken: csrfToken,
			csrfEnabled: config.CSRF_ENABLED
		});
	})
	.post(
		config.CSRF_ENABLED ? doubleCsrfProtection : (req, res, next) => next(),
		passport.authenticate('local', {
			successRedirect: config.HOME_PAGE,
			failureRedirect: config.LOGIN_PAGE,
		})
	);
