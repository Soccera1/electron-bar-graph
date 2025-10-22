# Electron Bar Graph Test Suite

This directory contains a comprehensive test suite for the Electron Bar Graph application, covering unit tests, integration tests, end-to-end tests, performance tests, and more.

## Test Structure

### Test Files

- **`main.test.js`** - Tests for the Electron main process (`main.js`)
- **`renderer.test.js`** - Tests for the renderer process and core application logic
- **`integration.test.js`** - Integration tests for file structure and app lifecycle
- **`e2e.test.js`** - End-to-end tests using Spectron for full user workflows
- **`emacs.test.js`** - Tests for Emacs integration functionality
- **`performance.test.js`** - Performance and stress tests for large datasets
- **`utils.test.js`** - Tests for utility functions and edge cases
- **`ui.test.js`** - Tests for HTML structure and accessibility
- **`config.test.js`** - Tests for configuration handling and build system
- **`setup.js`** - Jest setup file with mocks and test environment configuration

### Test Categories

#### Unit Tests
- Input parsing and validation
- Color generation algorithms
- Canvas drawing functions
- Configuration loading
- Error handling

#### Integration Tests
- File structure validation
- Electron app lifecycle
- Configuration parsing
- Build system integration

#### End-to-End Tests
- Complete user workflows
- UI interactions
- Data input and visualization
- Export functionality
- Emacs integration

#### Performance Tests
- Large dataset handling
- Memory usage optimization
- Rendering performance
- Stress testing

#### UI Tests
- HTML structure validation
- CSS styling verification
- Accessibility compliance
- Cross-browser compatibility

## Running Tests

### Using Make

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run tests in watch mode
make test-watch

# Run specific test categories
make test-unit
make test-integration
make test-e2e
make test-performance
make test-ui
make test-emacs
```

### Using npm

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Using the Test Runner Script

```bash
# Run all tests
./tests/run-tests.sh

# Run specific test categories
./tests/run-tests.sh unit
./tests/run-tests.sh integration
./tests/run-tests.sh e2e
./tests/run-tests.sh performance
./tests/run-tests.sh ui
./tests/run-tests.sh emacs

# Run with coverage
./tests/run-tests.sh coverage

# Run in watch mode
./tests/run-tests.sh watch
```

### Using Jest Directly

```bash
# Run all tests
npx jest

# Run specific test files
npx jest tests/main.test.js
npx jest tests/renderer.test.js

# Run tests with coverage
npx jest --coverage

# Run tests in watch mode
npx jest --watch
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

- **Test Environment**: `jsdom` for DOM testing
- **Setup Files**: `tests/setup.js` for test environment setup
- **Test Match**: `tests/**/*.test.js`
- **Coverage**: Collects coverage from all source files
- **Timeout**: 30 seconds for long-running tests

### Test Setup (`tests/setup.js`)

- Mocks Electron modules
- Sets up DOM environment with JSDOM
- Mocks canvas functionality
- Configures test utilities

## Test Coverage

The test suite aims for comprehensive coverage of:

- ✅ **Main Process**: Electron app lifecycle, window management
- ✅ **Renderer Process**: Core application logic, UI interactions
- ✅ **Input Validation**: Data parsing, error handling
- ✅ **Visualization**: Canvas drawing, color generation
- ✅ **Export Functionality**: PNG, JPEG, WEBP, SVG export
- ✅ **Emacs Integration**: Configuration, script generation
- ✅ **Performance**: Large datasets, memory usage
- ✅ **UI Structure**: HTML validation, accessibility
- ✅ **Configuration**: Build system, config parsing

## Test Data

### Sample Test Data

```javascript
// Valid input data
const validData = {
  values: [10, 20, 30, 40],
  labels: ['A', 'B', 'C', 'D']
};

// Large dataset for performance testing
const largeDataset = {
  values: Array.from({ length: 1000 }, (_, i) => Math.random() * 100),
  labels: Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`)
};

// Edge cases
const edgeCases = {
  empty: { values: [], labels: [] },
  negative: { values: [10, -5, 30], labels: ['A', 'B', 'C'] },
  invalid: { values: [10, 'abc', 30], labels: ['A', 'B', 'C'] }
};
```

## Mocking

### Electron Mocks

```javascript
// Mock Electron modules
global.require = jest.fn((module) => {
  if (module === 'electron') {
    return {
      app: { whenReady: jest.fn(), on: jest.fn(), quit: jest.fn() },
      BrowserWindow: jest.fn(() => ({ loadFile: jest.fn(), setMenu: jest.fn() }))
    };
  }
  // ... other modules
});
```

### DOM Mocks

```javascript
// Mock DOM elements
const mockElements = {
  valuesInput: { value: '10,20,30,40' },
  labelsInput: { value: 'A,B,C,D' },
  // ... other elements
};

document.getElementById = jest.fn((id) => mockElements[id]);
```

### Canvas Mocks

```javascript
// Mock canvas context
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  // ... other canvas methods
}));
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: make test
      - run: make test-coverage
```

## Debugging Tests

### Running Individual Tests

```bash
# Run a specific test file
npx jest tests/main.test.js

# Run a specific test case
npx jest tests/main.test.js -t "should create a BrowserWindow"

# Run tests with verbose output
npx jest --verbose
```

### Debug Mode

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external dependencies appropriately
3. **Coverage**: Aim for high test coverage
4. **Performance**: Keep tests fast and efficient
5. **Maintenance**: Keep tests up-to-date with code changes

## Troubleshooting

### Common Issues

1. **Electron not found**: Ensure Electron is installed as a dev dependency
2. **Canvas issues**: Check that the canvas mock is properly configured
3. **Timeout errors**: Increase Jest timeout for long-running tests
4. **Memory issues**: Use `--max-old-space-size=4096` for large test suites

### Debug Commands

```bash
# Check test configuration
npx jest --showConfig

# Run tests with debug output
DEBUG=* npx jest

# Check coverage
npx jest --coverage --verbose
```

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate mocks for new dependencies
3. Update this README if adding new test categories
4. Ensure tests are fast and reliable
5. Add tests for both success and failure cases
