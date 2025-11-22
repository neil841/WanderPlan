// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jest-testing';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
process.env.RESEND_API_KEY = 're_mock';
process.env.FROM_EMAIL = 'test@example.com';
process.env.FROM_NAME = 'Test';
