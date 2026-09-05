import { UserRepository } from '../repositories/userRepository.js';
import { hashPassword } from '../utils/password.js';
import { pool } from '../config/database.js';

async function runSeed() {
  console.log('Seeding development user...');
  const testEmail = 'farmer@leafiq.org';
  const existingUser = await UserRepository.findByEmail(testEmail);

  if (existingUser) {
    console.log(`Development user '${testEmail}' already exists (ID: ${existingUser.id}).`);
    return;
  }

  const password_hash = await hashPassword('farmer123');
  const user = await UserRepository.createUser({
    email: testEmail,
    password_hash,
    full_name: 'Greenhouse Farmer (Dev)',
    role: 'farmer',
  });

  console.log(`Successfully created dev user '${user.email}' (ID: ${user.id}).`);
}

runSeed()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Seeding failed:', err);
    await pool.end();
    process.exit(1);
  });

