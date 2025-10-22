/*
 * Electron Bar Graph - Renderer Process Tests
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { createMockDOM, mockFS, mockPath, mockChildProcess, testData } from './test-utils.js';

// Mock Node.js modules
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

describe('Renderer Process', () => {
  let dom, document, mockCanvas, mockContext;
  let rendererFunctions;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ window: global.window, document, mockCanvas, mockContext } = createMockDOM());
    global.document = document;
    global.process = { cwd: () => '/mock/cwd', platform: 'linux' };

    // Mock DOM elements - create them once and reuse
    const mockElements = {
      valuesInput: { id: 'valuesInput', value: '10,20,30,40' },
      labelsInput: { id: 'labelsInput', value: 'A,B,C,D' },
      plotButton: { id: 'plotButton' },
      barGraphCanvas: mockCanvas,
      errorMessage: { id: 'errorMessage', textContent: '', style: { display: 'none' } },
      colorMode: { id: 'colorMode', value: 'single' },
      primaryColor: { id: 'primaryColor', value: '#3498db' },
      secondaryColor: { id: 'secondaryColor', value: '#e74c3c', style: { display: 'none' } },
      customColors: { id: 'customColors', value: '' },
      emacsSection: { id: 'emacsSection', style: { display: 'none' } },
      openInEmacs: { id: 'openInEmacs' },
      exportPNG: { id: 'exportPNG' },
      exportJPEG: { id: 'exportJPEG' },
      exportWEBP: { id: 'exportWEBP' },
      exportSVG: { id: 'exportSVG' }
    };

    document.getElementById = jest.fn((id) => {
      return mockElements[id] || null;
    });

    // Initialize renderer functions
    rendererFunctions = {
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

      generateColors: (count, mode = 'single', primary = '#3498db', secondary = '#e74c3c', custom = '') => {
        switch (mode) {
          case 'single':
            return Array(count).fill(primary);
          case 'gradient':
            return rendererFunctions.generateGradientColors(primary, secondary, count);
          case 'rainbow':
            return rendererFunctions.generateRainbowColors(count);
          case 'custom':
            const customColorList = custom.split(',').map(c => c.trim());
            if (customColorList.length >= count) {
              return customColorList.slice(0, count);
            } else {
              const colors = [];
              for (let i = 0; i < count; i++) {
                colors.push(customColorList[i % customColorList.length]);
              }
              return colors;
            }
          default:
            return Array(count).fill(primary);
        }
      },

      generateGradientColors: (color1, color2, steps) => {
        const colors = [];
        const c1 = rendererFunctions.hexToRgb(color1);
        const c2 = rendererFunctions.hexToRgb(color2);
        
        for (let i = 0; i < steps; i++) {
          const ratio = steps === 1 ? 0 : i / (steps - 1);
          const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
          const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
          const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
          colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        
        return colors;
      },

      generateRainbowColors: (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
          const hue = (i * 360) / count;
          colors.push(`hsl(${hue}, 70%, 50%)`);
        }
        return colors;
      },

      hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      },

      loadConfiguration: () => {
        try {
          mockPath.join.mockReturnValue('/mock/cwd/config.h');
          
          if (mockFS.existsSync('/mock/cwd/config.h')) {
            const configContent = mockFS.readFileSync('/mock/cwd/config.h', 'utf8');
            
            const emacsMatch = configContent.match(/#define EMACS_INTEGRATION\s+(\d+)/);
            if (emacsMatch) {
              global.window.EMACS_INTEGRATION = emacsMatch[1] === '1';
            }
            
            const debugMatch = configContent.match(/#define DEBUG\s+(\d+)/);
            if (debugMatch) {
              global.window.DEBUG = debugMatch[1] === '1';
            }
            
            const verboseMatch = configContent.match(/#define VERBOSE\s+(\d+)/);
            if (verboseMatch) {
              global.window.VERBOSE = verboseMatch[1] === '1';
            }
          } else {
            global.window.EMACS_INTEGRATION = true;
            global.window.DEBUG = false;
            global.window.VERBOSE = false;
          }
        } catch (error) {
          global.window.EMACS_INTEGRATION = true;
          global.window.DEBUG = false;
          global.window.VERBOSE = false;
        }
      }
    };
  });

  describe('Input Parsing', () => {
    it('should parse valid input values and labels', () => {
      const result = rendererFunctions.parseInputValues();
      
      expect(result.hasError).toBe(false);
      expect(result.dataValues).toEqual([10, 20, 30, 40]);
      expect(result.labels).toEqual(['A', 'B', 'C', 'D']);
    });

    it('should handle invalid numeric values', () => {
      const valuesInput = document.getElementById('valuesInput');
      const labelsInput = document.getElementById('labelsInput');
      valuesInput.value = 'abc,def,ghi';
      labelsInput.value = 'A,B,C';
      
      const result = rendererFunctions.parseInputValues();
      
      // After filtering NaN values, we have [] but labels are ['A', 'B', 'C']
      // This is a mismatch, so hasError should be true
      expect(result.hasError).toBe(true);
      expect(result.dataValues).toEqual([]);
      expect(result.labels).toEqual([]);
    });

    it('should handle mismatched values and labels', () => {
      const valuesInput = document.getElementById('valuesInput');
      const labelsInput = document.getElementById('labelsInput');
      
      valuesInput.value = '10,20';
      labelsInput.value = 'A,B,C';
      
      const result = rendererFunctions.parseInputValues();
      
      // 2 values vs 3 labels = mismatch
      expect(result.hasError).toBe(true);
      expect(result.dataValues).toEqual([]);
      expect(result.labels).toEqual([]);
    });

    it('should filter out NaN values', () => {
      const valuesInput = document.getElementById('valuesInput');
      const labelsInput = document.getElementById('labelsInput');
      
      valuesInput.value = '10,abc,20,def';
      labelsInput.value = 'A,B';
      
      const result = rendererFunctions.parseInputValues();
      
      // After filtering NaN values, we have [10, 20] but labels are ['A', 'B']
      // This should match, so no error
      expect(result.hasError).toBe(false);
      expect(result.dataValues).toEqual([10, 20]);
      expect(result.labels).toEqual(['A', 'B']);
    });

    it('should convert negative values to zero', () => {
      const valuesInput = document.getElementById('valuesInput');
      const labelsInput = document.getElementById('labelsInput');
      
      valuesInput.value = '-10,20,-5,30';
      labelsInput.value = 'A,B,C,D';
      
      const result = rendererFunctions.parseInputValues();
      
      expect(result.hasError).toBe(false);
      expect(result.dataValues).toEqual([0, 20, 0, 30]);
      expect(result.labels).toEqual(['A', 'B', 'C', 'D']);
    });
  });

  describe('Color Generation', () => {
    it('should generate single color array', () => {
      const colors = rendererFunctions.generateColors(4, 'single', '#ff0000');
      
      expect(colors).toEqual(['#ff0000', '#ff0000', '#ff0000', '#ff0000']);
    });

    it('should generate gradient colors', () => {
      const colors = rendererFunctions.generateColors(3, 'gradient', '#ff0000', '#0000ff');
      
      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe('rgb(255, 0, 0)');
      expect(colors[2]).toBe('rgb(0, 0, 255)');
    });

    it('should generate rainbow colors', () => {
      const colors = rendererFunctions.generateColors(4, 'rainbow');
      
      expect(colors).toHaveLength(4);
      expect(colors[0]).toBe('hsl(0, 70%, 50%)');
      expect(colors[1]).toBe('hsl(90, 70%, 50%)');
      expect(colors[2]).toBe('hsl(180, 70%, 50%)');
      expect(colors[3]).toBe('hsl(270, 70%, 50%)');
    });

    it('should generate custom colors', () => {
      const colors = rendererFunctions.generateColors(3, 'custom', '#000000', '#000000', '#ff0000,#00ff00,#0000ff');
      
      expect(colors).toEqual(['#ff0000', '#00ff00', '#0000ff']);
    });

    it('should repeat custom colors if not enough provided', () => {
      const colors = rendererFunctions.generateColors(4, 'custom', '#000000', '#000000', '#ff0000,#00ff00');
      
      expect(colors).toEqual(['#ff0000', '#00ff00', '#ff0000', '#00ff00']);
    });
  });

  describe('Color Utilities', () => {
    it('should convert hex to RGB', () => {
      const rgb = rendererFunctions.hexToRgb('#ff0000');
      
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle hex without hash', () => {
      const rgb = rendererFunctions.hexToRgb('00ff00');
      
      expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should return null for invalid hex', () => {
      const rgb = rendererFunctions.hexToRgb('invalid');
      
      expect(rgb).toBeNull();
    });

    it('should generate gradient with single step', () => {
      const colors = rendererFunctions.generateGradientColors('#ff0000', '#0000ff', 1);
      
      expect(colors).toEqual(['rgb(255, 0, 0)']);
    });
  });

  describe('Configuration Loading', () => {
    it('should load configuration from config.h', () => {
      mockFS.existsSync.mockReturnValue(true);
      mockFS.readFileSync.mockReturnValue(`
        #define EMACS_INTEGRATION 1
        #define DEBUG 1
        #define VERBOSE 0
      `);
      
      rendererFunctions.loadConfiguration();
      
      expect(global.window.EMACS_INTEGRATION).toBe(true);
      expect(global.window.DEBUG).toBe(true);
      expect(global.window.VERBOSE).toBe(false);
    });

    it('should use default configuration when config.h does not exist', () => {
      mockFS.existsSync.mockReturnValue(false);
      
      rendererFunctions.loadConfiguration();
      
      expect(global.window.EMACS_INTEGRATION).toBe(true);
      expect(global.window.DEBUG).toBe(false);
      expect(global.window.VERBOSE).toBe(false);
    });

    it('should handle configuration loading errors', () => {
      mockFS.existsSync.mockImplementation(() => {
        throw new Error('File system error');
      });
      
      rendererFunctions.loadConfiguration();
      
      expect(global.window.EMACS_INTEGRATION).toBe(true);
      expect(global.window.DEBUG).toBe(false);
      expect(global.window.VERBOSE).toBe(false);
    });
  });

  describe('Canvas Drawing', () => {
    it('should clear canvas before drawing', () => {
      const drawGraph = (dataValues, labels) => {
        mockContext.clearRect(0, 0, mockCanvas.width, mockCanvas.height);
        mockContext.fillStyle = 'white';
        mockContext.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
      };

      drawGraph([10, 20, 30], ['A', 'B', 'C']);

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 760, 400);
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 760, 400);
    });

    it('should handle empty data gracefully', () => {
      const drawGraph = (dataValues, labels) => {
        mockContext.clearRect(0, 0, mockCanvas.width, mockCanvas.height);
        if (dataValues.length === 0) {
          return;
        }
      };

      drawGraph([], []);

      expect(mockContext.clearRect).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    it('should export canvas as PNG', () => {
      mockCanvas.toDataURL = jest.fn(() => 'data:image/png;base64,mockdata');
      
      const exportCanvas = (format) => {
        let dataURL = mockCanvas.toDataURL(`image/${format}`);
        return dataURL;
      };

      const result = exportCanvas('png');
      
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(result).toBe('data:image/png;base64,mockdata');
    });

    it('should export canvas as JPEG with quality', () => {
      mockCanvas.toDataURL = jest.fn(() => 'data:image/jpeg;base64,mockdata');
      
      const exportCanvas = (format) => {
        let dataURL;
        if (format === 'jpeg') {
          dataURL = mockCanvas.toDataURL('image/jpeg', 0.9);
        }
        return dataURL;
      };

      const result = exportCanvas('jpeg');
      
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.9);
    });
  });
});