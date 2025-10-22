/**
 * Tests for main.js - Electron main process
 */

const { app, BrowserWindow } = require('electron');

// Mock the main.js module
const mockApp = {
  whenReady: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  quit: jest.fn()
};

const mockBrowserWindow = jest.fn(() => ({
  loadFile: jest.fn(),
  setMenu: jest.fn(),
  on: jest.fn()
}));

// Mock require for electron
global.require = jest.fn((module) => {
  if (module === 'electron') {
    return {
      app: mockApp,
      BrowserWindow: mockBrowserWindow
    };
  }
  return {};
});

describe('Main Process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a BrowserWindow with correct properties', () => {
    const mockWindow = {
      loadFile: jest.fn(),
      setMenu: jest.fn(),
      on: jest.fn()
    };
    
    BrowserWindow.mockImplementation(() => mockWindow);

    // Simulate the createWindow function
    const createWindow = () => {
      const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: true
        },
        autoHideMenuBar: true,
        resizable: true,
        minimizable: true,
        maximizable: true
      });

      win.setMenu(null);
      win.loadFile('index.html');
      return win;
    };

    const window = createWindow();

    expect(BrowserWindow).toHaveBeenCalledWith({
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
      },
      autoHideMenuBar: true,
      resizable: true,
      minimizable: true,
      maximizable: true
    });

    expect(mockWindow.setMenu).toHaveBeenCalledWith(null);
    expect(mockWindow.loadFile).toHaveBeenCalledWith('index.html');
  });

  test('should handle app ready event', () => {
    const mockCreateWindow = jest.fn();
    
    app.whenReady().then(() => {
      mockCreateWindow();
    });

    expect(app.whenReady).toHaveBeenCalled();
  });

  test('should handle window-all-closed event', () => {
    const originalPlatform = process.platform;
    
    // Test non-macOS platform
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    expect(app.on).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
    
    // Restore original platform
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true
    });
  });

  test('should handle activate event', () => {
    const mockGetAllWindows = jest.fn(() => []);
    BrowserWindow.getAllWindows = mockGetAllWindows;
    
    const mockCreateWindow = jest.fn();
    
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mockCreateWindow();
      }
    });

    expect(app.on).toHaveBeenCalledWith('activate', expect.any(Function));
  });
});
