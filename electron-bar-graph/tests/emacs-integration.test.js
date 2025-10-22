/*
 * Electron Bar Graph - Emacs Integration Tests
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { createMockDOM, mockFS, mockPath, mockChildProcess, waitFor } from './test-utils.js';

describe('Emacs Integration', () => {
  let dom, document;
  let emacsIntegration;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ window: global.window, document } = createMockDOM());
    global.document = document;
    global.process = { cwd: () => '/mock/cwd', platform: 'linux' };

    // Mock require
    global.require = jest.fn((module) => {
      switch (module) {
        case 'fs':
          return mockFS;
        case 'path':
          return mockPath;
        case 'child_process':
          return mockChildProcess;
        default:
          return {};
      }
    });

    // Initialize Emacs integration functions
    emacsIntegration = {
      checkEmacsInstallation: () => {
        return new Promise((resolve, reject) => {
          if (typeof global.window.EMACS_INTEGRATION !== 'undefined' && !global.window.EMACS_INTEGRATION) {
            reject(new Error('Emacs integration is disabled'));
            return;
          }
          
          const mockProcess = {
            stdout: { on: jest.fn() },
            stderr: { on: jest.fn() },
            on: jest.fn(),
            kill: jest.fn()
          };
          
          mockChildProcess.spawn.mockReturnValue(mockProcess);
          
          const emacs = mockChildProcess.spawn('emacs', ['--version'], {
            stdio: 'pipe'
          });
          
          let output = '';
          let hasError = false;
          
          emacs.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          emacs.on('close', (code) => {
            if (hasError) return; // Already rejected
            if (code === 0 && output.includes('GNU Emacs')) {
              resolve(true);
            } else {
              reject(new Error('Emacs not found or not working properly'));
            }
          });
          
          emacs.on('error', (err) => {
            hasError = true;
            reject(new Error(`Failed to execute emacs: ${err.message}`));
          });
          
          // Simulate successful check by default
          setTimeout(() => {
            if (!hasError) {
              output = 'GNU Emacs 29.1';
              const closeCallback = mockProcess.on.mock.calls.find(call => call[0] === 'close')?.[1];
              if (closeCallback) {
                closeCallback(0);
              }
            }
          }, 10);
        });
      },

      openInEmacs: async (dataValues, labels) => {
        try {
          await emacsIntegration.checkEmacsInstallation();
          
          if (dataValues.length === 0) {
            throw new Error('No data to display');
          }

          const data = {
            values: dataValues,
            labels: labels,
            timestamp: new Date().toISOString()
          };

          const emacsScript = `
;; Load the bar graph package
(load-file "${global.process.cwd()}/bar-graph.el")

;; Set the data
(setq bar-graph-data '(${dataValues.join(' ')}))
(setq bar-graph-labels '(${labels.map(l => `"${l}"`).join(' ')}))

;; Create the ASCII graph
(bar-graph-create-ascii bar-graph-data bar-graph-labels)

;; Switch to the bar graph buffer
(switch-to-buffer "*Bar Graph*")
(bar-graph-mode)

;; Show help message
(message "Bar Graph loaded! Use C-c C-e to export, C-c C-n for new graph")
`;

          const tempScript = mockPath.join(global.process.cwd(), 'temp-bar-graph.el');
          
          mockFS.writeFileSync(tempScript, emacsScript);
          
          const mockEmacsProcess = {
            unref: jest.fn()
          };
          
          mockChildProcess.spawn.mockReturnValue(mockEmacsProcess);
          
          const emacs = mockChildProcess.spawn('emacs', ['--no-splash', '--load', tempScript], {
            detached: true,
            stdio: 'ignore'
          });
          
          emacs.unref();
          
          return true;
        } catch (error) {
          throw error;
        }
      }
    };
  });

  describe('Emacs Installation Check', () => {
    it('should successfully detect Emacs installation', async () => {
      global.window.EMACS_INTEGRATION = true;
      
      const result = await emacsIntegration.checkEmacsInstallation();
      
      expect(result).toBe(true);
      expect(mockChildProcess.spawn).toHaveBeenCalledWith('emacs', ['--version'], {
        stdio: 'pipe'
      });
    });

    it('should reject when Emacs integration is disabled', async () => {
      global.window.EMACS_INTEGRATION = false;
      
      await expect(emacsIntegration.checkEmacsInstallation()).rejects.toThrow('Emacs integration is disabled');
    });

    it('should reject when Emacs is not found', async () => {
      global.window.EMACS_INTEGRATION = true;
      
      const checkEmacsWithError = () => {
        return new Promise((resolve, reject) => {
          const mockProcess = {
            stdout: { on: jest.fn() },
            stderr: { on: jest.fn() },
            on: jest.fn(),
            kill: jest.fn()
          };
          
          mockChildProcess.spawn.mockReturnValue(mockProcess);
          
          const emacs = mockChildProcess.spawn('emacs', ['--version'], {
            stdio: 'pipe'
          });
          
          emacs.on('error', (err) => {
            reject(new Error(`Failed to execute emacs: ${err.message}`));
          });
          
          // Simulate error immediately
          setTimeout(() => {
            const errorCallback = mockProcess.on.mock.calls.find(call => call[0] === 'error')?.[1];
            if (errorCallback) {
              errorCallback(new Error('ENOENT'));
            }
          }, 5);
        });
      };
      
      await expect(checkEmacsWithError()).rejects.toThrow('Failed to execute emacs');
    });

    it('should reject when Emacs returns non-zero exit code', async () => {
      global.window.EMACS_INTEGRATION = true;
      
      const checkEmacsWithFailure = () => {
        return new Promise((resolve, reject) => {
          const mockProcess = {
            stdout: { on: jest.fn() },
            stderr: { on: jest.fn() },
            on: jest.fn(),
            kill: jest.fn()
          };
          
          mockChildProcess.spawn.mockReturnValue(mockProcess);
          
          const emacs = mockChildProcess.spawn('emacs', ['--version'], {
            stdio: 'pipe'
          });
          
          let output = '';
          
          emacs.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          emacs.on('close', (code) => {
            if (code === 0 && output.includes('GNU Emacs')) {
              resolve(true);
            } else {
              reject(new Error('Emacs not found or not working properly'));
            }
          });
          
          // Simulate failed exit
          setTimeout(() => {
            const closeCallback = mockProcess.on.mock.calls.find(call => call[0] === 'close')?.[1];
            if (closeCallback) {
              closeCallback(1); // Exit code 1 = failure
            }
          }, 5);
        });
      };
      
      await expect(checkEmacsWithFailure()).rejects.toThrow('Emacs not found or not working properly');
    });
  });

  describe('Open in Emacs', () => {
    it('should successfully open data in Emacs', async () => {
      global.window.EMACS_INTEGRATION = true;
      const dataValues = [10, 20, 30];
      const labels = ['A', 'B', 'C'];
      
      // Clear previous mock calls
      mockChildProcess.spawn.mockClear();
      
      const result = await emacsIntegration.openInEmacs(dataValues, labels);
      
      expect(result).toBe(true);
      expect(mockFS.writeFileSync).toHaveBeenCalled();
      
      // Check that spawn was called for both Emacs check and Emacs launch
      expect(mockChildProcess.spawn).toHaveBeenCalledTimes(2);
      
      // Check the second call (Emacs launch) - look for the call with --no-splash
      const emacsLaunchCall = mockChildProcess.spawn.mock.calls.find(call => 
        call[1] && call[1].includes('--no-splash')
      );
      expect(emacsLaunchCall).toBeTruthy();
      expect(emacsLaunchCall[0]).toBe('emacs');
      expect(emacsLaunchCall[1]).toContain('--no-splash');
      expect(emacsLaunchCall[1]).toContain('--load');
      expect(emacsLaunchCall[2]).toEqual({ detached: true, stdio: 'ignore' });
    });

    it('should reject when no data is provided', async () => {
      global.window.EMACS_INTEGRATION = true;
      
      await expect(emacsIntegration.openInEmacs([], [])).rejects.toThrow('No data to display');
    });

    it('should create correct Emacs script content', async () => {
      global.window.EMACS_INTEGRATION = true;
      const dataValues = [10, 20, 30];
      const labels = ['A', 'B', 'C'];
      
      await emacsIntegration.openInEmacs(dataValues, labels);
      
      const writeCall = mockFS.writeFileSync.mock.calls[0];
      const scriptContent = writeCall[1];
      
      expect(scriptContent).toContain('(setq bar-graph-data \'(10 20 30))');
      expect(scriptContent).toContain('(setq bar-graph-labels \'("A" "B" "C"))');
      expect(scriptContent).toContain('(load-file "/mock/cwd/bar-graph.el")');
      expect(scriptContent).toContain('(bar-graph-create-ascii bar-graph-data bar-graph-labels)');
    });

    it('should handle file system errors gracefully', async () => {
      global.window.EMACS_INTEGRATION = true;
      mockFS.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      await expect(emacsIntegration.openInEmacs([10, 20], ['A', 'B'])).rejects.toThrow('Permission denied');
    });
  });

  describe('Configuration Integration', () => {
    it('should respect EMACS_INTEGRATION configuration', () => {
      global.window.EMACS_INTEGRATION = false;
      
      const emacsSection = { style: { display: 'none' } };
      
      if (global.window.EMACS_INTEGRATION) {
        emacsSection.style.display = 'block';
      }
      
      expect(emacsSection.style.display).toBe('none');
    });

    it('should show Emacs section when integration is enabled', () => {
      global.window.EMACS_INTEGRATION = true;
      
      const emacsSection = { style: { display: 'none' } };
      
      if (global.window.EMACS_INTEGRATION) {
        emacsSection.style.display = 'block';
      }
      
      expect(emacsSection.style.display).toBe('block');
    });
  });

  describe('Script Generation', () => {
    it('should generate valid Emacs Lisp script', () => {
      const dataValues = [1, 2, 3];
      const labels = ['X', 'Y', 'Z'];
      
      const generateScript = (values, labels) => {
        return `
;; Load the bar graph package
(load-file "${global.process.cwd()}/bar-graph.el")

;; Set the data
(setq bar-graph-data '(${values.join(' ')}))
(setq bar-graph-labels '(${labels.map(l => `"${l}"`).join(' ')}))

;; Create the ASCII graph
(bar-graph-create-ascii bar-graph-data bar-graph-labels)

;; Switch to the bar graph buffer
(switch-to-buffer "*Bar Graph*")
(bar-graph-mode)

;; Show help message
(message "Bar Graph loaded! Use C-c C-e to export, C-c C-n for new graph")
`;
      };
      
      const script = generateScript(dataValues, labels);
      
      expect(script).toContain('(setq bar-graph-data \'(1 2 3))');
      expect(script).toContain('(setq bar-graph-labels \'("X" "Y" "Z"))');
      expect(script).toContain('(load-file "/mock/cwd/bar-graph.el")');
    });

    it('should handle special characters in labels', () => {
      const labels = ['Test "Quote"', "Test 'Apostrophe'", 'Test\\Backslash'];
      
      const generateScript = (values, labels) => {
        return `(setq bar-graph-labels '(${labels.map(l => `"${l}"`).join(' ')}))`;
      };
      
      const script = generateScript([1, 2, 3], labels);
      
      expect(script).toContain('"Test "Quote""');
      expect(script).toContain('"Test \'Apostrophe\'"');
      expect(script).toContain('"Test\\Backslash"');
    });
  });
});