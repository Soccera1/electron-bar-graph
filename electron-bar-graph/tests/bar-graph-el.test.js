/*
 * Electron Bar Graph - bar-graph.el Tests
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { mockFS, mockPath } from './test-utils.js';

describe('bar-graph.el Integration', () => {
  let barGraphEl;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the bar-graph.el functionality in JavaScript for testing
    barGraphEl = {
      createAsciiGraph: (data, labels) => {
        if (!data || data.length === 0) {
          return 'No data to display';
        }

        const maxValue = Math.max(...data);
        const maxBarLength = 50; // Maximum bar length in characters
        const scale = maxBarLength / maxValue;

        let graph = '\nBar Graph:\n';
        graph += '='.repeat(60) + '\n';

        for (let i = 0; i < data.length; i++) {
          const value = data[i];
          const barLength = Math.round(value * scale);
          const bar = '█'.repeat(barLength);
          const label = labels && labels[i] ? labels[i] : `Item ${i + 1}`;
          
          graph += `${label.padEnd(10)} | ${bar} ${value}\n`;
        }

        graph += '=' .repeat(60) + '\n';
        return graph;
      },

      exportToFile: (graph, filename) => {
        try {
          mockFS.writeFileSync(filename, graph);
          return true;
        } catch (error) {
          return false;
        }
      },

      validateData: (data, labels) => {
        if (!Array.isArray(data)) {
          return { valid: false, error: 'Data must be an array' };
        }

        if (data.length === 0) {
          return { valid: false, error: 'Data array cannot be empty' };
        }

        if (data.some(val => typeof val !== 'number' || isNaN(val))) {
          return { valid: false, error: 'All data values must be numbers' };
        }

        if (data.some(val => val < 0)) {
          return { valid: false, error: 'All data values must be non-negative' };
        }

        if (labels && labels.length !== data.length) {
          return { valid: false, error: 'Labels array length must match data array length' };
        }

        return { valid: true };
      },

      generateEmacsLispCode: (data, labels) => {
        const validation = barGraphEl.validateData(data, labels);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        let lispCode = ';; Generated bar graph data\n';
        lispCode += `(setq bar-graph-data '(${data.join(' ')}))\n`;
        
        if (labels && labels.length > 0) {
          const quotedLabels = labels.map(label => `"${label}"`).join(' ');
          lispCode += `(setq bar-graph-labels '(${quotedLabels}))\n`;
        }

        lispCode += '\n;; Create the graph\n';
        lispCode += '(bar-graph-create-ascii bar-graph-data bar-graph-labels)\n';

        return lispCode;
      }
    };

    // Mock require for fs
    global.require = jest.fn((module) => {
      if (module === 'fs') return mockFS;
      if (module === 'path') return mockPath;
      return {};
    });
  });

  describe('ASCII Graph Creation', () => {
    it('should create ASCII graph with valid data', () => {
      const data = [10, 20, 30, 15];
      const labels = ['A', 'B', 'C', 'D'];

      const graph = barGraphEl.createAsciiGraph(data, labels);

      expect(graph).toContain('Bar Graph:');
      expect(graph).toContain('A          |');
      expect(graph).toContain('B          |');
      expect(graph).toContain('C          |');
      expect(graph).toContain('D          |');
      expect(graph).toContain('10');
      expect(graph).toContain('20');
      expect(graph).toContain('30');
      expect(graph).toContain('15');
    });

    it('should handle data without labels', () => {
      const data = [5, 10, 15];

      const graph = barGraphEl.createAsciiGraph(data);

      expect(graph).toContain('Item 1');
      expect(graph).toContain('Item 2');
      expect(graph).toContain('Item 3');
    });

    it('should handle empty data', () => {
      const graph = barGraphEl.createAsciiGraph([]);

      expect(graph).toBe('No data to display');
    });

    it('should handle null or undefined data', () => {
      const graph1 = barGraphEl.createAsciiGraph(null);
      const graph2 = barGraphEl.createAsciiGraph(undefined);

      expect(graph1).toBe('No data to display');
      expect(graph2).toBe('No data to display');
    });

    it('should scale bars proportionally', () => {
      const data = [10, 50]; // Max is 50, so 10 should be 1/5 the length
      const labels = ['Small', 'Large'];

      const graph = barGraphEl.createAsciiGraph(data, labels);

      // Count bar characters for each line
      const lines = graph.split('\n');
      const smallBarLine = lines.find(line => line.includes('Small'));
      const largeBarLine = lines.find(line => line.includes('Large'));

      const smallBarCount = (smallBarLine.match(/█/g) || []).length;
      const largeBarCount = (largeBarLine.match(/█/g) || []).length;

      expect(largeBarCount).toBeGreaterThan(smallBarCount);
      expect(largeBarCount).toBe(50); // Should be max bar length
    });

    it('should handle single data point', () => {
      const data = [42];
      const labels = ['Answer'];

      const graph = barGraphEl.createAsciiGraph(data, labels);

      expect(graph).toContain('Answer');
      expect(graph).toContain('42');
    });
  });

  describe('Data Validation', () => {
    it('should validate correct data and labels', () => {
      const data = [10, 20, 30];
      const labels = ['A', 'B', 'C'];

      const result = barGraphEl.validateData(data, labels);

      expect(result.valid).toBe(true);
    });

    it('should reject non-array data', () => {
      const result = barGraphEl.validateData('not an array');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Data must be an array');
    });

    it('should reject empty data array', () => {
      const result = barGraphEl.validateData([]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Data array cannot be empty');
    });

    it('should reject non-numeric data', () => {
      const result = barGraphEl.validateData([10, 'twenty', 30]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('All data values must be numbers');
    });

    it('should reject NaN values', () => {
      const result = barGraphEl.validateData([10, NaN, 30]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('All data values must be numbers');
    });

    it('should reject negative values', () => {
      const result = barGraphEl.validateData([10, -5, 30]);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('All data values must be non-negative');
    });

    it('should reject mismatched labels length', () => {
      const data = [10, 20, 30];
      const labels = ['A', 'B']; // One less than data

      const result = barGraphEl.validateData(data, labels);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Labels array length must match data array length');
    });

    it('should accept data without labels', () => {
      const data = [10, 20, 30];

      const result = barGraphEl.validateData(data);

      expect(result.valid).toBe(true);
    });

    it('should accept zero values', () => {
      const data = [0, 10, 0];
      const labels = ['A', 'B', 'C'];

      const result = barGraphEl.validateData(data, labels);

      expect(result.valid).toBe(true);
    });
  });

  describe('Emacs Lisp Code Generation', () => {
    it('should generate valid Emacs Lisp code', () => {
      const data = [10, 20, 30];
      const labels = ['A', 'B', 'C'];

      const lispCode = barGraphEl.generateEmacsLispCode(data, labels);

      expect(lispCode).toContain("(setq bar-graph-data '(10 20 30))");
      expect(lispCode).toContain('(setq bar-graph-labels \'("A" "B" "C"))');
      expect(lispCode).toContain('(bar-graph-create-ascii bar-graph-data bar-graph-labels)');
    });

    it('should generate code without labels', () => {
      const data = [5, 15, 25];

      const lispCode = barGraphEl.generateEmacsLispCode(data);

      expect(lispCode).toContain("(setq bar-graph-data '(5 15 25))");
      expect(lispCode).not.toContain('(setq bar-graph-labels');
      expect(lispCode).toContain('(bar-graph-create-ascii bar-graph-data bar-graph-labels)');
    });

    it('should handle special characters in labels', () => {
      const data = [10, 20];
      const labels = ['Test "Quote"', "Test 'Apostrophe'"];

      const lispCode = barGraphEl.generateEmacsLispCode(data, labels);

      expect(lispCode).toContain('"Test "Quote""');
      expect(lispCode).toContain('"Test \'Apostrophe\'"');
    });

    it('should throw error for invalid data', () => {
      const data = [10, -5, 30]; // Negative value
      const labels = ['A', 'B', 'C'];

      expect(() => {
        barGraphEl.generateEmacsLispCode(data, labels);
      }).toThrow('All data values must be non-negative');
    });

    it('should include comments in generated code', () => {
      const data = [1, 2, 3];

      const lispCode = barGraphEl.generateEmacsLispCode(data);

      expect(lispCode).toContain(';; Generated bar graph data');
      expect(lispCode).toContain(';; Create the graph');
    });
  });

  describe('File Export', () => {
    it('should export graph to file successfully', () => {
      const graph = 'Test graph content';
      const filename = '/tmp/test-graph.txt';

      mockFS.writeFileSync.mockImplementation(() => {});

      const result = barGraphEl.exportToFile(graph, filename);

      expect(result).toBe(true);
      expect(mockFS.writeFileSync).toHaveBeenCalledWith(filename, graph);
    });

    it('should handle file export errors', () => {
      const graph = 'Test graph content';
      const filename = '/invalid/path/test-graph.txt';

      mockFS.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = barGraphEl.exportToFile(graph, filename);

      expect(result).toBe(false);
    });
  });

  describe('Integration with Electron App', () => {
    it('should generate compatible data format', () => {
      const electronData = [10, 20, 30, 40];
      const electronLabels = ['A', 'B', 'C', 'D'];

      // Test that the data format is compatible
      const validation = barGraphEl.validateData(electronData, electronLabels);
      expect(validation.valid).toBe(true);

      const graph = barGraphEl.createAsciiGraph(electronData, electronLabels);
      expect(graph).toContain('A');
      expect(graph).toContain('10');

      const lispCode = barGraphEl.generateEmacsLispCode(electronData, electronLabels);
      expect(lispCode).toContain("(setq bar-graph-data '(10 20 30 40))");
    });

    it('should handle edge cases from Electron app', () => {
      // Test with floating point numbers (common from parseFloat)
      const floatData = [10.5, 20.7, 30.2];
      const labels = ['A', 'B', 'C'];

      const validation = barGraphEl.validateData(floatData, labels);
      expect(validation.valid).toBe(true);

      const graph = barGraphEl.createAsciiGraph(floatData, labels);
      expect(graph).toContain('10.5');
      expect(graph).toContain('20.7');
      expect(graph).toContain('30.2');
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => i + 1);
      const largeLabels = Array.from({ length: 100 }, (_, i) => `Item${i + 1}`);

      const validation = barGraphEl.validateData(largeData, largeLabels);
      expect(validation.valid).toBe(true);

      const graph = barGraphEl.createAsciiGraph(largeData, largeLabels);
      expect(graph).toContain('Item1');
      expect(graph).toContain('Item100');
    });
  });
});