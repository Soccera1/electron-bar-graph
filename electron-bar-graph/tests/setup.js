/*
 * Electron Bar Graph - Test Setup
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Global test setup
import { jest } from 'bun:test';

// Mock global objects that might be used in tests
global.jest = jest;

// Mock console methods for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Mock setTimeout and clearTimeout for testing
global.setTimeout = jest.fn((fn, delay) => {
  if (typeof fn === 'function') {
    // Execute immediately in tests unless specified otherwise
    fn();
  }
  return 1;
});

global.clearTimeout = jest.fn();

// Mock performance.now for consistent timing in tests
global.performance = {
  now: jest.fn(() => Date.now())
};

// Setup DOM-like environment globals
global.HTMLElement = class HTMLElement {};
global.HTMLCanvasElement = class HTMLCanvasElement extends HTMLElement {};
global.HTMLInputElement = class HTMLInputElement extends HTMLElement {};
global.HTMLButtonElement = class HTMLButtonElement extends HTMLElement {};
global.HTMLSelectElement = class HTMLSelectElement extends HTMLElement {};
global.HTMLDivElement = class HTMLDivElement extends HTMLElement {};

// Mock Image constructor
global.Image = class Image {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.src = '';
  }
};

// Export setup utilities
export const setupTest = () => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset console mocks
  global.console.log.mockClear();
  global.console.warn.mockClear();
  global.console.error.mockClear();
  global.console.debug.mockClear();
};

export const teardownTest = () => {
  // Cleanup after each test
  jest.restoreAllMocks();
};