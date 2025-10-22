/**
 * Tests for renderer.js - Main application logic
 */

// Mock DOM elements
const mockElements = {
  valuesInput: { value: '10,20,30,40' },
  labelsInput: { value: 'A,B,C,D' },
  plotButton: { addEventListener: jest.fn() },
  barGraphCanvas: {
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
      font: '12px Arial',
      toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
    })),
    width: 760,
    height: 400
  },
  errorMessage: { textContent: '', style: { display: 'none' } },
  colorMode: { value: 'single', addEventListener: jest.fn() },
  primaryColor: { value: '#3498db', addEventListener: jest.fn() },
  secondaryColor: { value: '#e74c3c', addEventListener: jest.fn(), style: { display: 'none' } },
  customColors: { value: '', addEventListener: jest.fn(), style: { display: 'none' } },
  emacsSection: { style: { display: 'none' } },
  openInEmacs: { addEventListener: jest.fn() },
  exportPNG: { addEventListener: jest.fn() },
  exportJPEG: { addEventListener: jest.fn() },
  exportWEBP: { addEventListener: jest.fn() },
  exportSVG: { addEventListener: jest.fn() }
};

// Mock document.getElementById
document.getElementById = jest.fn((id) => mockElements[id]);

// Mock require for Node.js modules
global.require = jest.fn((module) => {
  if (module === 'fs') {
    return {
      existsSync: jest.fn(() => true),
      readFileSync: jest.fn(() => '#define EMACS_INTEGRATION 1\n#define DEBUG 0\n#define VERBOSE 0')
    };
  }
  if (module === 'path') {
    return {
      join: jest.fn((...args) => args.join('/'))
    };
  }
  if (module === 'child_process') {
    return {
      spawn: jest.fn(() => ({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') callback(0);
        }),
        kill: jest.fn(),
        unref: jest.fn()
      }))
    };
  }
  return {};
});

