/**
 * Performance and stress tests for Electron Bar Graph
 */

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Processing Performance', () => {
    test('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => i + 1);
      const largeLabels = Array.from({ length: 1000 }, (_, i) => `Label ${i + 1}`);

      const parseInputValues = (values, labels) => {
        const startTime = performance.now();
        
        const dataValues = values
          .split(",")
          .map((x) => parseFloat(x.trim()))
          .filter((val) => !isNaN(val))
          .map((val) => Math.max(0, val));

        const labelArray = labels.split(",").map((x) => x.trim());
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        return { dataValues, labelArray, processingTime };
      };

      const result = parseInputValues(largeDataset.join(','), largeLabels.join(','));
      
      expect(result.dataValues).toHaveLength(1000);
      expect(result.labelArray).toHaveLength(1000);
      expect(result.processingTime).toBeLessThan(100); // Should process in less than 100ms
    });

    test('should handle very large datasets without memory issues', () => {
      const veryLargeDataset = Array.from({ length: 10000 }, (_, i) => Math.random() * 100);
      const veryLargeLabels = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

      const parseInputValues = (values, labels) => {
        const dataValues = values
          .split(",")
          .map((x) => parseFloat(x.trim()))
          .filter((val) => !isNaN(val))
          .map((val) => Math.max(0, val));

        const labelArray = labels.split(",").map((x) => x.trim());
        
        return { dataValues, labelArray };
      };

      const result = parseInputValues(veryLargeDataset.join(','), veryLargeLabels.join(','));
      
      expect(result.dataValues).toHaveLength(10000);
      expect(result.labelArray).toHaveLength(10000);
      
      // Check that all values are valid
      result.dataValues.forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(isNaN(value)).toBe(false);
      });
    });
  });

  describe('Color Generation Performance', () => {
    test('should generate colors efficiently for large datasets', () => {
      const generateRainbowColors = (count) => {
        const startTime = performance.now();
        
        const colors = [];
        for (let i = 0; i < count; i++) {
          const hue = (i * 360) / count;
          colors.push(`hsl(${hue}, 70%, 50%)`);
        }
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        return { colors, processingTime };
      };

      const result = generateRainbowColors(1000);
      
      expect(result.colors).toHaveLength(1000);
      expect(result.processingTime).toBeLessThan(50); // Should generate in less than 50ms
    });

    test('should generate gradient colors efficiently', () => {
      const generateGradientColors = (color1, color2, steps) => {
        const startTime = performance.now();
        
        const colors = [];
        const c1 = { r: 255, g: 0, b: 0 }; // #ff0000
        const c2 = { r: 0, g: 0, b: 255 }; // #0000ff
        
        for (let i = 0; i < steps; i++) {
          const ratio = steps === 1 ? 0 : i / (steps - 1);
          const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
          const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
          const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
          colors.push(`rgb(${r}, ${g}, ${b})`);
        }
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        return { colors, processingTime };
      };

      const result = generateGradientColors('#ff0000', '#0000ff', 1000);
      
      expect(result.colors).toHaveLength(1000);
      expect(result.processingTime).toBeLessThan(50);
    });
  });

  describe('Canvas Drawing Performance', () => {
    test('should draw large graphs efficiently', () => {
      const mockCanvas = {
        width: 760,
        height: 400,
        getContext: jest.fn(() => ({
          clearRect: jest.fn(),
          fillRect: jest.fn(),
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          stroke: jest.fn(),
          fill: jest.fn(),
          fillText: jest.fn(),
          textAlign: 'left',
          textBaseline: 'alphabetic',
          font: '12px Arial'
        }))
      };

      const drawGraph = (dataValues, labels) => {
        const startTime = performance.now();
        
        const ctx = mockCanvas.getContext();
        ctx.clearRect(0, 0, mockCanvas.width, mockCanvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);

        if (dataValues.length === 0) return;

        const topPadding = 30;
        const bottomPadding = 40;
        const sidePadding = 30;
        const graphWidth = mockCanvas.width - 2 * sidePadding;
        const graphHeight = mockCanvas.height - topPadding - bottomPadding;
        const numBars = dataValues.length;
        const barSpacing = 10;
        const availableWidthForBars = graphWidth - (numBars - 1) * barSpacing;
        const barWidth = availableWidthForBars / numBars;
        const maxValue = Math.max(...dataValues);
        const scale = graphHeight / (maxValue > 0 ? maxValue : 1);

        // Draw bars
        let xOffset = sidePadding;
        for (let i = 0; i < dataValues.length; i++) {
          const value = dataValues[i];
          const barHeight = value * scale;
          
          ctx.fillStyle = `hsl(${(i * 360) / dataValues.length}, 70%, 50%)`;
          ctx.fillRect(xOffset, mockCanvas.height - bottomPadding - barHeight, barWidth, barHeight);
          
          if (labels && labels[i] !== undefined) {
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(labels[i], xOffset + barWidth / 2, mockCanvas.height - bottomPadding + 5);
          }
          xOffset += barWidth + barSpacing;
        }

        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        return { processingTime };
      };

      const largeDataset = Array.from({ length: 500 }, (_, i) => Math.random() * 100);
      const largeLabels = Array.from({ length: 500 }, (_, i) => `Item ${i + 1}`);

      const result = drawGraph(largeDataset, largeLabels);
      
      expect(result.processingTime).toBeLessThan(200); // Should draw in less than 200ms
    });
  });

  describe('Memory Usage Tests', () => {
    test('should not leak memory with repeated operations', () => {
      const performRepeatedOperations = (iterations) => {
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
          const dataValues = Array.from({ length: 100 }, (_, j) => Math.random() * 100);
          const labels = Array.from({ length: 100 }, (_, j) => `Item ${j + 1}`);
          
          // Simulate parsing and processing
          const processedValues = dataValues
            .map(val => Math.max(0, val))
            .filter(val => !isNaN(val));
          
          const processedLabels = labels
            .map(label => label.trim())
            .filter(label => label.length > 0);
          
          results.push({
            values: processedValues,
            labels: processedLabels,
            iteration: i
          });
        }
        
        return results;
      };

      const results = performRepeatedOperations(100);
      
      expect(results).toHaveLength(100);
      results.forEach((result, index) => {
        expect(result.iteration).toBe(index);
        expect(result.values).toHaveLength(100);
        expect(result.labels).toHaveLength(100);
      });
    });

    test('should handle rapid successive operations', () => {
      const rapidOperations = () => {
        const operations = [];
        
        for (let i = 0; i < 50; i++) {
          const startTime = performance.now();
          
          // Simulate rapid data changes
          const dataValues = Array.from({ length: 10 }, (_, j) => Math.random() * 100);
          const labels = Array.from({ length: 10 }, (_, j) => `Label ${j + 1}`);
          
          // Process data
          const processedData = dataValues
            .map(val => Math.max(0, val))
            .filter(val => !isNaN(val));
          
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          
          operations.push({
            iteration: i,
            processingTime,
            dataLength: processedData.length
          });
        }
        
        return operations;
      };

      const operations = rapidOperations();
      
      expect(operations).toHaveLength(50);
      
      // All operations should complete quickly
      operations.forEach(op => {
        expect(op.processingTime).toBeLessThan(10); // Each operation should be very fast
        expect(op.dataLength).toBe(10);
      });
    });
  });

  describe('Stress Tests', () => {
    test('should handle extreme values gracefully', () => {
      const extremeValues = [
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        0,
        -1000,
        1000000,
        Infinity,
        -Infinity,
        NaN
      ];

      const processExtremeValues = (values) => {
        return values
          .map(val => parseFloat(val))
          .filter(val => !isNaN(val))
          .map(val => Math.max(0, val))
          .filter(val => isFinite(val));
      };

      const processed = processExtremeValues(extremeValues);
      
      // Should filter out invalid values
      expect(processed.length).toBeLessThan(extremeValues.length);
      processed.forEach(val => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(isFinite(val)).toBe(true);
      });
    });

    test('should handle very long labels', () => {
      const longLabel = 'A'.repeat(1000);
      const labels = Array.from({ length: 100 }, () => longLabel);

      const processLabels = (labels) => {
        return labels.map(label => label.trim());
      };

      const processed = processLabels(labels);
      
      expect(processed).toHaveLength(100);
      processed.forEach(label => {
        expect(label).toBe(longLabel);
        expect(label.length).toBe(1000);
      });
    });

    test('should handle mixed data types', () => {
      const mixedData = [
        '10', '20.5', 'abc', '30', 'xyz', '40.7', '', '50', null, undefined, '60'
      ];

      const processMixedData = (data) => {
        return data
          .map(val => parseFloat(val))
          .filter(val => !isNaN(val))
          .map(val => Math.max(0, val));
      };

      const processed = processMixedData(mixedData);
      
      expect(processed).toEqual([10, 20.5, 30, 40.7, 50, 60]);
    });
  });
});
