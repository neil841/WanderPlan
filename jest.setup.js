// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXTAUTH_SECRET = 'test-secret-key';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.RESEND_API_KEY = 'test-resend-api-key';

// Polyfills for Next.js edge runtime in tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Request and Response for Next.js
if (typeof global.Request === 'undefined') {
  global.Request = class Request {};
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {};
}
