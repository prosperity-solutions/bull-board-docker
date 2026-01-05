#!/usr/bin/env node

/**
 * Generate secure credentials for Bull Board
 *
 * Usage:
 *   npm run generate-credentials              # Interactive mode (prompts for password and salt rounds)
 *   npm run generate-credentials -- mypass    # Provide password, prompt for salt rounds
 *   npm run generate-credentials -- mypass 12 # Provide both
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const DEFAULT_SALT_ROUNDS = 10;

function generateSessionSecret() {
	return crypto.randomBytes(32).toString('hex');
}

async function hashPassword(password, saltRounds) {
	return bcrypt.hash(password, saltRounds);
}

function writeCredentialsToFile(sessionSecret, passwordHash, saltRounds, username = 'admin', filename = '.env.generated') {
	const content = `# Bull Board Security Credentials
# Generated: ${new Date().toISOString()}
# ⚠️  Keep these values secure - do not commit to version control

SESSION_SECRET=${sessionSecret}
USER_LOGIN=${username}
USER_PASSWORD=${passwordHash}

# Note: Password was hashed with ${saltRounds} salt rounds (encoded in hash)
`;

	return { filename, content };
}

async function promptForPassword() {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		rl.question('Enter password for Bull Board login: ', (password) => {
			rl.close();
			console.log(); // New line after hidden input
			resolve(password);
		});

		// Hide input by overriding _writeToOutput
		rl._writeToOutput = function _writeToOutput(stringToWrite) {
			if (stringToWrite.charCodeAt(0) === 13) {
				// Carriage return - allow it
				rl.output.write(stringToWrite);
			} else if (rl.line.length === 0) {
				// Show the prompt
				rl.output.write(stringToWrite);
			}
			// Otherwise hide the input (don't write it)
		};
	});
}

async function promptForSaltRounds() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve) => {
		rl.question(`Enter bcrypt salt rounds (default: ${DEFAULT_SALT_ROUNDS}, recommended: 10-12): `, (answer) => {
			rl.close();
			const rounds = parseInt(answer) || DEFAULT_SALT_ROUNDS;
			resolve(rounds);
		});
	});
}

async function main() {
	try {
		console.log('\n🔐 Bull Board Credentials Generator\n');

		// Get password from command line argument or prompt
		let password = process.argv[2];

		if (!password) {
			password = await promptForPassword();
		}

		if (!password || password.trim().length === 0) {
			console.error('❌ Error: Password cannot be empty');
			process.exit(1);
		}

		if (password.length < 8) {
			console.warn('⚠️  Warning: Password is shorter than 8 characters (not recommended for production)');
		}

		// Get salt rounds from command line argument or prompt
		let saltRounds = parseInt(process.argv[3]);

		if (!saltRounds || isNaN(saltRounds)) {
			saltRounds = await promptForSaltRounds();
		}

		// Validate salt rounds
		if (saltRounds < 4 || saltRounds > 31) {
			console.error('❌ Error: Salt rounds must be between 4 and 31 (recommended: 10-12)');
			process.exit(1);
		}

		if (saltRounds < 10) {
			console.warn('⚠️  Warning: Salt rounds < 10 may be insufficient for production');
		} else if (saltRounds > 12) {
			console.warn('⚠️  Warning: Salt rounds > 12 may cause slow authentication');
		}

		console.log('\n⏳ Generating credentials (using ' + saltRounds + ' salt rounds)...\n');

		// Generate session secret
		const sessionSecret = generateSessionSecret();

		// Hash password
		const passwordHash = await hashPassword(password, saltRounds);

		// Write to file
		const { filename, content } = writeCredentialsToFile(sessionSecret, passwordHash, saltRounds);
		const filepath = path.resolve(process.cwd(), filename);

		fs.writeFileSync(filepath, content, 'utf8');

		// Success message
		console.log('\n' + '='.repeat(70));
		console.log('✅ Credentials generated successfully!');
		console.log('='.repeat(70));
		console.log(`\n📄 Credentials written to: ${filename}`);
		console.log('\nNext steps:');
		console.log('  1. Review the generated credentials in .env.generated');
		console.log('  2. Copy values to your .env file or docker-compose.yml');
		console.log('  3. Delete .env.generated after copying (already in .gitignore)');
		console.log('\n⚠️  Keep these values secure - do not commit to version control');
		console.log('='.repeat(70) + '\n');

	} catch (error) {
		console.error('❌ Error generating credentials:', error.message);
		process.exit(1);
	}
}

main();
