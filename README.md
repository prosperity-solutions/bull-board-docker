Docker image for [bull-board]. Allow you to monitor your bull queue without any coding!

Supports both bull and bullmq.

> [!IMPORTANT]
> Drop of 32-bit support from v2.0.0 (due to problems with Node.js 20 in 32-bit mode)

### Quick start with Docker
```
docker run -p 3000:3000 venatum/bull-board:latest
```
will run bull-board interface on `localhost:3000` and connect to your redis instance on `localhost:6379` without password.

To configure redis see "Environment variables" section.

### Quick start with docker-compose

```yaml
services:
    bullboard:
        container_name: bullboard
        image: venatum/bull-board
        restart: unless-stopped
        ports:
            - "3000:3000"
```
will run bull-board interface on `localhost:3000` and connect to your redis instance on `localhost:6379` without password.

see "Example with docker-compose" section, for example, with env parameters

### Sentinel

It is now possible to use the BullBoard image with Redis Sentinel mode.
Please note that on the interface, the Redis server info button will not work. Feel free to contribute to the development directly at [felixmosh/bull-board](https://github.com/felixmosh/bull-board)

### Environment variables

**Redis**
* `REDIS_HOST` - host to connect to redis (`localhost` by default)
* `REDIS_PORT` - redis port (`6379` by default)
* `REDIS_DB` - redis db to use (`'0'` by default)
* `REDIS_USE_TLS` - enable TLS true or false (`false` by default)
* `REDIS_USER` - user to connect to redis (no user by default, Redis 6+)
* `REDIS_PASSWORD` - password to connect to redis (no password by default)
* `REDIS_FAMILY` - IP Stack version (one of 4 | 6 | 0) (`0` by default)
* `SENTINEL_NAME` - name of sentinel instance (required with sentinel)
* `SENTINEL_HOSTS` - a string containing a list of replica servers (e.g. '1.redis:26379,2.redis:26379,3.redis:26379'), overrides `REDIS_HOST` + `REDIS_PORT` configuration (you can use `,` or `;`)
* `MAX_RETRIES_PER_REQUEST` - makes sure commands won't wait forever when the connection is down (disabled `null` by default)

**Sentinel Advanced Options**
* `SENTINEL_ROLE` - role to connect to, either 'master' or 'slave' (`master` by default)
* `SENTINEL_USERNAME` - username for authenticating with Sentinel (disabled by default)
* `SENTINEL_PASSWORD` - password for authenticating with Sentinel (disabled by default)
* `SENTINEL_COMMAND_TIMEOUT` - timeout for Sentinel commands in milliseconds (disabled by default)
* `SENTINEL_TLS_ENABLED` - enable TLS for Sentinel mode (`false` by default)
* `SENTINEL_UPDATE` - whether to update the list of Sentinels (`false` by default)
* `SENTINEL_MAX_CONNECTIONS` - maximum number of connections to Sentinel (`10` by default)
* `SENTINEL_FAILOVER_DETECTOR` - whether to enable failover detection (`false` by default)

**Redis Advanced Options**
* `REDIS_COMMAND_TIMEOUT` - timeout for commands in milliseconds (disabled by default)
* `REDIS_SOCKET_TIMEOUT` - timeout for socket in milliseconds (disabled by default)
* `REDIS_KEEP_ALIVE` - enable/disable keep-alive functionality, value in milliseconds (`0` by default)
* `REDIS_NO_DELAY` - enable/disable Nagle's algorithm (`true` by default)
* `REDIS_CONNECTION_NAME` - set the name of the connection to make it easier to identify (disabled by default)
* `REDIS_AUTO_RESUBSCRIBE` - auto resubscribe to channels when reconnecting (`true` by default)
* `REDIS_AUTO_RESEND_UNFULFILLED` - resend unfulfilled commands on reconnect (`true` by default)
* `REDIS_CONNECT_TIMEOUT` - connection timeout in milliseconds (`10000` by default)
* `REDIS_ENABLE_OFFLINE_QUEUE` - enable/disable the offline queue (`true` by default)
* `REDIS_ENABLE_READY_CHECK` - enable/disable the ready check (`true` by default)

**Interface**
* `BULL_BOARD_HOSTNAME` - host to bind the server to (`0.0.0.0` by default)
* `PORT` - port to bind the server to (`3000` by default)
* `PROXY_PATH` - proxyPath for bull board, e.g. https://<server_name>/my-base-path/queues [docs] (`''` by default)
* `USER_LOGIN` - login to restrict access to bull-board interface (disabled by default)
* `USER_PASSWORD` - password or bcrypt hash to restrict access (supports both plaintext and bcrypt hashes, **bcrypt recommended** - see [Security](#security) section)

**Security** 🔒
* `SESSION_SECRET` - **REQUIRED in production**. Cryptographic secret for signing session cookies. Auto-generated in development (insecure). Generate with utility command below. (64-character hex recommended)
* `COOKIE_HTTP_ONLY` - prevent JavaScript access to cookies (XSS protection) (`true` by default, **recommended**)
* `COOKIE_SECURE` - only send cookies over HTTPS (`true` in production, `false` in development by default)
* `COOKIE_SAME_SITE` - CSRF protection via SameSite attribute. Options: `strict` (recommended), `lax`, `none` (`strict` by default)
* `COOKIE_MAX_AGE` - session expiration time in milliseconds (`86400000` = 24 hours by default)
* `RATE_LIMIT_ENABLED` - enable/disable rate limiting (`true` by default, **recommended**)
* `RATE_LIMIT_LOGIN_MAX` - max login attempts per window (`5` by default)
* `RATE_LIMIT_LOGIN_WINDOW_MS` - login rate limit window in milliseconds (`900000` = 15 minutes by default)
* `RATE_LIMIT_API_MAX` - max API requests per window (`500` by default)
* `RATE_LIMIT_API_WINDOW_MS` - API rate limit window in milliseconds (`60000` = 1 minute by default)
* `CSRF_ENABLED` - enable/disable CSRF protection (`true` by default, **recommended**)
* `REDIS_SCAN_COUNT` - number of keys to process per SCAN iteration for better Redis performance (`100` by default, range: `10`-`1000`)

**Queue setup**
* `BULL_PREFIX` - prefix to your bull queue name (`bull` by default)
* `BULL_VERSION` - version of bull lib to use 'BULLMQ' or 'BULL' (`BULLMQ` by default)
* `BACKOFF_STARTING_DELAY` - The delay, in milliseconds, before starts the research for the first time (`500` by default)
* `BACKOFF_MAX_DELAY` - The maximum delay, in milliseconds, between two consecutive attempts (`Infinity` by default)
* `BACKOFF_TIME_MULTIPLE` - The `BACKOFF_STARTING_DELAY` is multiplied by the `BACKOFF_TIME_MULTIPLE` to increase the delay between reattempts (`2` by default)
* `BACKOFF_NB_ATTEMPTS` - The maximum number of times to attempt the research (`10` by default)

**BullBoard UI** based on [felixmosh/bull-board](https://github.com/felixmosh/bull-board/tree/master?tab=readme-ov-file#board-options)
> Default values come from the original project
* `BULL_BOARD_TITLE` - The Board and page titles (`Bull Dashboard` by default)
* `BULL_BOARD_LOGO_PATH` - Allows you to specify a different logo (`empty` by default)
* `BULL_BOARD_LOGO_WIDTH` - `BULL_BOARD_LOGO_PATH` is required
* `BULL_BOARD_LOGO_HEIGHT` - `BULL_BOARD_LOGO_PATH` is required
* `BULL_BOARD_FAVICON` - Allows you to specify the default favicon (`empty` by default)
* `BULL_BOARD_FAVICON_ALTERNATIVE` - `BULL_BOARD_FAVICON` is required
* `BULL_BOARD_LOCALE` - The locale to use
* `BULL_BOARD_DATE_FORMATS_SHORT` - The date format to use
* `BULL_BOARD_DATE_FORMATS_COMMON` - The date format to use
* `BULL_BOARD_DATE_FORMATS_FULL` - The date format to use

## Security

Bull-board-docker includes comprehensive security features to protect your monitoring dashboard in production environments.

### Authentication

Enable authentication by setting both `USER_LOGIN` and `USER_PASSWORD`:

```bash
USER_LOGIN=admin
USER_PASSWORD=your-password-or-hash
```

**⚠️ Security Best Practice:** Use bcrypt-hashed passwords instead of plaintext for production deployments.

### Password Hashing

**Recommended:** Hash passwords with bcrypt before storing in environment variables.

```bash
# Generate bcrypt hash for your password
node -e "import('bcrypt').then(bcrypt => bcrypt.hash('yourpassword', 10).then(console.log))"

# Output example: $2b$10$rKmQ4K.qCBXmzEUeYfC1qeV8p.QTZ5YxJ/Z1Z1Z1Z1Z1Z1Z1Z1Z
# Use this hash as USER_PASSWORD
```

**Legacy Support:** Plaintext passwords continue to work but generate security warnings. Migrate to bcrypt hashes for production.

### Session Management

Sessions are cryptographically signed and stored in secure cookies with the following protections:

- **HttpOnly** (`COOKIE_HTTP_ONLY=true`): Prevents JavaScript access to cookies (XSS protection)
- **Secure** (`COOKIE_SECURE=true`): Ensures cookies only sent over HTTPS in production
- **SameSite** (`COOKIE_SAME_SITE=strict`): Prevents CSRF attacks
- **MaxAge** (`COOKIE_MAX_AGE`): Automatic session expiration (24 hours default)

**⚠️ Important:** Always set `SESSION_SECRET` in production to persist sessions across restarts:

```bash
# Generate secure session secret
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

If `SESSION_SECRET` is not set, it auto-generates on each restart, invalidating all existing sessions.

### Rate Limiting

Rate limiting protects against brute force attacks and API abuse:

- **Login Protection**: 5 attempts per 15 minutes (configurable via `RATE_LIMIT_LOGIN_MAX`, `RATE_LIMIT_LOGIN_WINDOW_MS`)
- **API Protection**: 500 requests per minute (configurable via `RATE_LIMIT_API_MAX`, `RATE_LIMIT_API_WINDOW_MS`)

Exceeded limits return HTTP 429 with `Retry-After` header.

**Disable rate limiting** (not recommended for production):
```bash
RATE_LIMIT_ENABLED=false
```

### CSRF Protection

Cross-Site Request Forgery (CSRF) protection is enabled by default using secure tokens.

**Disable CSRF** (only for automated tools or testing):
```bash
CSRF_ENABLED=false
```

### Production Security Checklist

Before deploying to production, ensure:

- ✅ `SESSION_SECRET` is set to a secure random value
- ✅ `USER_PASSWORD` uses bcrypt hash (not plaintext)
- ✅ `COOKIE_SECURE=true` (requires HTTPS)
- ✅ `COOKIE_HTTP_ONLY=true` (default)
- ✅ `COOKIE_SAME_SITE=strict` (default)
- ✅ `RATE_LIMIT_ENABLED=true` (default)
- ✅ `CSRF_ENABLED=true` (default)
- ✅ HTTPS/TLS configured (reverse proxy or load balancer)

### Security Utility Commands

#### Generate Credentials (Recommended)

Use the built-in script to generate all credentials at once:

```bash
# Interactive mode (prompts for password and salt rounds)
# Password input is hidden, credentials written to .env.generated
npm run generate-credentials

# Provide password as argument (prompts for salt rounds)
npm run generate-credentials -- mypassword

# Provide both password and salt rounds (10-12 recommended)
npm run generate-credentials -- mypassword 12

# Output file: .env.generated
# SESSION_SECRET=1ec050cc241c9537ff5d98c96df1035b...
# USER_LOGIN=admin
# USER_PASSWORD=$2b$12$a04b3TNKoK91jI9WK8K/SenZ65Csg30E...

# Use the generated credentials
cat .env.generated  # Review credentials
source .env.generated && docker-compose up  # Source for docker-compose
# Or copy/paste values to your .env file or docker-compose.yml
```

**Security Benefits:**
- Password input is hidden when using interactive mode
- Credentials written to `.env.generated` (never displayed on screen)
- File automatically added to `.gitignore`
- No secrets in terminal scrollback or screen recordings
- Salt rounds are encoded in the hash itself (the `$12$` part)

#### Manual Generation (Alternative)

```bash
# Generate SESSION_SECRET (64-character hex string)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate bcrypt password hash
node -e "import('bcrypt').then(bcrypt => bcrypt.hash('yourpassword', 10).then(console.log))"
```

#### Testing Security Features

```bash
# Test rate limiting (should fail on 6th attempt)
for i in {1..6}; do
  curl -X POST http://localhost:3000/login -d "username=wrong&password=wrong"
done

# Verify cookie security flags
curl -i http://localhost:3000/login | grep -i 'set-cookie'
# Should show: HttpOnly; Secure (in production); SameSite=Strict
```

### Migration from Previous Versions

If you're upgrading from a previous version:

#### 1. Sessions Will Be Invalidated

If you don't set `SESSION_SECRET`, all existing sessions become invalid on restart.

**Solution:** Generate and set `SESSION_SECRET` before deploying:
```bash
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
# Add to your .env or docker-compose.yml
```

#### 2. Migrate to Hashed Passwords

**Current:** Plaintext password in `USER_PASSWORD`
**New:** Bcrypt hash (plaintext still works but not recommended)

```bash
# Generate hash for your current password
node -e "import('bcrypt').then(bcrypt => bcrypt.hash('your-current-password', 10).then(console.log))"

# Update USER_PASSWORD with the hash
USER_PASSWORD=$2b$10$...
```

**Legacy support:** Plaintext passwords continue to work with a warning log.

#### 3. Review Security Settings

New security defaults may affect your setup:
- `COOKIE_SECURE=true` in production requires HTTPS
- `RATE_LIMIT_ENABLED=true` limits login attempts
- `CSRF_ENABLED=true` requires CSRF tokens

**If you need to disable for testing:**
```bash
COOKIE_SECURE=false        # Allow HTTP (not recommended)
RATE_LIMIT_ENABLED=false   # Disable rate limiting (not recommended)
CSRF_ENABLED=false         # Disable CSRF (not recommended)
```

### Environment-Specific Configurations

> **Note:** When using Docker, `NODE_ENV=production` is already set in the Dockerfile. Only override if needed for development/testing.

#### Production (Secure - Recommended)
```bash
# Docker automatically sets NODE_ENV=production
SESSION_SECRET=<generated-64-char-hex>
USER_LOGIN=admin
USER_PASSWORD=$2b$10$...  # bcrypt hash
COOKIE_HTTP_ONLY=true
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
RATE_LIMIT_ENABLED=true
CSRF_ENABLED=true
```

#### Development (Relaxed)
```bash
NODE_ENV=development       # Override Docker's production default
USER_LOGIN=admin
USER_PASSWORD=admin123     # Plaintext OK in dev
COOKIE_SECURE=false        # Allow HTTP
RATE_LIMIT_LOGIN_MAX=20    # More attempts for testing
```

#### Testing/CI (Minimal Security)
```bash
NODE_ENV=test              # Override Docker's production default
COOKIE_SECURE=false
RATE_LIMIT_ENABLED=false
CSRF_ENABLED=false
```

### Testing

The project includes a comprehensive test suite using Jest. The tests cover all major components of the application:

- Redis configuration and client
- Bull queue setup
- Express application setup and routes
- Health check endpoint
- Configuration loading
- Authentication

To run the tests:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Healthcheck

A Healthcheck based on NestJS is available to monitor the status of the container and the Redis service. `/healthcheck`
```json
{
	"status": "ok",
	"info": {
		"redis": {
			"status": "up",
			"description": "Based on the Redis PING/PONG system"
		}
	}
}
```

| Field     | Description                                                                                                        | Type            |
|-----------|--------------------------------------------------------------------------------------------------------------------|-----------------|
| `status`  | 	Indicates the overall health status. If any health indicator fails, the status will be 'error'.                   | 'ok' or 'error' |
| `info`    | 	Object containing information of each health indicator which is of status 'up', or in other words "healthy".	     | object          |
| `error`   | 	String containing information of each health indicator which is of status 'down', or in other words "unhealthy".	 | string          |
| `details` | 	Object containing all information of each health indicator	                                                       | object          |

### Example with docker-compose

#### Production (Secure)

```yaml
services:
    redis:
        container_name: redis
        image: redis:alpine
        restart: unless-stopped
        ports:
            - "6379:6379"
        volumes:
            - redis_db_data:/data

    bullboard:
        container_name: bullboard
        image: venatum/bull-board:latest
        restart: unless-stopped
        environment:
            # Redis connection
            REDIS_HOST: redis
            REDIS_PORT: 6379
            REDIS_PASSWORD: example-password
            REDIS_USE_TLS: 'false'
            BULL_PREFIX: bull

            # Security (REQUIRED for production)
            # Generate with: npm run generate-credentials
            SESSION_SECRET: ${SESSION_SECRET}
            USER_LOGIN: admin
            USER_PASSWORD: ${USER_PASSWORD_HASH}

            # Note: Secure defaults are already enabled:
            # - NODE_ENV=production (Dockerfile)
            # - COOKIE_SECURE=true, COOKIE_HTTP_ONLY=true, COOKIE_SAME_SITE=strict
            # - RATE_LIMIT_ENABLED=true (5 login attempts/15min, 500 API req/min)
            # - CSRF_ENABLED=true
            # Override only if needed for your specific setup
        ports:
            - "3000:3000"
        depends_on:
            - redis

volumes:
    redis_db_data:
        external: false
```

Create a `.env` file with your secrets:
```bash
SESSION_SECRET=your-64-char-hex-string
USER_PASSWORD_HASH=$2b$10$your-bcrypt-hash
```

#### Development (Simplified)

```yaml
services:
    redis:
        container_name: redis
        image: redis:alpine
        restart: unless-stopped
        ports:
            - "6379:6379"
        volumes:
            - redis_db_data:/data

    bullboard:
        container_name: bullboard
        image: venatum/bull-board:latest
        restart: unless-stopped
        environment:
            REDIS_HOST: redis
            REDIS_PORT: 6379
            REDIS_PASSWORD: example-password
            BULL_PREFIX: bull

            # Development overrides (disable security for local dev convenience)
            NODE_ENV: development       # Disables COOKIE_SECURE by default
            USER_LOGIN: admin
            USER_PASSWORD: admin123     # Plaintext OK in dev (bcrypt in production!)
            COOKIE_SECURE: 'false'      # Allow HTTP (no HTTPS required)
            # Optional: Increase login attempts for testing
            # RATE_LIMIT_LOGIN_MAX: 20
        ports:
            - "3000:3000"
        depends_on:
            - redis

volumes:
    redis_db_data:
        external: false
```

[bull-board]: https://github.com/felixmosh/bull-board
[bull-board]: https://github.com/felixmosh/bull-board#hosting-router-on-a-sub-path

---
https://github.com/Venatum/bull-board-docker
