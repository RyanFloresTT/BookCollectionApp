// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Auth0
const mockGetAccessTokenSilently = jest.fn().mockResolvedValue('test-token');
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    getAccessTokenSilently: mockGetAccessTokenSilently,
  }),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
}));

// Add TextEncoder/TextDecoder to global
Object.assign(global, {
  TextEncoder: TextEncoder,
  TextDecoder: TextDecoder,
});

// Suppress act() warning
const originalError = console.error;
console.error = (...args) => {
  if (args[0].includes('Warning: `ReactDOMTestUtils.act` is deprecated')) {
    return;
  }
  originalError.call(console, ...args);
};
