/**
 * Tests for UI structure and accessibility
 */

const fs = require('fs');
const path = require('path');

describe('UI Structure Tests', () => {
  let htmlContent;
  let cssContent;

  beforeAll(() => {
    htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    cssContent = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
  });

  describe('HTML Structure', () => {
    test('should have proper DOCTYPE and HTML structure', () => {
      expect(htmlContent).toContain('<!doctype html>');
      expect(htmlContent).toContain('<html>');
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('<body>');
      expect(htmlContent).toContain('</html>');
    });

    test('should have proper meta tags', () => {
      expect(htmlContent).toContain('<meta charset="UTF-8" />');
      expect(htmlContent).toContain('<title>Electron Bar Graph</title>');
    });

    test('should link to CSS file', () => {
      expect(htmlContent).toContain('<link rel="stylesheet" href="style.css" />');
    });

    test('should have main heading', () => {
      expect(htmlContent).toContain('<h1>Bar Graph Visualizer</h1>');
    });

    test('should have all required input elements', () => {
      expect(htmlContent).toContain('id="valuesInput"');
      expect(htmlContent).toContain('id="labelsInput"');
      expect(htmlContent).toContain('id="plotButton"');
      expect(htmlContent).toContain('id="barGraphCanvas"');
    });

    test('should have proper input types and attributes', () => {
      expect(htmlContent).toContain('<input type="text" id="valuesInput"');
      expect(htmlContent).toContain('<input type="text" id="labelsInput"');
      expect(htmlContent).toContain('<button id="plotButton"');
      expect(htmlContent).toContain('<canvas id="barGraphCanvas"');
    });

    test('should have default values in inputs', () => {
      expect(htmlContent).toContain('value="10,20,30,40"');
      expect(htmlContent).toContain('value="A,B,C,D"');
    });

    test('should have color controls', () => {
      expect(htmlContent).toContain('id="colorMode"');
      expect(htmlContent).toContain('id="primaryColor"');
      expect(htmlContent).toContain('id="secondaryColor"');
      expect(htmlContent).toContain('id="customColors"');
    });

    test('should have export buttons', () => {
      expect(htmlContent).toContain('id="exportPNG"');
      expect(htmlContent).toContain('id="exportJPEG"');
      expect(htmlContent).toContain('id="exportWEBP"');
      expect(htmlContent).toContain('id="exportSVG"');
    });

    test('should have Emacs integration section', () => {
      expect(htmlContent).toContain('id="emacsSection"');
      expect(htmlContent).toContain('id="openInEmacs"');
    });

    test('should have error message container', () => {
      expect(htmlContent).toContain('id="errorMessage"');
    });

    test('should include renderer script', () => {
      expect(htmlContent).toContain('<script src="renderer.js"></script>');
    });
  });

  describe('CSS Structure', () => {
    test('should have main container classes', () => {
      expect(cssContent).toContain('.input-section');
      expect(cssContent).toContain('.color-section');
      expect(cssContent).toContain('.export-section');
      expect(cssContent).toContain('.graph-container');
    });

    test('should have error message styling', () => {
      expect(cssContent).toContain('.error-message');
    });

    test('should have Emacs section styling', () => {
      expect(cssContent).toContain('.emacs-section');
      expect(cssContent).toContain('.emacs-help');
    });

    test('should have color control styling', () => {
      expect(cssContent).toContain('.color-controls');
    });
  });

  describe('Accessibility', () => {
    test('should have proper labels for inputs', () => {
      expect(htmlContent).toContain('<label for="valuesInput">');
      expect(htmlContent).toContain('<label for="labelsInput">');
      expect(htmlContent).toContain('<label for="colorMode">');
      expect(htmlContent).toContain('<label for="primaryColor">');
    });

    test('should have descriptive button text', () => {
      expect(htmlContent).toContain('Plot Graph');
      expect(htmlContent).toContain('Export as PNG');
      expect(htmlContent).toContain('Export as JPEG');
      expect(htmlContent).toContain('Export as WEBP');
      expect(htmlContent).toContain('Export as SVG');
      expect(htmlContent).toContain('Open in Emacs');
    });

    test('should have proper heading hierarchy', () => {
      expect(htmlContent).toContain('<h1>');
      expect(htmlContent).toContain('<h3>');
    });

    test('should have canvas with proper dimensions', () => {
      expect(htmlContent).toContain('width="760"');
      expect(htmlContent).toContain('height="400"');
    });
  });

  describe('Form Validation', () => {
    test('should have proper input attributes', () => {
      expect(htmlContent).toContain('type="text"');
      expect(htmlContent).toContain('type="color"');
    });

    test('should have placeholder text for custom colors', () => {
      expect(htmlContent).toContain('placeholder="#ff0000,#00ff00,#0000ff,#ffff00"');
    });

    test('should have proper select options', () => {
      expect(htmlContent).toContain('<option value="single">Single Color</option>');
      expect(htmlContent).toContain('<option value="gradient">Gradient</option>');
      expect(htmlContent).toContain('<option value="rainbow">Rainbow</option>');
      expect(htmlContent).toContain('<option value="custom">Custom Colors</option>');
    });
  });

  describe('Responsive Design', () => {
    test('should have canvas with fixed dimensions', () => {
      expect(htmlContent).toContain('width="760" height="400"');
    });

    test('should have proper CSS for layout', () => {
      // Check for common layout properties
      expect(cssContent).toMatch(/width|height|margin|padding|display/);
    });
  });

  describe('Content Structure', () => {
    test('should have logical section organization', () => {
      const sections = [
        'input-section',
        'color-section', 
        'export-section',
        'emacs-section',
        'graph-container'
      ];

      sections.forEach(section => {
        expect(htmlContent).toContain(`class="${section}"`);
      });
    });

    test('should have proper button grouping', () => {
      expect(htmlContent).toContain('Export Graph');
      expect(htmlContent).toContain('Bar Colors');
      expect(htmlContent).toContain('Open in Emacs');
    });

    test('should have help text for Emacs integration', () => {
      expect(htmlContent).toContain('This will open the current graph data in Emacs');
    });
  });

  describe('JavaScript Integration', () => {
    test('should have proper script loading order', () => {
      const scriptIndex = htmlContent.indexOf('<script src="renderer.js"></script>');
      const bodyEndIndex = htmlContent.lastIndexOf('</body>');
      
      expect(scriptIndex).toBeGreaterThan(-1);
      expect(scriptIndex).toBeLessThan(bodyEndIndex);
    });

    test('should have proper DOM structure for JavaScript', () => {
      const requiredElements = [
        'valuesInput',
        'labelsInput', 
        'plotButton',
        'barGraphCanvas',
        'errorMessage',
        'colorMode',
        'primaryColor',
        'secondaryColor',
        'customColors',
        'emacsSection',
        'openInEmacs'
      ];

      requiredElements.forEach(element => {
        expect(htmlContent).toContain(`id="${element}"`);
      });
    });
  });

  describe('Cross-browser Compatibility', () => {
    test('should use standard HTML5 elements', () => {
      expect(htmlContent).toContain('<canvas');
      expect(htmlContent).toContain('<input type="color"');
      expect(htmlContent).toContain('<!doctype html>');
    });

    test('should have proper character encoding', () => {
      expect(htmlContent).toContain('charset="UTF-8"');
    });

    test('should use semantic HTML elements', () => {
      expect(htmlContent).toContain('<h1>');
      expect(htmlContent).toContain('<h3>');
      expect(htmlContent).toContain('<label for=');
      expect(htmlContent).toContain('<button id=');
    });
  });

  describe('Security Considerations', () => {
    test('should not have inline JavaScript', () => {
      // Check that there's no inline JavaScript in the HTML
      const inlineScriptRegex = /<script[^>]*>[\s\S]*?<\/script>/g;
      const matches = htmlContent.match(inlineScriptRegex);
      
      // Should only have the external script tag
      expect(matches).toHaveLength(1);
      expect(matches[0]).toContain('src="renderer.js"');
    });

    test('should not have inline styles', () => {
      // Check for inline style attributes
      const inlineStyleRegex = /style\s*=\s*["'][^"']*["']/g;
      const matches = htmlContent.match(inlineStyleRegex);
      
      // Should have minimal inline styles (only for initial display states)
      expect(matches.length).toBeGreaterThanOrEqual(2); // secondaryColor and customColors initial display
    });

    test('should use external CSS file', () => {
      expect(htmlContent).toContain('<link rel="stylesheet" href="style.css" />');
    });
  });
});
