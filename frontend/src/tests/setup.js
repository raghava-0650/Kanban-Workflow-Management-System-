import '@testing-library/jest-dom/vitest';

import {
  afterEach,
  vi,
} from 'vitest';

import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock socket.io-client
vi.mock('../socket/socket', () => ({
  DndProvider: ({ children }) => children,
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: true,
    disconnect: vi.fn(),
  },
}));