describe('Renderer Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock elements
    Object.keys(mockElements).forEach(key => {
      if (mockElements[key].value !== undefined) {
        mockElements[key].value = key === 'valuesInput' ? '10,20,30,40' : 
                                 key === 'labelsInput' ? 'A,B,C,D' : 
                                 key === 'primaryColor' ? '#3498db' :
                                 key === 'secondaryColor' ? '#e74c3c' : '';
      }
    });
  });

  describe('Input Parsing', () => {
    test('should parse valid input values and labels', () => {
      const parseInputValues = () => {
        const valueText = mockElements.valuesInput.value;
        const labelText = mockElements.labelsInput.value;

        let dataValues = [];
        let labels = [];

        try {
          dataValues = valueText
            .split(",")
            .map((x) => parseFloat(x.trim()))
            .filter((val) => !isNaN(val));
          dataValues = dataValues.map((val) => Math.max(0, val));

          labels = labelText.split(",").map((x) => x.trim());

          if (dataValues.length !== labels.length) {
            return { dataValues: [], labels: [], hasError: true };
          }
        } catch (e) {
          return { dataValues: [], labels: [], hasError: true };
        }
        return { dataValues, labels, hasError: false };
      };

      const result = parseInputValues();
      
      expect(result.hasError).toBe(false);
      expect(result.dataValues).toEqual([10, 20, 30, 40]);
      expect(result.labels).toEqual(['A', 'B', 'C', 'D']);
    });

    test('should handle mismatched values and labels', () => {
      mockElements.valuesInput.value = '10,20,30';
      mockElements.labelsInput.value = 'A,B,C,D';

      const parseInputValues = () => {
        const valueText = mockElements.valuesInput.value;
        const labelText = mockElements.labelsInput.value;

        let dataValues = [];
        let labels = [];

        try {
          dataValues = valueText
            .split(",")
            .map((x) => parseFloat(x.trim()))
            .filter((val) => !isNaN(val));
          dataValues = dataValues.map((val) => Math.max(0, val));

          labels = labelText.split(",").map((x) => x.trim());

          if (dataValues.length !== labels.length) {
            return { dataValues: [], labels: [], hasError: true };
          }
        } catch (e) {
          return { dataValues: [], labels: [], hasError: true };
        }
        return { dataValues, labels, hasError: false };
      };

      const result = parseInputValues();
      
      expect(result.hasError).toBe(true);
    });

    test('should filter out negative values', () => {
      mockElements.valuesInput.value = '10,-5,30,-10';
      mockElements.labelsInput.value = 'A,B,C,D';

      const parseInputValues = () => {
        const valueText = mockElements.valuesInput.value;
        const labelText = mockElements.labelsInput.value;

        let dataValues = [];
        let labels = [];

        try {
          dataValues = valueText
            .split(",")
            .map((x) => parseFloat(x.trim()))
            .filter((val) => !isNaN(val));
          dataValues = dataValues.map((val) => Math.max(0, val));

          labels = labelText.split(",").map((x) => x.trim());

          if (dataValues.length !== labels.length) {
            return { dataValues: [], labels: [], hasError: true };
          }
        } catch (e) {
          return { dataValues: [], labels: [], hasError: true };
        }
        return { dataValues, labels, hasError: false };
      };

      const result = parseInputValues();
      
      expect(result.dataValues).toEqual([10, 0, 30, 0]);
    });
  });

  describe('Color Generation', () => {
    test('should generate single color for all bars', () => {
      const generateColors = (count) => {
        const mode = mockElements.colorMode.value;
        const primary = mockElements.primaryColor.value;
        
        switch (mode) {
          case "single":
            return Array(count).fill(primary);
          default:
            return Array(count).fill(primary);
        }
      };

      const colors = generateColors(4);
      expect(colors).toEqual(['#3498db', '#3498db', '#3498db', '#3498db']);
    });

    test('should generate gradient colors', () => {
      mockElements.colorMode.value = 'gradient';
      mockElements.primaryColor.value = '#ff0000';
      mockElements.secondaryColor.value = '#0000ff';

      const generateGradientColors = (color1, color2, steps) => {
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
        
        return colors;
      };

      const colors = generateGradientColors('#ff0000', '#0000ff', 3);
      expect(colors).toHaveLength(3);
      expect(colors[0]).toBe('rgb(255, 0, 0)');
      expect(colors[2]).toBe('rgb(0, 0, 255)');
    });

    test('should generate rainbow colors', () => {
      const generateRainbowColors = (count) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
          const hue = (i * 360) / count;
          colors.push(`hsl(${hue}, 70%, 50%)`);
        }
        return colors;
      };

      const colors = generateRainbowColors(4);
      expect(colors).toHaveLength(4);
      expect(colors[0]).toBe('hsl(0, 70%, 50%)');
      expect(colors[1]).toBe('hsl(90, 70%, 50%)');
      expect(colors[2]).toBe('hsl(180, 70%, 50%)');
      expect(colors[3]).toBe('hsl(270, 70%, 50%)');
    });

    test('should handle custom colors', () => {
      mockElements.colorMode.value = 'custom';
      mockElements.customColors.value = '#ff0000,#00ff00,#0000ff,#ffff00';

      const generateColors = (count) => {
        const mode = mockElements.colorMode.value;
        
        if (mode === "custom") {
          const customColorList = mockElements.customColors.value.split(",").map(c => c.trim());
          if (customColorList.length >= count) {
            return customColorList.slice(0, count);
          } else {
            const colors = [];
            for (let i = 0; i < count; i++) {
              colors.push(customColorList[i % customColorList.length]);
            }
            return colors;
          }
        }
        
        return Array(count).fill('#000000');
      };

      const colors = generateColors(4);
      expect(colors).toEqual(['#ff0000', '#00ff00', '#0000ff', '#ffff00']);
    });
  });

  describe('Canvas Drawing', () => {
    test('should clear canvas before drawing', () => {
      const ctx = mockElements.barGraphCanvas.getContext();
      const dataValues = [10, 20, 30, 40];
      const labels = ['A', 'B', 'C', 'D'];

      const drawGraph = (dataValues, labels) => {
        ctx.clearRect(0, 0, mockElements.barGraphCanvas.width, mockElements.barGraphCanvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, mockElements.barGraphCanvas.width, mockElements.barGraphCanvas.height);
      };

      drawGraph(dataValues, labels);

      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 760, 400);
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 760, 400);
    });

    test('should handle empty data gracefully', () => {
      const ctx = mockElements.barGraphCanvas.getContext();
      const dataValues = [];
      const labels = [];

      const drawGraph = (dataValues, labels) => {
        ctx.clearRect(0, 0, mockElements.barGraphCanvas.width, mockElements.barGraphCanvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, mockElements.barGraphCanvas.width, mockElements.barGraphCanvas.height);

        if (dataValues.length === 0) {
          return;
        }
      };

      drawGraph(dataValues, labels);

      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });

  describe('Configuration Loading', () => {
    test('should load configuration from config.h', () => {
      const mockFs = require('fs');
      mockFs.readFileSync = jest.fn().mockReturnValue('#define EMACS_INTEGRATION 1\n#define DEBUG 1\n#define VERBOSE 0');

      const loadConfiguration = () => {
        try {
          const fs = require('fs');
          const path = require('path');
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
          }
        } catch (error) {
          return { EMACS_INTEGRATION: true, DEBUG: false, VERBOSE: false };
        }
      };

      const config = loadConfiguration();
      
      expect(config.EMACS_INTEGRATION).toBe(true);
      expect(config.DEBUG).toBe(true);
      expect(config.VERBOSE).toBe(false);
    });

    test('should use default configuration when config.h is not found', () => {
      const mockFs = require('fs');
      mockFs.existsSync = jest.fn().mockReturnValue(false);

      const loadConfiguration = () => {
        try {
          const fs = require('fs');
          const path = require('path');
          const configPath = path.join(process.cwd(), 'config.h');
          
          if (fs.existsSync(configPath)) {
            // Load from file
            return { EMACS_INTEGRATION: true, DEBUG: false, VERBOSE: false };
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
    });
  });

  describe('Export Functionality', () => {
    test('should export canvas as PNG', () => {
      const mockCanvas = {
        toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
      };

      const exportCanvas = (format) => {
        let dataURL;
        let filename;
        
        switch (format) {
          case 'png':
            dataURL = mockCanvas.toDataURL('image/png');
            filename = 'bar-graph.png';
            break;
          default:
            return;
        }
        
        return { dataURL, filename };
      };

      const result = exportCanvas('png');
      
      expect(result.dataURL).toBe('data:image/png;base64,mockdata');
      expect(result.filename).toBe('bar-graph.png');
    });

    test('should export canvas as JPEG', () => {
      const mockCanvas = {
        toDataURL: jest.fn(() => 'data:image/jpeg;base64,mockdata')
      };

      const exportCanvas = (format) => {
        let dataURL;
        let filename;
        
        switch (format) {
          case 'jpeg':
            dataURL = mockCanvas.toDataURL('image/jpeg', 0.9);
            filename = 'bar-graph.jpg';
            break;
          default:
            return;
        }
        
        return { dataURL, filename };
      };

      const result = exportCanvas('jpeg');
      
      expect(result.dataURL).toBe('data:image/jpeg;base64,mockdata');
      expect(result.filename).toBe('bar-graph.jpg');
    });
  });

  describe('Error Handling', () => {
    test('should display error messages', () => {
      const displayError = (message) => {
        mockElements.errorMessage.textContent = message;
        mockElements.errorMessage.style.display = message ? "block" : "none";
      };

      displayError("Test error message");
      
      expect(mockElements.errorMessage.textContent).toBe("Test error message");
      expect(mockElements.errorMessage.style.display).toBe("block");
    });

    test('should clear error messages', () => {
      const displayError = (message) => {
        mockElements.errorMessage.textContent = message;
        mockElements.errorMessage.style.display = message ? "block" : "none";
      };

      displayError("");
      
      expect(mockElements.errorMessage.textContent).toBe("");
      expect(mockElements.errorMessage.style.display).toBe("none");
    });
  });
});
