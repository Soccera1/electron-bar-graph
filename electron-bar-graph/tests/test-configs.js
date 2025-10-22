/**
 * Test configuration for different environments and scenarios
 */

const testConfigs = {
  // Development environment
  development: {
    EMACS_INTEGRATION: true,
    DEBUG: true,
    VERBOSE: true,
    BUILD_TYPE: 'development',
    NODE_VERSION: 18,
    testTimeout: 10000,
    maxWorkers: 1
  },

  // Production environment
  production: {
    EMACS_INTEGRATION: true,
    DEBUG: false,
    VERBOSE: false,
    BUILD_TYPE: 'release',
    NODE_VERSION: 18,
    testTimeout: 30000,
    maxWorkers: 4
  },

  // CI environment
  ci: {
    EMACS_INTEGRATION: false,
    DEBUG: false,
    VERBOSE: false,
    BUILD_TYPE: 'release',
    NODE_VERSION: 18,
    testTimeout: 60000,
    maxWorkers: 2
  },

  // Performance testing
  performance: {
    EMACS_INTEGRATION: false,
    DEBUG: false,
    VERBOSE: false,
    BUILD_TYPE: 'release',
    NODE_VERSION: 18,
    testTimeout: 120000,
    maxWorkers: 1
  }
};

/**
 * Get test configuration for a specific environment
 * @param {string} environment - The environment name
 * @returns {Object} Test configuration object
 */
function getTestConfig(environment = 'development') {
  return testConfigs[environment] || testConfigs.development;
}

/**
 * Get Jest configuration based on environment
 * @param {string} environment - The environment name
 * @returns {Object} Jest configuration object
 */
function getJestConfig(environment = 'development') {
  const config = getTestConfig(environment);
  
  return {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverageFrom: [
      '*.js',
      '!node_modules/**',
      '!tests/**',
      '!jest.config.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: config.testTimeout,
    maxWorkers: config.maxWorkers,
    verbose: config.VERBOSE,
    // Skip certain tests based on environment
    testPathIgnorePatterns: environment === 'ci' ? [
      '<rootDir>/tests/e2e.test.js'
    ] : [],
    // Environment-specific test setup
    globalSetup: environment === 'performance' ? 
      '<rootDir>/tests/performance-setup.js' : undefined
  };
}

/**
 * Get test data for different scenarios
 * @param {string} scenario - The test scenario
 * @returns {Object} Test data object
 */
function getTestData(scenario = 'basic') {
  const testData = {
    basic: {
      values: [10, 20, 30, 40],
      labels: ['A', 'B', 'C', 'D'],
      expectedBars: 4
    },
    
    large: {
      values: Array.from({ length: 100 }, (_, i) => Math.random() * 100),
      labels: Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`),
      expectedBars: 100
    },
    
    edgeCases: {
      values: [0, -5, 10, Infinity, NaN, 20],
      labels: ['Zero', 'Negative', 'Positive', 'Infinity', 'NaN', 'Normal'],
      expectedBars: 4 // Only valid values
    },
    
    empty: {
      values: [],
      labels: [],
      expectedBars: 0
    },
    
    single: {
      values: [50],
      labels: ['Single'],
      expectedBars: 1
    },
    
    decimal: {
      values: [10.5, 20.7, 30.3, 40.9],
      labels: ['A', 'B', 'C', 'D'],
      expectedBars: 4
    }
  };
  
  return testData[scenario] || testData.basic;
}

/**
 * Get mock data for different test scenarios
 * @param {string} scenario - The mock scenario
 * @returns {Object} Mock data object
 */
function getMockData(scenario = 'default') {
  const mockData = {
    default: {
      canvas: {
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
          font: '12px Arial',
          toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
        }))
      },
      elements: {
        valuesInput: { value: '10,20,30,40' },
        labelsInput: { value: 'A,B,C,D' },
        plotButton: { addEventListener: jest.fn() },
        errorMessage: { textContent: '', style: { display: 'none' } }
      }
    },
    
    performance: {
      canvas: {
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
          font: '12px Arial',
          toDataURL: jest.fn(() => 'data:image/png;base64,mockdata')
        }))
      },
      elements: {
        valuesInput: { 
          value: Array.from({ length: 1000 }, (_, i) => Math.random() * 100).join(',')
        },
        labelsInput: { 
          value: Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`).join(',')
        },
        plotButton: { addEventListener: jest.fn() },
        errorMessage: { textContent: '', style: { display: 'none' } }
      }
    },
    
    error: {
      canvas: {
        width: 760,
        height: 400,
        getContext: jest.fn(() => {
          throw new Error('Canvas context error');
        })
      },
      elements: {
        valuesInput: { value: 'invalid,data' },
        labelsInput: { value: 'A,B,C,D' },
        plotButton: { addEventListener: jest.fn() },
        errorMessage: { textContent: '', style: { display: 'none' } }
      }
    }
  };
  
  return mockData[scenario] || mockData.default;
}

/**
 * Get color test data for different scenarios
 * @param {string} scenario - The color scenario
 * @returns {Object} Color test data
 */
function getColorTestData(scenario = 'basic') {
  const colorData = {
    basic: {
      mode: 'single',
      primary: '#3498db',
      secondary: '#e74c3c',
      custom: '#ff0000,#00ff00,#0000ff',
      expectedColors: ['#3498db', '#3498db', '#3498db', '#3498db']
    },
    
    gradient: {
      mode: 'gradient',
      primary: '#ff0000',
      secondary: '#0000ff',
      custom: '',
      expectedColors: ['rgb(255, 0, 0)', 'rgb(128, 0, 128)', 'rgb(0, 0, 255)']
    },
    
    rainbow: {
      mode: 'rainbow',
      primary: '#3498db',
      secondary: '#e74c3c',
      custom: '',
      expectedColors: ['hsl(0, 70%, 50%)', 'hsl(90, 70%, 50%)', 'hsl(180, 70%, 50%)', 'hsl(270, 70%, 50%)']
    },
    
    custom: {
      mode: 'custom',
      primary: '#3498db',
      secondary: '#e74c3c',
      custom: '#ff0000,#00ff00,#0000ff,#ffff00',
      expectedColors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
    }
  };
  
  return colorData[scenario] || colorData.basic;
}

/**
 * Get Emacs test configuration
 * @param {string} scenario - The Emacs scenario
 * @returns {Object} Emacs test configuration
 */
function getEmacsTestConfig(scenario = 'available') {
  const emacsConfig = {
    available: {
      installed: true,
      version: 'GNU Emacs 28.2',
      integration: true,
      timeout: 5000
    },
    
    unavailable: {
      installed: false,
      version: null,
      integration: false,
      timeout: 1000
    },
    
    timeout: {
      installed: true,
      version: 'GNU Emacs 28.2',
      integration: true,
      timeout: 1000 // Short timeout to trigger timeout error
    },
    
    disabled: {
      installed: true,
      version: 'GNU Emacs 28.2',
      integration: false,
      timeout: 5000
    }
  };
  
  return emacsConfig[scenario] || emacsConfig.available;
}

module.exports = {
  getTestConfig,
  getJestConfig,
  getTestData,
  getMockData,
  getColorTestData,
  getEmacsTestConfig
};
