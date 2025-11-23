// Test script to verify password hashing and create a test user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const testEmail = 'testlogin@example.com';
  const testPassword = 'TestPassword123!';

  console.log('=== Password Hashing Test ===\n');

  // Test 1: Hash and verify immediately
  console.log('Test 1: Hash and verify same password');
  const hash1 = await bcrypt.hash(testPassword, 10);
  const verify1 = await bcrypt.compare(testPassword, hash1);
  console.log(`Hash: ${hash1}`);
  console.log(`Verification: ${verify1} (should be true)\n`);

  // Test 2: Create user with known password
  console.log('Test 2: Create test user');

  // Delete existing test user if exists
  await prisma.user.deleteMany({
    where: { email: testEmail }
  });

  const hashedPassword = await bcrypt.hash(testPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: testEmail,
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Login',
      timezone: 'America/New_York',
      emailVerified: new Date(), // Auto-verify for testing
    }
  });

  console.log(`Created user: ${user.email}`);
  console.log(`Password hash: ${hashedPassword}\n`);

  // Test 3: Verify password from database
  console.log('Test 3: Verify password from database');
  const dbUser = await prisma.user.findUnique({
    where: { email: testEmail }
  });

  const verifyFromDb = await bcrypt.compare(testPassword, dbUser.password);
  console.log(`Password from DB: ${dbUser.password}`);
  console.log(`Verification: ${verifyFromDb} (should be true)\n`);

  console.log('=== Test Complete ===');
  console.log(`\nYou can now login with:`);
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
