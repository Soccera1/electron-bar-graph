/*
 * Electron Bar Graph - Test Utilities
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Window } from 'happy-dom';
import { jest } from 'bun:test';

// Mock DOM environment
export const createMockDOM = () => {
  const window = new Window();
  const document = window.document;
  
  // Mock canvas context
  const mockCanvas = document.createElement('canvas');
  const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
    canvas: mockCanvas
  };
  
  mockCanvas.getContext = jest.fn(() => mockContext);
  mockCanvas.width = 760;
  mockCanvas.height = 400;
  mockCanvas.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
  
  // Mock document.body
  if (!document.body) {
    document.body = document.createElement('body');
  }
  document.body.appendChild = jest.fn();
  document.body.removeChild = jest.fn();
  
  return { window, document, mockCanvas, mockContext };
};

// Mock Electron modules
export const mockElectron = {
  app: {
    whenReady: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    quit: jest.fn()
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadFile: jest.fn(),
    setMenu: jest.fn(),
    getAllWindows: jest.fn(() => [])
  }))
};

// Mock Bun/Node.js modules
export const mockFS = {
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn()
};

export const mockPath = {
  join: jest.fn((...args) => args.join('/')),
  cwd: jest.fn(() => '/mock/cwd')
};

export const mockChildProcess = {
  spawn: jest.fn(() => ({
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn(),
    kill: jest.fn(),
    unref: jest.fn()
  }))
};

// Test data
export const testData = {
  validValues: [10, 20, 30, 40],
  validLabels: ['A', 'B', 'C', 'D'],
  invalidValues: ['abc', 'def'],
  mismatchedData: {
    values: [10, 20],
    labels: ['A', 'B', 'C']
  }
};

// Helper functions
export const createMockEvent = (type, target = null) => ({
  type,
  target,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
});

export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));