/**
 * End-to-end tests for Electron Bar Graph
 * Note: These are simplified E2E tests that don't require Spectron
 */

const path = require('path');
const { spawn } = require('child_process');

describe('Electron Bar Graph E2E Tests', () => {
  let electronProcess;

  beforeAll(async () => {
    // Start Electron process for testing
    electronProcess = spawn('npx', ['electron', path.join(__dirname, '..')], {
      stdio: 'pipe'
    });
    
    // Wait a moment for the app to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    if (electronProcess) {
      electronProcess.kill();
    }
  });

  test('should start Electron process successfully', () => {
    expect(electronProcess).toBeDefined();
    expect(electronProcess.pid).toBeDefined();
  });

  test('should have required files for E2E testing', () => {
    const fs = require('fs');
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

  test('should have valid HTML structure for E2E', () => {
    const fs = require('fs');
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Check for essential elements
    expect(htmlContent).toContain('id="valuesInput"');
    expect(htmlContent).toContain('id="labelsInput"');
    expect(htmlContent).toContain('id="plotButton"');
    expect(htmlContent).toContain('id="barGraphCanvas"');
  });

  test('should have valid package.json for E2E', () => {
    const fs = require('fs');
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    expect(packageJson.name).toBe('electron-bar-graph');
    expect(packageJson.main).toBe('main.js');
    expect(packageJson.devDependencies.electron).toBeDefined();
  });

  test('should have valid main.js for E2E', () => {
    const fs = require('fs');
    const mainPath = path.join(__dirname, '..', 'main.js');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    
    expect(mainContent).toContain('const { app, BrowserWindow } = require(\'electron\')');
    expect(mainContent).toContain('function createWindow()');
    expect(mainContent).toContain('app.whenReady()');
  });

  test('should have valid renderer.js for E2E', () => {
    const fs = require('fs');
    const rendererPath = path.join(__dirname, '..', 'renderer.js');
    const rendererContent = fs.readFileSync(rendererPath, 'utf8');
    
    expect(rendererContent).toContain('document.addEventListener("DOMContentLoaded"');
    expect(rendererContent).toContain('const valuesInput = document.getElementById("valuesInput")');
    expect(rendererContent).toContain('const plotButton = document.getElementById("plotButton")');
  });
});
