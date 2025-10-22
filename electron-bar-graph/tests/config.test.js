/**
 * Tests for configuration handling and build system
 */

const fs = require('fs');
const path = require('path');

describe('Configuration Tests', () => {
  describe('config.h Parsing', () => {
    test('should parse valid config.h file', () => {
      const configContent = `
#define EMACS_INTEGRATION 1
#define DEBUG 0
#define VERBOSE 1
#define BUILD_TYPE release
#define NODE_VERSION 18
`;

      const parseConfig = (content) => {
        const config = {};
        
        const emacsMatch = content.match(/#define EMACS_INTEGRATION\s+(\d+)/);
        const debugMatch = content.match(/#define DEBUG\s+(\d+)/);
        const verboseMatch = content.match(/#define VERBOSE\s+(\d+)/);
        const buildTypeMatch = content.match(/#define BUILD_TYPE\s+(\w+)/);
        const nodeVersionMatch = content.match(/#define NODE_VERSION\s+(\d+)/);
        
        config.EMACS_INTEGRATION = emacsMatch ? emacsMatch[1] === '1' : false;
        config.DEBUG = debugMatch ? debugMatch[1] === '1' : false;
        config.VERBOSE = verboseMatch ? verboseMatch[1] === '1' : false;
        config.BUILD_TYPE = buildTypeMatch ? buildTypeMatch[1] : 'release';
        config.NODE_VERSION = nodeVersionMatch ? parseInt(nodeVersionMatch[1]) : 18;
        
        return config;
      };

      const config = parseConfig(configContent);
      
      expect(config.EMACS_INTEGRATION).toBe(true);
      expect(config.DEBUG).toBe(false);
      expect(config.VERBOSE).toBe(true);
      expect(config.BUILD_TYPE).toBe('release');
      expect(config.NODE_VERSION).toBe(18);
    });

    test('should handle missing config values', () => {
      const configContent = `
#define EMACS_INTEGRATION 1
`;

      const parseConfig = (content) => {
        const config = {};
        
        const emacsMatch = content.match(/#define EMACS_INTEGRATION\s+(\d+)/);
        const debugMatch = content.match(/#define DEBUG\s+(\d+)/);
        const verboseMatch = content.match(/#define VERBOSE\s+(\d+)/);
        
        config.EMACS_INTEGRATION = emacsMatch ? emacsMatch[1] === '1' : false;
        config.DEBUG = debugMatch ? debugMatch[1] === '1' : false;
        config.VERBOSE = verboseMatch ? verboseMatch[1] === '1' : false;
        
        return config;
      };

      const config = parseConfig(configContent);
      
      expect(config.EMACS_INTEGRATION).toBe(true);
      expect(config.DEBUG).toBe(false);
      expect(config.VERBOSE).toBe(false);
    });

    test('should handle malformed config.h', () => {
      const configContent = `
invalid content
#define EMACS_INTEGRATION
#define DEBUG 1
`;

      const parseConfig = (content) => {
        const config = {};
        
        const emacsMatch = content.match(/#define EMACS_INTEGRATION\s+(\d+)/);
        const debugMatch = content.match(/#define DEBUG\s+(\d+)/);
        
        config.EMACS_INTEGRATION = emacsMatch ? emacsMatch[1] === '1' : false;
        config.DEBUG = debugMatch ? debugMatch[1] === '1' : false;
        
        return config;
      };

      const config = parseConfig(configContent);
      
      expect(config.EMACS_INTEGRATION).toBe(false);
      expect(config.DEBUG).toBe(true);
    });
  });

  describe('Build Configuration', () => {
    test('should have valid package.json structure', () => {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      expect(packageJson.name).toBe('electron-bar-graph');
      expect(packageJson.version).toBeDefined();
      expect(packageJson.main).toBe('main.js');
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.devDependencies).toBeDefined();
    });

    test('should have required dependencies', () => {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      expect(packageJson.devDependencies.electron).toBeDefined();
      expect(packageJson.devDependencies.jest).toBeDefined();
      expect(packageJson.devDependencies['jest-environment-jsdom']).toBeDefined();
    });

    test('should have test scripts configured', () => {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts['test:watch']).toBeDefined();
      expect(packageJson.scripts['test:coverage']).toBeDefined();
    });
  });

  describe('Jest Configuration', () => {
    test('should have valid jest.config.js', () => {
      const jestConfigPath = path.join(__dirname, '..', 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
      
      const jestConfig = require(jestConfigPath);
      
      expect(jestConfig.testEnvironment).toBe('jsdom');
      expect(jestConfig.testMatch).toBeDefined();
      expect(jestConfig.collectCoverageFrom).toBeDefined();
      expect(jestConfig.setupFilesAfterEnv).toBeDefined();
    });

    test('should have test setup file', () => {
      const setupPath = path.join(__dirname, 'setup.js');
      expect(fs.existsSync(setupPath)).toBe(true);
    });
  });

  describe('File Structure Validation', () => {
    test('should have all required source files', () => {
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

    test('should have all test files', () => {
      const testFiles = [
        'main.test.js',
        'renderer.test.js',
        'integration.test.js',
        'e2e.test.js',
        'emacs.test.js',
        'performance.test.js',
        'utils.test.js',
        'ui.test.js',
        'config.test.js',
        'setup.js'
      ];

      testFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should have proper directory structure', () => {
      const testsDir = path.join(__dirname, '..', 'tests');
      expect(fs.existsSync(testsDir)).toBe(true);
      expect(fs.statSync(testsDir).isDirectory()).toBe(true);
    });
  });

  describe('Environment Configuration', () => {
    test('should handle different build types', () => {
      const getBuildConfig = (buildType) => {
        const configs = {
          debug: {
            DEBUG: true,
            VERBOSE: true,
            EMACS_INTEGRATION: true
          },
          release: {
            DEBUG: false,
            VERBOSE: false,
            EMACS_INTEGRATION: true
          },
          development: {
            DEBUG: true,
            VERBOSE: true,
            EMACS_INTEGRATION: false
          }
        };
        
        return configs[buildType] || configs.release;
      };

      expect(getBuildConfig('debug')).toEqual({
        DEBUG: true,
        VERBOSE: true,
        EMACS_INTEGRATION: true
      });

      expect(getBuildConfig('release')).toEqual({
        DEBUG: false,
        VERBOSE: false,
        EMACS_INTEGRATION: true
      });

      expect(getBuildConfig('development')).toEqual({
        DEBUG: true,
        VERBOSE: true,
        EMACS_INTEGRATION: false
      });
    });

    test('should handle platform-specific configurations', () => {
      const getPlatformConfig = (platform) => {
        const configs = {
          linux: {
            EMACS_INTEGRATION: true,
            PREFIX: '/opt/custom'
          },
          darwin: {
            EMACS_INTEGRATION: true,
            PREFIX: '/usr/local'
          },
          win32: {
            EMACS_INTEGRATION: false,
            PREFIX: 'C:\\Program Files'
          }
        };
        
        return configs[platform] || configs.linux;
      };

      expect(getPlatformConfig('linux')).toEqual({
        EMACS_INTEGRATION: true,
        PREFIX: '/opt/custom'
      });

      expect(getPlatformConfig('darwin')).toEqual({
        EMACS_INTEGRATION: true,
        PREFIX: '/usr/local'
      });

      expect(getPlatformConfig('win32')).toEqual({
        EMACS_INTEGRATION: false,
        PREFIX: 'C:\\Program Files'
      });
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration values', () => {
      const validateConfig = (config) => {
        const errors = [];
        
        if (typeof config.EMACS_INTEGRATION !== 'boolean') {
          errors.push('EMACS_INTEGRATION must be boolean');
        }
        
        if (typeof config.DEBUG !== 'boolean') {
          errors.push('DEBUG must be boolean');
        }
        
        if (typeof config.VERBOSE !== 'boolean') {
          errors.push('VERBOSE must be boolean');
        }
        
        if (config.NODE_VERSION && (typeof config.NODE_VERSION !== 'number' || config.NODE_VERSION < 14)) {
          errors.push('NODE_VERSION must be number >= 14');
        }
        
        return {
          isValid: errors.length === 0,
          errors
        };
      };

      expect(validateConfig({
        EMACS_INTEGRATION: true,
        DEBUG: false,
        VERBOSE: false,
        NODE_VERSION: 18
      })).toEqual({
        isValid: true,
        errors: []
      });

      expect(validateConfig({
        EMACS_INTEGRATION: 'true',
        DEBUG: false,
        VERBOSE: false
      })).toEqual({
        isValid: false,
        errors: ['EMACS_INTEGRATION must be boolean']
      });
    });

    test('should provide default configuration', () => {
      const getDefaultConfig = () => ({
        EMACS_INTEGRATION: true,
        DEBUG: false,
        VERBOSE: false,
        BUILD_TYPE: 'release',
        NODE_VERSION: 18
      });

      const defaultConfig = getDefaultConfig();
      
      expect(defaultConfig.EMACS_INTEGRATION).toBe(true);
      expect(defaultConfig.DEBUG).toBe(false);
      expect(defaultConfig.VERBOSE).toBe(false);
      expect(defaultConfig.BUILD_TYPE).toBe('release');
      expect(defaultConfig.NODE_VERSION).toBe(18);
    });
  });
});
