// Mock for next-auth to avoid ES module import issues in Jest

const NextAuth = jest.fn(() => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

const getServerSession = jest.fn();

module.exports = {
  __esModule: true,
  default: NextAuth,
  NextAuth,
  getServerSession,
};
