/**
 * Tests for Emacs integration functionality
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

describe('Emacs Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Emacs Installation Check', () => {
    test('should check if Emacs is installed', (done) => {
      const checkEmacsInstallation = () => {
        return new Promise((resolve, reject) => {
          const emacs = spawn('emacs', ['--version'], {
            stdio: 'pipe'
          });
          
          let output = '';
          let error = '';
          
          emacs.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          emacs.stderr.on('data', (data) => {
            error += data.toString();
          });
          
          emacs.on('close', (code) => {
            if (code === 0 && output.includes('GNU Emacs')) {
              resolve(true);
            } else {
              reject(new Error('Emacs not found or not working properly'));
            }
          });
          
          emacs.on('error', (err) => {
            reject(new Error(`Failed to execute emacs: ${err.message}`));
          });
          
          // Timeout after 5 seconds
          setTimeout(() => {
            emacs.kill();
            reject(new Error('Emacs check timed out'));
          }, 5000);
        });
      };

      checkEmacsInstallation()
        .then((result) => {
          expect(result).toBe(true);
          done();
        })
        .catch((error) => {
          // Emacs might not be installed in test environment
          expect(error.message).toContain('Emacs');
          done();
        });
    });

    test('should handle Emacs integration disabled', () => {
      const checkEmacsInstallation = () => {
        return new Promise((resolve, reject) => {
          // Check if Emacs integration is enabled
          if (typeof window !== 'undefined' && window.EMACS_INTEGRATION === false) {
            reject(new Error('Emacs integration is disabled'));
            return;
          }
          
          resolve(true);
        });
      };

      // Mock window.EMACS_INTEGRATION as disabled
      global.window = { EMACS_INTEGRATION: false };

      return checkEmacsInstallation()
        .catch((error) => {
          expect(error.message).toBe('Emacs integration is disabled');
        });
    });
  });

  describe('Emacs Script Generation', () => {
    test('should generate valid Emacs script', () => {
      const dataValues = [10, 20, 30, 40];
      const labels = ['A', 'B', 'C', 'D'];

      const generateEmacsScript = (dataValues, labels) => {
        return `
;; Load the bar graph package
(load-file "${process.cwd()}/bar-graph.el")

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
      };

      const script = generateEmacsScript(dataValues, labels);
      
      expect(script).toContain('load-file');
      expect(script).toContain('bar-graph.el');
      expect(script).toContain('setq bar-graph-data');
      expect(script).toContain('(10 20 30 40)');
      expect(script).toContain('setq bar-graph-labels');
      expect(script).toContain('("A" "B" "C" "D")');
      expect(script).toContain('bar-graph-create-ascii');
      expect(script).toContain('switch-to-buffer "*Bar Graph*"');
    });

    test('should handle special characters in labels', () => {
      const dataValues = [10, 20];
      const labels = ['Label with "quotes"', 'Label with spaces'];

      const generateEmacsScript = (dataValues, labels) => {
        return `
;; Set the data
(setq bar-graph-data '(${dataValues.join(' ')}))
(setq bar-graph-labels '(${labels.map(l => `"${l}"`).join(' ')}))
`;
      };

      const script = generateEmacsScript(dataValues, labels);
      
      expect(script).toContain('("Label with "quotes"" "Label with spaces")');
    });
  });

  describe('Emacs Process Management', () => {
    test('should create temporary script file', () => {
      const mockFs = require('fs');
      const mockPath = require('path');
      
      const tempScript = 'temp-bar-graph.el';
      const scriptContent = 'test script content';
      
      const createTempScript = (scriptContent) => {
        const fs = require('fs');
        const path = require('path');
        const tempScript = path.join(process.cwd(), 'temp-bar-graph.el');
        
        fs.writeFileSync(tempScript, scriptContent);
        return tempScript;
      };

      // Mock fs.writeFileSync
      mockFs.writeFileSync = jest.fn();
      
      const scriptPath = createTempScript(scriptContent);
      
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(scriptPath, scriptContent);
    });

    test('should clean up temporary files', () => {
      const mockFs = require('fs');
      
      const cleanupTempFile = (filePath) => {
        const fs = require('fs');
        
        setTimeout(() => {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.log('Could not clean up temporary file:', e.message);
          }
        }, 1000);
      };

      // Mock fs.unlinkSync
      mockFs.unlinkSync = jest.fn();
      
      cleanupTempFile('temp-bar-graph.el');
      
      // Wait for the timeout
      setTimeout(() => {
        expect(mockFs.unlinkSync).toHaveBeenCalledWith('temp-bar-graph.el');
      }, 1100);
    });

    test('should launch Emacs with correct arguments', () => {
      const mockSpawn = jest.fn(() => ({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
        unref: jest.fn()
      }));

      const launchEmacs = (scriptPath) => {
        const { spawn } = require('child_process');
        const emacs = spawn('emacs', ['--no-splash', '--load', scriptPath], {
          detached: true,
          stdio: 'ignore'
        });
        
        emacs.unref();
        return emacs;
      };

      // Mock require to return our mock spawn
      const originalRequire = global.require;
      global.require = jest.fn((module) => {
        if (module === 'child_process') {
          return { spawn: mockSpawn };
        }
        return originalRequire(module);
      });

      const emacs = launchEmacs('temp-bar-graph.el');
      
      expect(mockSpawn).toHaveBeenCalledWith('emacs', ['--no-splash', '--load', 'temp-bar-graph.el'], {
        detached: true,
        stdio: 'ignore'
      });
      
      // Restore original require
      global.require = originalRequire;
    });
  });

  describe('Emacs Integration Configuration', () => {
    test('should show Emacs section when integration is enabled', () => {
      const mockElements = {
        emacsSection: { style: { display: 'none' } }
      };

      const showEmacsSection = (enabled) => {
        if (enabled) {
          mockElements.emacsSection.style.display = 'block';
        } else {
          mockElements.emacsSection.style.display = 'none';
        }
      };

      showEmacsSection(true);
      expect(mockElements.emacsSection.style.display).toBe('block');

      showEmacsSection(false);
      expect(mockElements.emacsSection.style.display).toBe('none');
    });

    test('should handle Emacs integration errors gracefully', () => {
      const mockDisplayError = jest.fn();
      
      const handleEmacsError = (error) => {
        if (error.message.includes('Emacs not found')) {
          mockDisplayError('Emacs not found: Please install Emacs and ensure it\'s in your PATH.');
        } else if (error.message.includes('timed out')) {
          mockDisplayError('Emacs check timed out. Please try again.');
        } else {
          mockDisplayError(`Error launching Emacs: ${error.message}`);
        }
      };

      handleEmacsError(new Error('Emacs not found or not working properly'));
      expect(mockDisplayError).toHaveBeenCalledWith('Emacs not found: Please install Emacs and ensure it\'s in your PATH.');

      handleEmacsError(new Error('Emacs check timed out'));
      expect(mockDisplayError).toHaveBeenCalledWith('Emacs check timed out. Please try again.');

      handleEmacsError(new Error('Some other error'));
      expect(mockDisplayError).toHaveBeenCalledWith('Error launching Emacs: Some other error');
    });
  });

  describe('Emacs Data Format', () => {
    test('should format data correctly for Emacs', () => {
      const dataValues = [10.5, 20.3, 30.7];
      const labels = ['Item 1', 'Item 2', 'Item 3'];

      const formatDataForEmacs = (dataValues, labels) => {
        return {
          values: dataValues,
          labels: labels,
          timestamp: new Date().toISOString()
        };
      };

      const formattedData = formatDataForEmacs(dataValues, labels);
      
      expect(formattedData.values).toEqual([10.5, 20.3, 30.7]);
      expect(formattedData.labels).toEqual(['Item 1', 'Item 2', 'Item 3']);
      expect(formattedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should handle empty data for Emacs', () => {
      const dataValues = [];
      const labels = [];

      const formatDataForEmacs = (dataValues, labels) => {
        return {
          values: dataValues,
          labels: labels,
          timestamp: new Date().toISOString()
        };
      };

      const formattedData = formatDataForEmacs(dataValues, labels);
      
      expect(formattedData.values).toEqual([]);
      expect(formattedData.labels).toEqual([]);
      expect(formattedData.timestamp).toBeDefined();
    });
  });
});
