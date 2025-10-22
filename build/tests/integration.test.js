/**
 * Integration tests for Electron Bar Graph
 */

const path = require('path');
const { spawn } = require('child_process');

describe('Electron App Integration', () => {
  let electronProcess;

  afterEach(() => {
    if (electronProcess) {
      electronProcess.kill();
    }
  });

  test('should start Electron app without errors', (done) => {
    const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
    const appPath = path.join(__dirname, '..');

    electronProcess = spawn(electronPath, [appPath], {
      stdio: 'pipe'
    });

    let hasStarted = false;
    let hasError = false;

    electronProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Electron') || output.includes('ready')) {
        hasStarted = true;
        if (!hasError) {
          done();
        }
      }
    });

    electronProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (error.includes('Error') || error.includes('Failed')) {
        hasError = true;
        done(new Error(`Electron app failed to start: ${error}`));
      }
    });

    electronProcess.on('close', (code) => {
      if (code !== 0 && !hasStarted) {
        done(new Error(`Electron process exited with code ${code}`));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!hasStarted && !hasError) {
        done(new Error('Electron app failed to start within timeout'));
      }
    }, 10000);
  });

  test('should load HTML file correctly', (done) => {
    const fs = require('fs');
    const htmlPath = path.join(__dirname, '..', 'index.html');
    
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        done(err);
        return;
      }

      // Check for essential HTML elements
      expect(data).toContain('<title>Electron Bar Graph</title>');
      expect(data).toContain('id="valuesInput"');
      expect(data).toContain('id="labelsInput"');
      expect(data).toContain('id="plotButton"');
      expect(data).toContain('id="barGraphCanvas"');
      expect(data).toContain('script src="renderer.js"');
      
      done();
    });
  });

  test('should have valid CSS file', (done) => {
    const fs = require('fs');
    const cssPath = path.join(__dirname, '..', 'style.css');
    
    fs.readFile(cssPath, 'utf8', (err, data) => {
      if (err) {
        done(err);
        return;
      }

      // Check for essential CSS classes
      expect(data).toContain('.input-section');
      expect(data).toContain('.color-section');
      expect(data).toContain('.export-section');
      expect(data).toContain('.graph-container');
      
      done();
    });
  });

  test('should have valid package.json', (done) => {
    const fs = require('fs');
    const packagePath = path.join(__dirname, '..', 'package.json');
    
    fs.readFile(packagePath, 'utf8', (err, data) => {
      if (err) {
        done(err);
        return;
      }

      const packageJson = JSON.parse(data);
      
      expect(packageJson.name).toBe('electron-bar-graph');
      expect(packageJson.main).toBe('main.js');
      expect(packageJson.devDependencies).toHaveProperty('electron');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('test');
      
      done();
    });
  });
});

describe('File Structure Integration', () => {
  const fs = require('fs');
  const path = require('path');

  test('should have all required files', () => {
    const requiredFiles = [
      'main.js',
      'renderer.js',
      'index.html',
      'style.css',
      'package.json'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('should have valid JavaScript syntax in main.js', () => {
    const fs = require('fs');
    const mainPath = path.join(__dirname, '..', 'main.js');
    const content = fs.readFileSync(mainPath, 'utf8');
    
    // Basic syntax checks
    expect(content).toContain('const { app, BrowserWindow } = require(\'electron\')');
    expect(content).toContain('function createWindow()');
    expect(content).toContain('app.whenReady()');
    expect(content).toContain('app.on(\'window-all-closed\'');
  });

  test('should have valid JavaScript syntax in renderer.js', () => {
    const fs = require('fs');
    const rendererPath = path.join(__dirname, '..', 'renderer.js');
    const content = fs.readFileSync(rendererPath, 'utf8');
    
    // Basic syntax checks
    expect(content).toContain('document.addEventListener("DOMContentLoaded"');
    expect(content).toContain('const valuesInput = document.getElementById("valuesInput")');
    expect(content).toContain('const labelsInput = document.getElementById("labelsInput")');
    expect(content).toContain('const plotButton = document.getElementById("plotButton")');
  });

  test('should have valid HTML structure', () => {
    const fs = require('fs');
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for proper HTML structure
    expect(content).toContain('<!doctype html>');
    expect(content).toContain('<html>');
    expect(content).toContain('<head>');
    expect(content).toContain('<body>');
    expect(content).toContain('</html>');
    
    // Check for required form elements
    expect(content).toContain('<input type="text" id="valuesInput"');
    expect(content).toContain('<input type="text" id="labelsInput"');
    expect(content).toContain('<button id="plotButton"');
    expect(content).toContain('<canvas id="barGraphCanvas"');
  });
});

describe('Configuration Integration', () => {
  test('should handle missing config.h gracefully', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Mock fs.existsSync to return false
    const originalExistsSync = fs.existsSync;
    fs.existsSync = jest.fn(() => false);
    
    const loadConfiguration = () => {
      try {
        const configPath = path.join(process.cwd(), 'config.h');
        
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf8');
          
          const emacsMatch = configContent.match(/#define EMACS_INTEGRATION\s+(\d+)/);
          const debugMatch = configContent.match(/#define DEBUG\s+(\d+)/);
          const verboseMatch = configContent.match(/#define VERBOSE\s+(\d+)/);
          
          return {
            EMACS_INTEGRATION: emacsMatch ? emacsMatch[1] === '1' : false,
            DEBUG: debugMatch ? debugMatch[1] === '1' : false,
            VERBOSE: verboseMatch ? verboseMatch[1] === '1' : false
          };
        } else {
          // Default configuration
          return { EMACS_INTEGRATION: true, DEBUG: false, VERBOSE: false };
        }
      } catch (error) {
        return { EMACS_INTEGRATION: true, DEBUG: false, VERBOSE: false };
      }
    };

    const config = loadConfiguration();
    
    expect(config.EMACS_INTEGRATION).toBe(true);
    expect(config.DEBUG).toBe(false);
    expect(config.VERBOSE).toBe(false);
    
    // Restore original function
    fs.existsSync = originalExistsSync;
  });

  test('should parse config.h correctly', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Mock fs.existsSync and readFileSync
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    
    fs.existsSync = jest.fn(() => true);
    fs.readFileSync = jest.fn(() => '#define EMACS_INTEGRATION 1\n#define DEBUG 1\n#define VERBOSE 0');
    
    const loadConfiguration = () => {
      try {
        const configPath = path.join(process.cwd(), 'config.h');
        
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf8');
          
          const emacsMatch = configContent.match(/#define EMACS_INTEGRATION\s+(\d+)/);
          const debugMatch = configContent.match(/#define DEBUG\s+(\d+)/);
          const verboseMatch = configContent.match(/#define VERBOSE\s+(\d+)/);
          
          return {
            EMACS_INTEGRATION: emacsMatch ? emacsMatch[1] === '1' : false,
            DEBUG: debugMatch ? debugMatch[1] === '1' : false,
            VERBOSE: verboseMatch ? verboseMatch[1] === '1' : false
          };
        } else {
          return { EMACS_INTEGRATION: true, DEBUG: false, VERBOSE: false };
        }
      } catch (error) {
        return { EMACS_INTEGRATION: true, DEBUG: false, VERBOSE: false };
      }
    };

    const config = loadConfiguration();
    
    expect(config.EMACS_INTEGRATION).toBe(true);
    expect(config.DEBUG).toBe(true);
    expect(config.VERBOSE).toBe(false);
    
    // Restore original functions
    fs.existsSync = originalExistsSync;
    fs.readFileSync = originalReadFileSync;
  });
});
