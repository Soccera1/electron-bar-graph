/**
 * Coverage configuration for Electron Bar Graph tests
 */

module.exports = {
  // Coverage thresholds
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Specific file thresholds
    './main.js': {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './renderer.js': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Coverage collection settings
  collectCoverageFrom: [
    '*.js',
    '!node_modules/**',
    '!tests/**',
    '!jest.config.js',
    '!coverage/**',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage path mapping
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
    '/build/',
    '/dist/'
  ],
  
  // Coverage collection options
  collectCoverage: false, // Set to true when running with --coverage
  
  // Coverage provider
  coverageProvider: 'v8',
  
  // Coverage thresholds for different environments
  environments: {
    development: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    production: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    ci: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
