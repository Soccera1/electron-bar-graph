/**
 * Tests for utility functions and edge cases
 */

describe('Utility Functions', () => {
  describe('Input Validation', () => {
    test('should validate numeric input', () => {
      const validateNumericInput = (input) => {
        const values = input.split(',').map(x => x.trim());
        const validValues = values
          .map(x => parseFloat(x))
          .filter(val => !isNaN(val));
        
        return {
          isValid: validValues.length === values.length,
          validCount: validValues.length,
          totalCount: values.length
        };
      };

      expect(validateNumericInput('10,20,30')).toEqual({
        isValid: true,
        validCount: 3,
        totalCount: 3
      });

      expect(validateNumericInput('10,abc,30')).toEqual({
        isValid: false,
        validCount: 2,
        totalCount: 3
      });

      expect(validateNumericInput('10,20.5,30.7')).toEqual({
        isValid: true,
        validCount: 3,
        totalCount: 3
      });
    });

    test('should handle empty input gracefully', () => {
      const validateNumericInput = (input) => {
        if (!input || input.trim() === '') {
          return { isValid: false, validCount: 0, totalCount: 0 };
        }
        
        const values = input.split(',').map(x => x.trim());
        const validValues = values
          .map(x => parseFloat(x))
          .filter(val => !isNaN(val));
        
        return {
          isValid: validValues.length === values.length,
          validCount: validValues.length,
          totalCount: values.length
        };
      };

      expect(validateNumericInput('')).toEqual({
        isValid: false,
        validCount: 0,
        totalCount: 0
      });

      expect(validateNumericInput('   ')).toEqual({
        isValid: false,
        validCount: 0,
        totalCount: 0
      });

      expect(validateNumericInput(null)).toEqual({
        isValid: false,
        validCount: 0,
        totalCount: 0
      });

      expect(validateNumericInput(undefined)).toEqual({
        isValid: false,
        validCount: 0,
        totalCount: 0
      });
    });

    test('should handle whitespace in input', () => {
      const parseInput = (input) => {
        return input
          .split(',')
          .map(x => x.trim())
          .filter(x => x.length > 0);
      };

      expect(parseInput(' 10 , 20 , 30 ')).toEqual(['10', '20', '30']);
      expect(parseInput('10, 20, 30')).toEqual(['10', '20', '30']);
      expect(parseInput('10,20,30')).toEqual(['10', '20', '30']);
    });
  });

  describe('Color Utility Functions', () => {
    test('should convert hex to RGB correctly', () => {
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      };

      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('invalid')).toBeNull();
    });

    test('should generate HSL colors correctly', () => {
      const generateHSLColor = (hue, saturation, lightness) => {
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      };

      expect(generateHSLColor(0, 100, 50)).toBe('hsl(0, 100%, 50%)');
      expect(generateHSLColor(120, 50, 75)).toBe('hsl(120, 50%, 75%)');
      expect(generateHSLColor(240, 25, 25)).toBe('hsl(240, 25%, 25%)');
    });

    test('should interpolate colors correctly', () => {
      const interpolateColor = (color1, color2, ratio) => {
        const c1 = { r: 255, g: 0, b: 0 }; // Red
        const c2 = { r: 0, g: 0, b: 255 }; // Blue
        
        const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
        const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
        const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
      };

      expect(interpolateColor('#ff0000', '#0000ff', 0)).toBe('rgb(255, 0, 0)');
      expect(interpolateColor('#ff0000', '#0000ff', 1)).toBe('rgb(0, 0, 255)');
      expect(interpolateColor('#ff0000', '#0000ff', 0.5)).toBe('rgb(128, 0, 128)');
    });
  });

  describe('Data Processing Utilities', () => {
    test('should normalize data values', () => {
      const normalizeData = (values, min = 0, max = 100) => {
        const dataMin = Math.min(...values);
        const dataMax = Math.max(...values);
        const range = dataMax - dataMin;
        
        if (range === 0) return values.map(() => (min + max) / 2);
        
        return values.map(val => 
          min + (val - dataMin) * (max - min) / range
        );
      };

      expect(normalizeData([10, 20, 30])).toEqual([0, 50, 100]);
      expect(normalizeData([5, 5, 5])).toEqual([50, 50, 50]);
      expect(normalizeData([0, 50, 100])).toEqual([0, 50, 100]);
    });

    test('should calculate statistics', () => {
      const calculateStats = (values) => {
        const sum = values.reduce((acc, val) => acc + val, 0);
        const mean = sum / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return { sum, mean, median, variance, stdDev };
      };

      const stats = calculateStats([1, 2, 3, 4, 5]);
      expect(stats.sum).toBe(15);
      expect(stats.mean).toBe(3);
      expect(stats.median).toBe(3);
      expect(stats.variance).toBe(2);
      expect(stats.stdDev).toBeCloseTo(1.414, 2);
    });

    test('should handle edge cases in data processing', () => {
      const processData = (values) => {
        return values
          .map(val => parseFloat(val))
          .filter(val => !isNaN(val))
          .map(val => Math.max(0, val))
          .filter(val => isFinite(val));
      };

      expect(processData([10, 20, 30])).toEqual([10, 20, 30]);
      expect(processData([10, -5, 30])).toEqual([10, 0, 30]);
      expect(processData([10, Infinity, 30])).toEqual([10, 30]);
      expect(processData([10, -Infinity, 30])).toEqual([10, 0, 30]);
      expect(processData([10, NaN, 30])).toEqual([10, 30]);
      expect(processData([])).toEqual([]);
    });
  });

  describe('String Utilities', () => {
    test('should sanitize labels', () => {
      const sanitizeLabel = (label) => {
        return label
          .trim()
          .replace(/[<>]/g, '') // Remove potential HTML tags
          .substring(0, 50); // Limit length
      };

      expect(sanitizeLabel('  Normal Label  ')).toBe('Normal Label');
      expect(sanitizeLabel('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeLabel('A'.repeat(100))).toBe('A'.repeat(50));
      expect(sanitizeLabel('')).toBe('');
    });

    test('should format numbers for display', () => {
      const formatNumber = (num, decimals = 1) => {
        if (isNaN(num) || !isFinite(num)) return '0';
        return num.toFixed(decimals);
      };

      expect(formatNumber(10.1234)).toBe('10.1');
      expect(formatNumber(10.1234, 2)).toBe('10.12');
      expect(formatNumber(0)).toBe('0.0');
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(Infinity)).toBe('0');
    });

    test('should truncate long labels', () => {
      const truncateLabel = (label, maxLength = 20) => {
        if (label.length <= maxLength) return label;
        return label.substring(0, maxLength - 3) + '...';
      };

      expect(truncateLabel('Short label')).toBe('Short label');
      expect(truncateLabel('This is a very long label that should be truncated')).toBe('This is a very lo...');
      expect(truncateLabel('A'.repeat(50))).toBe('A'.repeat(17) + '...');
    });
  });

  describe('Error Handling Utilities', () => {
    test('should create user-friendly error messages', () => {
      const createErrorMessage = (error) => {
        if (error.message.includes('Number of values must match')) {
          return 'Please ensure the number of values matches the number of labels.';
        }
        if (error.message.includes('Invalid input')) {
          return 'Please enter valid numbers separated by commas.';
        }
        if (error.message.includes('Emacs')) {
          return 'Emacs integration is not available. Please install Emacs.';
        }
        return 'An unexpected error occurred. Please try again.';
      };

      expect(createErrorMessage(new Error('Number of values must match'))).toBe(
        'Please ensure the number of values matches the number of labels.'
      );
      expect(createErrorMessage(new Error('Invalid input data'))).toBe(
        'Please enter valid numbers separated by commas.'
      );
      expect(createErrorMessage(new Error('Emacs not found'))).toBe(
        'Emacs integration is not available. Please install Emacs.'
      );
      expect(createErrorMessage(new Error('Unknown error'))).toBe(
        'An unexpected error occurred. Please try again.'
      );
    });

    test('should validate error conditions', () => {
      const validateInput = (values, labels) => {
        const errors = [];
        
        if (!values || values.trim() === '') {
          errors.push('Values cannot be empty');
        }
        
        if (!labels || labels.trim() === '') {
          errors.push('Labels cannot be empty');
        }
        
        const valueArray = values.split(',').map(x => x.trim());
        const labelArray = labels.split(',').map(x => x.trim());
        
        if (valueArray.length !== labelArray.length) {
          errors.push('Number of values must match number of labels');
        }
        
        const validValues = valueArray
          .map(x => parseFloat(x))
          .filter(val => !isNaN(val));
        
        if (validValues.length !== valueArray.length) {
          errors.push('All values must be valid numbers');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };

      expect(validateInput('10,20,30', 'A,B,C')).toEqual({
        isValid: true,
        errors: []
      });

      expect(validateInput('10,20', 'A,B,C')).toEqual({
        isValid: false,
        errors: ['Number of values must match number of labels']
      });

      expect(validateInput('10,abc,30', 'A,B,C')).toEqual({
        isValid: false,
        errors: ['All values must be valid numbers']
      });

      expect(validateInput('', 'A,B,C')).toEqual({
        isValid: false,
        errors: ['Values cannot be empty', 'Number of values must match number of labels', 'All values must be valid numbers']
      });
    });
  });

  describe('Configuration Utilities', () => {
    test('should parse configuration values', () => {
      const parseConfigValue = (content, key) => {
        const match = content.match(new RegExp(`#define ${key}\\s+(\\d+)`));
        return match ? match[1] === '1' : false;
      };

      const configContent = '#define EMACS_INTEGRATION 1\n#define DEBUG 0\n#define VERBOSE 1';
      
      expect(parseConfigValue(configContent, 'EMACS_INTEGRATION')).toBe(true);
      expect(parseConfigValue(configContent, 'DEBUG')).toBe(false);
      expect(parseConfigValue(configContent, 'VERBOSE')).toBe(true);
      expect(parseConfigValue(configContent, 'UNKNOWN')).toBe(false);
    });

    test('should handle missing configuration gracefully', () => {
      const getConfigValue = (content, key, defaultValue = false) => {
        if (!content) return defaultValue;
        
        const match = content.match(new RegExp(`#define ${key}\\s+(\\d+)`));
        return match ? match[1] === '1' : defaultValue;
      };

      expect(getConfigValue(null, 'EMACS_INTEGRATION')).toBe(false);
      expect(getConfigValue('', 'EMACS_INTEGRATION')).toBe(false);
      expect(getConfigValue('invalid content', 'EMACS_INTEGRATION')).toBe(false);
      expect(getConfigValue('invalid content', 'EMACS_INTEGRATION', true)).toBe(true);
    });
  });
});
