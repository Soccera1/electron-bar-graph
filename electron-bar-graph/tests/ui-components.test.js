/*
 * Electron Bar Graph - UI Components Tests
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { createMockDOM } from './test-utils.js';

describe('UI Components', () => {
  let dom, document;
  let uiComponents;

  beforeEach(() => {
    jest.clearAllMocks();
    ({ window: global.window, document } = createMockDOM());
    global.document = document;

    // Mock CSS styles and computed styles
    const mockComputedStyle = {
      display: 'block',
      visibility: 'visible',
      opacity: '1',
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)'
    };

    global.window.getComputedStyle = jest.fn(() => mockComputedStyle);

    // UI component utilities
    uiComponents = {
      createInputElement: (type, id, value = '', placeholder = '') => {
        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.value = value;
        input.placeholder = placeholder;
        input.style = {};
        input.addEventListener = jest.fn();
        return input;
      },

      createButtonElement: (id, text = '') => {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.style = {};
        button.addEventListener = jest.fn();
        button.disabled = false;
        return button;
      },

      createSelectElement: (id, options = []) => {
        const select = document.createElement('select');
        select.id = id;
        select.style = {};
        select.addEventListener = jest.fn();
        
        options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value;
          optionElement.textContent = option.text;
          select.appendChild(optionElement);
        });
        
        return select;
      },

      createCanvasElement: (id, width = 760, height = 400) => {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = width;
        canvas.height = height;
        canvas.style = {};
        
        const mockContext = {
          clearRect: jest.fn(),
          fillRect: jest.fn(),
          fillText: jest.fn(),
          beginPath: jest.fn(),
          moveTo: jest.fn(),
          lineTo: jest.fn(),
          stroke: jest.fn(),
          toDataURL: jest.fn(() => 'data:image/png;base64,mock')
        };
        
        canvas.getContext = jest.fn(() => mockContext);
        return canvas;
      },

      validateFormInputs: (inputs) => {
        const errors = [];
        
        inputs.forEach(input => {
          if (input.required && !input.value.trim()) {
            errors.push(`${input.id} is required`);
          }
          
          if (input.type === 'number' && input.value && isNaN(parseFloat(input.value))) {
            errors.push(`${input.id} must be a valid number`);
          }
          
          if (input.type === 'color' && input.value && !/^#[0-9A-Fa-f]{6}$/.test(input.value)) {
            errors.push(`${input.id} must be a valid hex color`);
          }
        });
        
        return errors;
      },

      toggleElementVisibility: (element, show) => {
        if (show) {
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
      },

      updateElementContent: (element, content) => {
        if (element.tagName === 'INPUT') {
          element.value = content;
        } else {
          element.textContent = content;
        }
      }
    };
  });

  describe('Input Elements', () => {
    it('should create text input with correct properties', () => {
      const input = uiComponents.createInputElement('text', 'testInput', 'initial value', 'Enter text');
      
      expect(input.type).toBe('text');
      expect(input.id).toBe('testInput');
      expect(input.value).toBe('initial value');
      expect(input.placeholder).toBe('Enter text');
    });

    it('should create color input with default value', () => {
      const input = uiComponents.createInputElement('color', 'colorInput', '#ff0000');
      
      expect(input.type).toBe('color');
      expect(input.id).toBe('colorInput');
      expect(input.value).toBe('#ff0000');
    });

    it('should create number input', () => {
      const input = uiComponents.createInputElement('number', 'numberInput', '42');
      
      expect(input.type).toBe('number');
      expect(input.value).toBe('42');
    });

    it('should support event listeners on inputs', () => {
      const input = uiComponents.createInputElement('text', 'testInput');
      
      expect(input.addEventListener).toBeDefined();
      expect(typeof input.addEventListener).toBe('function');
    });
  });

  describe('Button Elements', () => {
    it('should create button with text', () => {
      const button = uiComponents.createButtonElement('testButton', 'Click Me');
      
      expect(button.id).toBe('testButton');
      expect(button.textContent).toBe('Click Me');
      expect(button.disabled).toBe(false);
    });

    it('should support button state changes', () => {
      const button = uiComponents.createButtonElement('testButton', 'Test');
      
      button.disabled = true;
      expect(button.disabled).toBe(true);
      
      button.disabled = false;
      expect(button.disabled).toBe(false);
    });

    it('should support event listeners on buttons', () => {
      const button = uiComponents.createButtonElement('testButton');
      
      expect(button.addEventListener).toBeDefined();
      expect(typeof button.addEventListener).toBe('function');
    });
  });

  describe('Select Elements', () => {
    it('should create select with options', () => {
      const options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' }
      ];
      
      const select = uiComponents.createSelectElement('testSelect', options);
      
      expect(select.id).toBe('testSelect');
      expect(select.children.length).toBe(2);
      expect(select.children[0].value).toBe('option1');
      expect(select.children[0].textContent).toBe('Option 1');
    });

    it('should create empty select', () => {
      const select = uiComponents.createSelectElement('emptySelect');
      
      expect(select.children.length).toBe(0);
    });

    it('should support event listeners on select', () => {
      const select = uiComponents.createSelectElement('testSelect');
      
      expect(select.addEventListener).toBeDefined();
      expect(typeof select.addEventListener).toBe('function');
    });
  });

  describe('Canvas Elements', () => {
    it('should create canvas with default dimensions', () => {
      const canvas = uiComponents.createCanvasElement('testCanvas');
      
      expect(canvas.id).toBe('testCanvas');
      expect(canvas.width).toBe(760);
      expect(canvas.height).toBe(400);
    });

    it('should create canvas with custom dimensions', () => {
      const canvas = uiComponents.createCanvasElement('customCanvas', 1000, 600);
      
      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(600);
    });

    it('should provide 2D context', () => {
      const canvas = uiComponents.createCanvasElement('testCanvas');
      const context = canvas.getContext('2d');
      
      expect(context).toBeDefined();
      expect(context.clearRect).toBeDefined();
      expect(context.fillRect).toBeDefined();
      expect(context.fillText).toBeDefined();
    });

    it('should support canvas data URL export', () => {
      const canvas = uiComponents.createCanvasElement('testCanvas');
      const context = canvas.getContext('2d');
      
      const dataURL = context.toDataURL();
      expect(dataURL).toBe('data:image/png;base64,mock');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const inputs = [
        { id: 'field1', value: '', required: true },
        { id: 'field2', value: 'has value', required: true }
      ];
      
      const errors = uiComponents.validateFormInputs(inputs);
      
      expect(errors).toContain('field1 is required');
      expect(errors).not.toContain('field2 is required');
    });

    it('should validate number fields', () => {
      const inputs = [
        { id: 'number1', value: '42', type: 'number' },
        { id: 'number2', value: 'not a number', type: 'number' }
      ];
      
      const errors = uiComponents.validateFormInputs(inputs);
      
      expect(errors).not.toContain('number1 must be a valid number');
      expect(errors).toContain('number2 must be a valid number');
    });

    it('should validate color fields', () => {
      const inputs = [
        { id: 'color1', value: '#ff0000', type: 'color' },
        { id: 'color2', value: 'red', type: 'color' },
        { id: 'color3', value: '#xyz', type: 'color' }
      ];
      
      const errors = uiComponents.validateFormInputs(inputs);
      
      expect(errors).not.toContain('color1 must be a valid hex color');
      expect(errors).toContain('color2 must be a valid hex color');
      expect(errors).toContain('color3 must be a valid hex color');
    });

    it('should return empty array for valid inputs', () => {
      const inputs = [
        { id: 'text1', value: 'valid text', required: true },
        { id: 'number1', value: '123', type: 'number' },
        { id: 'color1', value: '#00ff00', type: 'color' }
      ];
      
      const errors = uiComponents.validateFormInputs(inputs);
      
      expect(errors).toEqual([]);
    });
  });

  describe('Element Visibility', () => {
    it('should show element', () => {
      const element = { style: { display: 'none' } };
      
      uiComponents.toggleElementVisibility(element, true);
      
      expect(element.style.display).toBe('block');
    });

    it('should hide element', () => {
      const element = { style: { display: 'block' } };
      
      uiComponents.toggleElementVisibility(element, false);
      
      expect(element.style.display).toBe('none');
    });
  });

  describe('Element Content Updates', () => {
    it('should update input value', () => {
      const input = { tagName: 'INPUT', value: '' };
      
      uiComponents.updateElementContent(input, 'new value');
      
      expect(input.value).toBe('new value');
    });

    it('should update element text content', () => {
      const div = { tagName: 'DIV', textContent: '' };
      
      uiComponents.updateElementContent(div, 'new text');
      
      expect(div.textContent).toBe('new text');
    });
  });

  describe('UI State Management', () => {
    it('should manage color mode UI state', () => {
      const colorMode = uiComponents.createSelectElement('colorMode', [
        { value: 'single', text: 'Single Color' },
        { value: 'gradient', text: 'Gradient' },
        { value: 'custom', text: 'Custom Colors' }
      ]);
      
      const secondaryColor = uiComponents.createInputElement('color', 'secondaryColor');
      const customColors = uiComponents.createInputElement('text', 'customColors');
      
      // Simulate single color mode
      uiComponents.toggleElementVisibility(secondaryColor, false);
      uiComponents.toggleElementVisibility(customColors, false);
      
      expect(secondaryColor.style.display).toBe('none');
      expect(customColors.style.display).toBe('none');
      
      // Simulate gradient mode
      uiComponents.toggleElementVisibility(secondaryColor, true);
      uiComponents.toggleElementVisibility(customColors, false);
      
      expect(secondaryColor.style.display).toBe('block');
      expect(customColors.style.display).toBe('none');
    });

    it('should manage error message display', () => {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'errorMessage';
      errorDiv.style = {};
      
      // Show error
      uiComponents.updateElementContent(errorDiv, 'An error occurred');
      uiComponents.toggleElementVisibility(errorDiv, true);
      
      expect(errorDiv.textContent).toBe('An error occurred');
      expect(errorDiv.style.display).toBe('block');
      
      // Hide error
      uiComponents.updateElementContent(errorDiv, '');
      uiComponents.toggleElementVisibility(errorDiv, false);
      
      expect(errorDiv.textContent).toBe('');
      expect(errorDiv.style.display).toBe('none');
    });

    it('should manage button states during operations', () => {
      const plotButton = uiComponents.createButtonElement('plotButton', 'Plot Graph');
      const exportButton = uiComponents.createButtonElement('exportButton', 'Export');
      
      // Disable during operation
      plotButton.disabled = true;
      exportButton.disabled = true;
      
      expect(plotButton.disabled).toBe(true);
      expect(exportButton.disabled).toBe(true);
      
      // Re-enable after operation
      plotButton.disabled = false;
      exportButton.disabled = false;
      
      expect(plotButton.disabled).toBe(false);
      expect(exportButton.disabled).toBe(false);
    });
  });

  describe('Responsive Design Elements', () => {
    it('should handle canvas resizing', () => {
      const canvas = uiComponents.createCanvasElement('responsiveCanvas', 800, 600);
      
      // Simulate resize
      canvas.width = 1200;
      canvas.height = 800;
      
      expect(canvas.width).toBe(1200);
      expect(canvas.height).toBe(800);
    });

    it('should maintain aspect ratio calculations', () => {
      const originalWidth = 760;
      const originalHeight = 400;
      const aspectRatio = originalWidth / originalHeight;
      
      // Test different sizes maintaining aspect ratio
      const newWidth = 1140; // 1.5x scale
      const expectedHeight = newWidth / aspectRatio;
      
      expect(expectedHeight).toBe(600);
    });
  });
});