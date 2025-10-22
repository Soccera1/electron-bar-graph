# Electron Bar Graph - Test Suite

This directory contains comprehensive unit tests for the Electron Bar Graph application using Bun as the test runner.

## Test Structure

### Test Files

- **`main.test.js`** - Tests for the main Electron process
- **`renderer.test.js`** - Tests for the renderer process functionality
- **`emacs-integration.test.js`** - Tests for Emacs integration features
- **`svg-export.test.js`** - Tests for SVG export functionality
- **`integration.test.js`** - Integration tests for complete workflows
- **`bar-graph-el.test.js`** - Tests for bar-graph.el Emacs Lisp functionality
- **`ui-components.test.js`** - Tests for UI components and interactions

### Utility Files

- **`test-utils.js`** - Common test utilities and mocks
- **`setup.js`** - Global test setup and configuration

## Running Tests

### Basic Test Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/renderer.test.js

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch

# Using Make targets (recommended)
make test              # Run all tests (build + unit)
make test-unit         # Run unit tests only
make test-coverage     # Run with coverage
make test-watch        # Watch mode

# Using the test runner script
./test-runner.js
./test-runner.js --coverage
./test-runner.js --watch
```

### Test Categories

#### Main Process Tests
Tests the Electron main process functionality:
- Window creation and configuration
- App lifecycle management
- Platform-specific behavior

#### Renderer Process Tests
Tests the browser-side functionality:
- Input parsing and validation
- Color generation algorithms
- Canvas drawing operations
- Configuration loading

#### Emacs Integration Tests
Tests the Emacs integration features:
- Emacs installation detection
- Script generation
- File operations
- Error handling

#### SVG Export Tests
Tests the SVG export functionality:
- SVG content generation
- Scaling and positioning
- Download mechanisms
- Error handling

#### Integration Tests
Tests complete user workflows:
- End-to-end graph creation
- Error recovery
- State management
- Event handling

#### UI Component Tests
Tests UI components and interactions:
- Form validation
- Element visibility
- State management
- Responsive design

## Test Coverage

The test suite aims for high coverage across:
- **Functions**: 80%+
- **Lines**: 80%+
- **Branches**: 70%+
- **Statements**: 80%+

## Mocking Strategy

### DOM Mocking
Uses `happy-dom` to provide a lightweight DOM environment for testing browser-side code.

### Electron Mocking
Mocks Electron APIs including:
- `app` lifecycle methods
- `BrowserWindow` creation
- File system operations

### Bun/Node.js Mocking
Mocks Bun/Node.js modules:
- `fs` for file operations
- `path` for path manipulation
- `child_process` for spawning processes

## Test Data

Common test data is defined in `test-utils.js`:
- Valid and invalid input values
- Sample labels and colors
- Mock configuration data

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow the AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test both success and error cases
5. Keep tests focused and isolated

### Test Organization
1. Group related tests in `describe` blocks
2. Use `beforeEach` for common setup
3. Clean up mocks between tests
4. Use meaningful variable names

### Assertions
1. Use specific matchers (`toBe`, `toEqual`, `toContain`)
2. Test exact values when possible
3. Verify mock function calls
4. Check error conditions

## Debugging Tests

### Common Issues
1. **Mock not working**: Ensure mocks are set up in `beforeEach`
2. **DOM errors**: Check that DOM elements are properly mocked
3. **Async issues**: Use proper async/await patterns
4. **Coverage gaps**: Add tests for uncovered branches

### Debug Commands
```bash
# Run single test with verbose output
bun test tests/renderer.test.js

# Debug specific test
bun test --grep "should parse valid input"
```

## Configuration

Test configuration is in `bunfig.toml`:
- Test timeout: 5000ms
- Coverage directory: `./coverage`
- Test environment: `test`

## Dependencies

### Test Dependencies
- `@types/bun` - TypeScript definitions for Bun
- `happy-dom` - Lightweight DOM implementation

### Runtime Dependencies
All application dependencies are available during testing.

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies required
- Deterministic results
- Fast execution
- Clear error reporting

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update test documentation
5. Follow existing patterns

## Troubleshooting

### Common Test Failures
1. **Canvas context errors**: Check canvas mocking setup
2. **File system errors**: Verify fs mocks are configured
3. **Async timeout**: Increase timeout or fix async handling
4. **DOM manipulation errors**: Ensure DOM elements exist

### Getting Help
1. Check test output for specific error messages
2. Review mock configurations in `test-utils.js`
3. Verify test setup in `setup.js`
4. Compare with working similar tests