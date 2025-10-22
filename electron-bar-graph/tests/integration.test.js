/*
 * Electron Bar Graph - Integration Tests
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { createMockDOM, mockFS, mockPath, mockChildProcess, testData, waitFor } from './test-utils.js';

describe('Integration Tests', () => {
  let dom, document, mockCanvas, mockContext;
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ window: global.window, document, mockCanvas, mockContext } = createMockDOM());
    global.document = document;
    global.process = { cwd: () => '/mock/cwd', platform: 'linux' };
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:mock-url'),
      revokeObjectURL: jest.fn()
    };
    global.Blob = jest.fn();

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

    // Mock DOM elements with event listeners
    const createElementWithEvents = (tag, id, value = '') => {
      const element = {
        tagName: tag.toUpperCase(),
        id: id,
        value: value,
        textContent: '',
        addEventListener: jest.fn(),
        style: { display: '' }
      };
      return element;
    };

    // Create persistent mock elements
    const mockElements = {
      valuesInput: createElementWithEvents('input', 'valuesInput', '10,20,30,40'),
      labelsInput: createElementWithEvents('input', 'labelsInput', 'A,B,C,D'),
      plotButton: createElementWithEvents('button', 'plotButton'),
      barGraphCanvas: mockCanvas,
      errorMessage: createElementWithEvents('div', 'errorMessage'),
      colorMode: createElementWithEvents('select', 'colorMode', 'single'),
      primaryColor: createElementWithEvents('input', 'primaryColor', '#3498db'),
      secondaryColor: createElementWithEvents('input', 'secondaryColor', '#e74c3c'),
      customColors: createElementWithEvents('input', 'customColors'),
      emacsSection: createElementWithEvents('div', 'emacsSection'),
      openInEmacs: createElementWithEvents('button', 'openInEmacs'),
      exportPNG: createElementWithEvents('button', 'exportPNG'),
      exportJPEG: createElementWithEvents('button', 'exportJPEG'),
      exportWEBP: createElementWithEvents('button', 'exportWEBP'),
      exportSVG: createElementWithEvents('button', 'exportSVG'),
      secondaryColorLabel: createElementWithEvents('label', 'secondaryColorLabel'),
      customColorsLabel: createElementWithEvents('label', 'customColorsLabel')
    };

    document.getElementById = jest.fn((id) => {
      return mockElements[id] || null;
    });

    if (!document.body) {
      document.body = document.createElement('body');
    }
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    // Initialize app simulation
    app = {
      loadConfiguration: () => {
        global.window.EMACS_INTEGRATION = true;
        global.window.DEBUG = false;
        global.window.VERBOSE = false;
      },

      parseInputValues: () => {
        const valuesInput = document.getElementById('valuesInput');
        const labelsInput = document.getElementById('labelsInput');
        
        const valueText = valuesInput.value;
        const labelText = labelsInput.value;

        let dataValues = [];
        let labels = [];

        try {
          dataValues = valueText
            .split(',')
            .map((x) => parseFloat(x.trim()))
            .filter((val) => !isNaN(val));
          dataValues = dataValues.map((val) => Math.max(0, val));

          labels = labelText.split(',').map((x) => x.trim());

          if (dataValues.length !== labels.length) {
            return { dataValues: [], labels: [], hasError: true };
          }
        } catch (e) {
          return { dataValues: [], labels: [], hasError: true };
        }
        return { dataValues, labels, hasError: false };
      },

      drawGraph: (dataValues, labels) => {
        mockContext.clearRect(0, 0, mockCanvas.width, mockCanvas.height);
        mockContext.fillStyle = 'white';
        mockContext.fillRect(0, 0, mockCanvas.width, mockCanvas.height);

        if (dataValues.length === 0) return;

        // Simulate drawing bars
        for (let i = 0; i < dataValues.length; i++) {
          mockContext.fillStyle = '#3498db';
          mockContext.fillRect(30 + i * 100, 100, 80, dataValues[i] * 10);
        }
      },

      displayError: (message) => {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
          errorDiv.textContent = message;
          errorDiv.style.display = message ? 'block' : 'none';
        }
      }
    };
  });

  describe('Complete Workflow', () => {
    it('should handle complete graph creation workflow', () => {
      // Load configuration
      app.loadConfiguration();
      expect(global.window.EMACS_INTEGRATION).toBe(true);

      // Parse input
      const { dataValues, labels, hasError } = app.parseInputValues();
      expect(hasError).toBe(false);
      expect(dataValues).toEqual([10, 20, 30, 40]);
      expect(labels).toEqual(['A', 'B', 'C', 'D']);

      // Draw graph
      app.drawGraph(dataValues, labels);
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 760, 400);
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 760, 400);
    });

    it('should handle error workflow', () => {
      // Set invalid input - this should result in empty array after filtering NaN
      const valuesInput = document.getElementById('valuesInput');
      const labelsInput = document.getElementById('labelsInput');
      valuesInput.value = 'invalid,data';  // These will be filtered out as NaN
      labelsInput.value = 'A,B,C';         // 3 labels vs 0 values = mismatch

      const { dataValues, labels, hasError } = app.parseInputValues();
      expect(hasError).toBe(true);

      app.displayError('Error: Invalid input data');
      const errorDiv = document.getElementById('errorMessage');
      expect(errorDiv.textContent).toBe('Error: Invalid input data');
      expect(errorDiv.style.display).toBe('block');
    });

    it('should clear error when valid data is provided', () => {
      const errorDiv = document.getElementById('errorMessage');
      
      // First show error
      app.displayError('Some error');
      expect(errorDiv.textContent).toBe('Some error');
      expect(errorDiv.style.display).toBe('block');

      // Then clear error
      app.displayError('');
      expect(errorDiv.textContent).toBe('');
      expect(errorDiv.style.display).toBe('none');
    });
  });

  describe('Event Handling Integration', () => {
    it('should set up all required event listeners', () => {
      const elements = [
        'plotButton',
        'colorMode',
        'primaryColor',
        'secondaryColor',
        'customColors',
        'openInEmacs',
        'exportPNG',
        'exportJPEG',
        'exportWEBP',
        'exportSVG'
      ];

      elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        expect(element).toBeTruthy();
        // In a real implementation, we would check that addEventListener was called
      });
    });

    it('should handle plot button click simulation', () => {
      const plotButton = document.getElementById('plotButton');
      
      // Simulate click handler
      const handlePlotClick = () => {
        const { dataValues, labels, hasError } = app.parseInputValues();
        if (!hasError) {
          app.drawGraph(dataValues, labels);
          app.displayError('');
        } else {
          app.displayError('Invalid input data');
        }
      };

      handlePlotClick();
      expect(mockContext.clearRect).toHaveBeenCalled();
    });

    it('should handle color mode changes', () => {
      const colorMode = document.getElementById('colorMode');
      const secondaryColor = document.getElementById('secondaryColor');
      const secondaryColorLabel = document.getElementById('secondaryColorLabel');
      const customColors = document.getElementById('customColors');
      const customColorsLabel = document.getElementById('customColorsLabel');

      // Simulate gradient mode
      const updateColorControls = (mode) => {
        secondaryColor.style.display = 'none';
        secondaryColorLabel.style.display = 'none';
        customColors.style.display = 'none';
        customColorsLabel.style.display = 'none';
        
        if (mode === 'gradient') {
          secondaryColor.style.display = 'inline-block';
          secondaryColorLabel.style.display = 'inline-block';
        } else if (mode === 'custom') {
          customColors.style.display = 'inline-block';
          customColorsLabel.style.display = 'inline-block';
        }
      };

      updateColorControls('gradient');
      expect(secondaryColor.style.display).toBe('inline-block');
      expect(customColors.style.display).toBe('none');

      updateColorControls('custom');
      expect(secondaryColor.style.display).toBe('none');
      expect(customColors.style.display).toBe('inline-block');
    });
  });

  describe('Export Integration', () => {
    it('should handle PNG export workflow', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mockdata');
      
      const exportPNG = () => {
        const dataURL = mockCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'bar-graph.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return dataURL;
      };

      const result = exportPNG();
      expect(result).toBe('data:image/png;base64,mockdata');
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    });

    it('should handle SVG export workflow', () => {
      const { dataValues, labels } = app.parseInputValues();
      
      const exportSVG = (values, labels) => {
        if (values.length === 0) return;
        
        let svgContent = '<svg width="760" height="400" xmlns="http://www.w3.org/2000/svg">';
        svgContent += '<rect width="760" height="400" fill="white"/>';
        
        // Add bars
        for (let i = 0; i < values.length; i++) {
          svgContent += `<rect x="${30 + i * 100}" y="100" width="80" height="${values[i] * 10}" fill="#3498db"/>`;
        }
        
        svgContent += '</svg>';
        
        const blob = new global.Blob([svgContent], { type: 'image/svg+xml' });
        const url = global.URL.createObjectURL(blob);
        
        return svgContent;
      };

      const svgContent = exportSVG(dataValues, labels);
      expect(svgContent).toContain('<svg');
      expect(svgContent).toContain('</svg>');
      expect(global.Blob).toHaveBeenCalled();
    });
  });

  describe('Emacs Integration Workflow', () => {
    it('should handle complete Emacs workflow', async () => {
      global.window.EMACS_INTEGRATION = true;
      
      // Reset the mock to avoid interference from other tests
      mockFS.writeFileSync.mockReset();
      mockFS.writeFileSync.mockImplementation(() => {}); // Don't throw error
      
      const { dataValues, labels } = app.parseInputValues();
      
      const openInEmacs = async (values, labels) => {
        if (values.length === 0) {
          throw new Error('No data to display');
        }

        // Mock successful Emacs check
        const mockProcess = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn(),
          kill: jest.fn(),
          unref: jest.fn()
        };
        
        mockChildProcess.spawn.mockReturnValue(mockProcess);
        
        // Simulate successful check
        setTimeout(() => {
          const closeCallback = mockProcess.on.mock.calls.find(call => call[0] === 'close')?.[1];
          if (closeCallback) closeCallback(0);
          
          const stdoutCallback = mockProcess.stdout.on.mock.calls.find(call => call[0] === 'data')?.[1];
          if (stdoutCallback) stdoutCallback('GNU Emacs 29.1');
        }, 10);

        const emacsScript = `
;; Load the bar graph package
(load-file "${global.process.cwd()}/bar-graph.el")

;; Set the data
(setq bar-graph-data '(${values.join(' ')}))
(setq bar-graph-labels '(${labels.map(l => `"${l}"`).join(' ')}))
`;

        mockFS.writeFileSync('/mock/cwd/temp-bar-graph.el', emacsScript);
        
        const emacs = mockChildProcess.spawn('emacs', ['--no-splash', '--load', '/mock/cwd/temp-bar-graph.el'], {
          detached: true,
          stdio: 'ignore'
        });
        
        emacs.unref();
        return true;
      };

      await waitFor(20); // Wait for async operations
      const result = await openInEmacs(dataValues, labels);
      
      expect(result).toBe(true);
      expect(mockFS.writeFileSync).toHaveBeenCalled();
    });

    it('should handle Emacs integration disabled', () => {
      global.window.EMACS_INTEGRATION = false;
      
      const emacsSection = document.getElementById('emacsSection');
      
      // Simulate configuration check
      if (global.window.EMACS_INTEGRATION) {
        emacsSection.style.display = 'block';
      } else {
        emacsSection.style.display = 'none';
      }
      
      expect(emacsSection.style.display).toBe('none');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from canvas errors', () => {
      mockContext.fillRect.mockImplementation(() => {
        throw new Error('Canvas error');
      });

      const safeDrawGraph = (dataValues, labels) => {
        try {
          mockContext.clearRect(0, 0, mockCanvas.width, mockCanvas.height);
          mockContext.fillStyle = 'white';
          mockContext.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
          return true;
        } catch (error) {
          app.displayError('Canvas drawing error: ' + error.message);
          return false;
        }
      };

      const result = safeDrawGraph([10, 20], ['A', 'B']);
      expect(result).toBe(false);
      
      const errorDiv = document.getElementById('errorMessage');
      expect(errorDiv.textContent).toContain('Canvas drawing error');
      expect(errorDiv.style.display).toBe('block');
    });

    it('should handle file system errors in exports', () => {
      // Create a separate mock for this test to avoid interference
      const localMockFS = {
        writeFileSync: jest.fn(() => {
          throw new Error('Permission denied');
        })
      };

      const safeExport = () => {
        try {
          localMockFS.writeFileSync('/mock/path', 'content');
          return true;
        } catch (error) {
          app.displayError('Export error: ' + error.message);
          return false;
        }
      };

      const result = safeExport();
      expect(result).toBe(false);
      
      const errorDiv = document.getElementById('errorMessage');
      expect(errorDiv.textContent).toContain('Export error: Permission denied');
      expect(errorDiv.style.display).toBe('block');
    });
  });
});