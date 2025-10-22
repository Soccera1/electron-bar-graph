/*
 * Electron Bar Graph - SVG Export Tests
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { createMockDOM } from './test-utils.js';

describe('SVG Export', () => {
  let dom, document;
  let svgExporter;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ window: global.window, document } = createMockDOM());
    global.document = document;
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:mock-url'),
      revokeObjectURL: jest.fn()
    };
    global.Blob = jest.fn();

    // Mock document.body methods
    if (!document.body) {
      document.body = document.createElement('body');
    }
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    svgExporter = {
      exportSVG: (dataValues, labels, colors = null) => {
        if (dataValues.length === 0) return;

        const svgWidth = 760;
        const svgHeight = 400;
        const topPadding = 30;
        const bottomPadding = 40;
        const sidePadding = 30;
        const graphWidth = svgWidth - 2 * sidePadding;
        const graphHeight = svgHeight - topPadding - bottomPadding;

        const numBars = dataValues.length;
        const barSpacing = 10;
        const availableWidthForBars = graphWidth - (numBars - 1) * barSpacing;
        const barWidth = availableWidthForBars / numBars;
        const maxValue = Math.max(...dataValues);
        const scale = graphHeight / (maxValue > 0 ? maxValue : 1);

        const barColors = colors || Array(dataValues.length).fill('#3498db');

        let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Background
        svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="white"/>`;
        
        // Bars
        let xOffset = sidePadding;
        for (let i = 0; i < dataValues.length; i++) {
          const value = dataValues[i];
          const barHeight = value * scale;
          const y = svgHeight - bottomPadding - barHeight;
          
          svgContent += `<rect x="${xOffset}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${barColors[i]}"/>`;
          
          // Labels
          if (labels && labels[i] !== undefined) {
            const textX = xOffset + barWidth / 2;
            const textY = svgHeight - bottomPadding + 20;
            svgContent += `<text x="${textX}" y="${textY}" text-anchor="middle" font-family="Arial" font-size="12" fill="black">${labels[i]}</text>`;
          }
          
          xOffset += barWidth + barSpacing;
        }
        
        // Axes
        svgContent += `<line x1="${sidePadding}" y1="${svgHeight - bottomPadding}" x2="${svgWidth - sidePadding}" y2="${svgHeight - bottomPadding}" stroke="black" stroke-width="2"/>`;
        svgContent += `<line x1="${sidePadding}" y1="${topPadding}" x2="${sidePadding}" y2="${svgHeight - bottomPadding}" stroke="black" stroke-width="2"/>`;
        
        // Y-axis labels
        svgContent += `<text x="${sidePadding - 10}" y="${topPadding}" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="black">${maxValue.toFixed(1)}</text>`;
        svgContent += `<text x="${sidePadding - 10}" y="${svgHeight - bottomPadding}" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="black">0</text>`;
        
        svgContent += '</svg>';
        
        // Create download
        const blob = new global.Blob([svgContent], { type: 'image/svg+xml' });
        const url = global.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'bar-graph.svg';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        global.URL.revokeObjectURL(url);
        
        return svgContent;
      }
    };
  });

  describe('SVG Generation', () => {
    it('should generate valid SVG content', () => {
      const dataValues = [10, 20, 30];
      const labels = ['A', 'B', 'C'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      expect(svgContent).toContain('<svg width="760" height="400"');
      expect(svgContent).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svgContent).toContain('</svg>');
    });

    it('should include background rectangle', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      expect(svgContent).toContain('<rect width="760" height="400" fill="white"/>');
    });

    it('should create bars with correct dimensions', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      // Should contain rect elements for bars
      expect(svgContent).toMatch(/<rect x="\d+" y="\d+" width="[\d.]+" height="[\d.]+" fill="#3498db"\/>/);
    });

    it('should include axis lines', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      // X-axis
      expect(svgContent).toContain('<line x1="30" y1="360" x2="730" y2="360" stroke="black" stroke-width="2"/>');
      // Y-axis
      expect(svgContent).toContain('<line x1="30" y1="30" x2="30" y2="360" stroke="black" stroke-width="2"/>');
    });

    it('should include labels', () => {
      const dataValues = [10, 20];
      const labels = ['Label A', 'Label B'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      expect(svgContent).toContain('Label A');
      expect(svgContent).toContain('Label B');
    });

    it('should include Y-axis value labels', () => {
      const dataValues = [10, 20, 30];
      const labels = ['A', 'B', 'C'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      expect(svgContent).toContain('30.0'); // Max value
      expect(svgContent).toContain('>0<'); // Min value
    });

    it('should handle custom colors', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      const colors = ['#ff0000', '#00ff00'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels, colors);
      
      expect(svgContent).toContain('fill="#ff0000"');
      expect(svgContent).toContain('fill="#00ff00"');
    });

    it('should handle empty data gracefully', () => {
      const result = svgExporter.exportSVG([], []);
      
      expect(result).toBeUndefined();
    });

    it('should handle single data point', () => {
      const dataValues = [42];
      const labels = ['Single'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      expect(svgContent).toContain('Single');
      expect(svgContent).toContain('42.0');
    });

    it('should calculate bar positions correctly', () => {
      const dataValues = [10, 20, 30];
      const labels = ['A', 'B', 'C'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      // With 3 bars, spacing of 10, and total width of 700 (760-60 for padding)
      // Available width for bars: 700 - 2*10 = 680
      // Bar width: 680/3 ≈ 226.67
      
      // First bar should start at x=30 (sidePadding)
      expect(svgContent).toMatch(/x="30"/);
    });
  });

  describe('SVG Download', () => {
    it('should create blob with correct MIME type', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      
      svgExporter.exportSVG(dataValues, labels);
      
      expect(global.Blob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'image/svg+xml' }
      );
    });

    it('should create download link with correct filename', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      
      const mockLink = {
        download: '',
        href: '',
        click: jest.fn()
      };
      
      document.createElement = jest.fn(() => mockLink);
      
      svgExporter.exportSVG(dataValues, labels);
      
      expect(mockLink.download).toBe('bar-graph.svg');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should clean up blob URL after download', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      
      svgExporter.exportSVG(dataValues, labels);
      
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should append and remove link from DOM', () => {
      const dataValues = [10, 20];
      const labels = ['A', 'B'];
      
      const mockLink = {
        download: '',
        href: '',
        click: jest.fn()
      };
      
      document.createElement = jest.fn(() => mockLink);
      
      svgExporter.exportSVG(dataValues, labels);
      
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });
  });

  describe('SVG Scaling', () => {
    it('should scale bars proportionally to max value', () => {
      const dataValues = [10, 50, 25]; // Max is 50
      const labels = ['A', 'B', 'C'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      // Graph height is 330 (400 - 30 - 40)
      // Scale factor: 330 / 50 = 6.6
      // Bar heights should be: 10*6.6=66, 50*6.6=330, 25*6.6=165
      
      expect(svgContent).toContain('height="66"');
      expect(svgContent).toContain('height="330"');
      expect(svgContent).toContain('height="165"');
    });

    it('should handle zero values', () => {
      const dataValues = [0, 10, 0];
      const labels = ['A', 'B', 'C'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      expect(svgContent).toContain('height="0"');
    });

    it('should handle all zero values', () => {
      const dataValues = [0, 0, 0];
      const labels = ['A', 'B', 'C'];
      
      const svgContent = svgExporter.exportSVG(dataValues, labels);
      
      // Should not crash and should contain bars with height 0
      expect(svgContent).toContain('height="0"');
      expect(svgContent).toContain('0.0'); // Max value label
    });
  });
});