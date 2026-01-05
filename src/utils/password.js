import bcrypt from 'bcrypt';

const BCRYPT_PREFIX = '$2';

/**
 * Verify a password against a hash
 * Supports legacy plaintext passwords for backward compatibility
 * @param {string} password - The plaintext password to verify
 * @param {string} hash - The stored hash (or plaintext for legacy)
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
	// Support legacy plaintext for migration
	// bcrypt hashes start with $2a$, $2b$, or $2y$
	if (!hash.startsWith(BCRYPT_PREFIX)) {
		console.warn('⚠️  WARNING: Using legacy plaintext password comparison.');
		console.warn('⚠️  For security, please hash your password with:');
		console.warn('    node -e "import(\'bcrypt\').then(bcrypt => bcrypt.hash(\'yourpassword\', 10).then(console.log))"');
		return password === hash;
	}

	return bcrypt.compare(password, hash);
}
