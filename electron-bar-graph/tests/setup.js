// Test setup for Electron Bar Graph

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

// Mock Electron modules
global.require = jest.fn((module) => {
  if (module === 'electron') {
    return {
      app: {
        whenReady: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        quit: jest.fn()
      },
      BrowserWindow: jest.fn(() => ({
        loadFile: jest.fn(),
        setMenu: jest.fn(),
        on: jest.fn(),
        getAllWindows: jest.fn(() => [])
      }))
    };
  }
  if (module === 'fs') {
    return {
      existsSync: jest.fn(),
      readFileSync: jest.fn(),
      writeFileSync: jest.fn(),
      unlinkSync: jest.fn()
    };
  }
  if (module === 'path') {
    return {
      join: jest.fn((...args) => args.join('/')),
      resolve: jest.fn((...args) => args.join('/'))
    };
  }
  if (module === 'child_process') {
    return {
      spawn: jest.fn(() => ({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
        unref: jest.fn()
      }))
    };
  }
  return {};
});

// Mock DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <div id="valuesInput"></div>
  <div id="labelsInput"></div>
  <div id="plotButton"></div>
  <div id="barGraphCanvas"></div>
  <div id="errorMessage"></div>
  <div id="colorMode"></div>
  <div id="primaryColor"></div>
  <div id="secondaryColor"></div>
  <div id="customColors"></div>
  <div id="emacsSection"></div>
  <div id="openInEmacs"></div>
  <div id="exportPNG"></div>
  <div id="exportJPEG"></div>
  <div id="exportWEBP"></div>
  <div id="exportSVG"></div>
</body>
</html>
`, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock canvas
const { createCanvas } = require('canvas');
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  fillText: jest.fn(),
  textAlign: 'left',
  textBaseline: 'alphabetic',
  font: '12px Arial',
  toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
}));

// Mock URL and Blob for export functionality
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

global.Blob = jest.fn(() => ({
  type: 'image/svg+xml'
}));

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
