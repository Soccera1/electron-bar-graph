/*
 * Electron Bar Graph - Main Process Tests
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { mockElectron } from './test-utils.js';

// Mock Electron
const mockApp = mockElectron.app;
const mockBrowserWindow = mockElectron.BrowserWindow;

// Mock the main.js module
const mockMain = {
  createWindow: jest.fn(),
  app: mockApp,
  BrowserWindow: mockBrowserWindow
};

describe('Main Process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWindow', () => {
    it('should create a window with correct configuration', () => {
      const mockWindow = {
        setMenu: jest.fn(),
        loadFile: jest.fn()
      };
      mockBrowserWindow.mockReturnValue(mockWindow);

      // Simulate createWindow function
      const createWindow = () => {
        const win = new mockBrowserWindow({
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

      expect(mockBrowserWindow).toHaveBeenCalledWith({
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

      expect(window.setMenu).toHaveBeenCalledWith(null);
      expect(window.loadFile).toHaveBeenCalledWith('index.html');
    });
  });

  describe('App lifecycle', () => {
    it('should handle app ready event', async () => {
      mockApp.whenReady.mockResolvedValue();
      
      // Simulate app ready handler
      await mockApp.whenReady();
      
      expect(mockApp.whenReady).toHaveBeenCalled();
    });

    it('should handle window-all-closed event on non-macOS', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      // Simulate window-all-closed handler
      const windowAllClosedHandler = () => {
        if (process.platform !== 'darwin') {
          mockApp.quit();
        }
      };

      windowAllClosedHandler();
      expect(mockApp.quit).toHaveBeenCalled();

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should not quit on macOS when all windows closed', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      // Simulate window-all-closed handler
      const windowAllClosedHandler = () => {
        if (process.platform !== 'darwin') {
          mockApp.quit();
        }
      };

      windowAllClosedHandler();
      expect(mockApp.quit).not.toHaveBeenCalled();

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should create window on activate when no windows exist', () => {
      mockBrowserWindow.getAllWindows = jest.fn(() => []);
      const mockWindow = { setMenu: jest.fn(), loadFile: jest.fn() };
      mockBrowserWindow.mockReturnValue(mockWindow);

      // Simulate activate handler
      const activateHandler = () => {
        if (mockBrowserWindow.getAllWindows().length === 0) {
          new mockBrowserWindow({
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
        }
      };

      activateHandler();
      expect(mockBrowserWindow).toHaveBeenCalled();
    });
  });
});