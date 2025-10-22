#!/bin/bash
# Test environment setup script for Electron Bar Graph

set -e

echo "🔧 Setting up test environment for Electron Bar Graph"
echo "=================================================="

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from the project root."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if Electron is available
echo "🔍 Checking Electron installation..."
if npx electron --version > /dev/null 2>&1; then
    electron_version=$(npx electron --version)
    echo "✅ Electron version: $electron_version"
else
    echo "❌ Electron not found. Installing..."
    npm install electron --save-dev
fi

# Check if Jest is available
echo "🔍 Checking Jest installation..."
if npx jest --version > /dev/null 2>&1; then
    jest_version=$(npx jest --version)
    echo "✅ Jest version: $jest_version"
else
    echo "❌ Jest not found. Installing..."
    npm install jest --save-dev
fi

# Check if Spectron is available (for E2E tests)
echo "🔍 Checking Spectron installation..."
if npx spectron --version > /dev/null 2>&1; then
    spectron_version=$(npx spectron --version)
    echo "✅ Spectron version: $spectron_version"
else
    echo "❌ Spectron not found. Installing..."
    npm install spectron --save-dev
fi

# Create test directories if they don't exist
echo "📁 Creating test directories..."
mkdir -p tests
mkdir -p coverage
mkdir -p build

# Check if config.h exists
if [ ! -f "../config.h" ]; then
    echo "⚠️  Warning: config.h not found. Creating default configuration..."
    cat > ../config.h << EOF
#define EMACS_INTEGRATION 1
#define DEBUG 0
#define VERBOSE 0
#define BUILD_TYPE release
#define NODE_VERSION 18
EOF
    echo "✅ Created default config.h"
else
    echo "✅ config.h found"
fi

# Set up test environment variables
echo "🌍 Setting up test environment variables..."
export NODE_ENV=test
export ELECTRON_DISABLE_SECURITY_WARNINGS=true
export ELECTRON_NO_ATTACH_CONSOLE=true

# Check test configuration
echo "🔧 Validating test configuration..."
if [ -f "jest.config.js" ]; then
    echo "✅ Jest configuration found"
else
    echo "❌ Jest configuration not found"
    exit 1
fi

if [ -f "tests/setup.js" ]; then
    echo "✅ Test setup file found"
else
    echo "❌ Test setup file not found"
    exit 1
fi

# Run a quick test to verify setup
echo "🧪 Running quick test to verify setup..."
if npx jest --version > /dev/null 2>&1; then
    echo "✅ Jest is working correctly"
else
    echo "❌ Jest is not working correctly"
    exit 1
fi

# Check if all test files exist
echo "📋 Checking test files..."
test_files=(
    "tests/main.test.js"
    "tests/renderer.test.js"
    "tests/integration.test.js"
    "tests/e2e.test.js"
    "tests/emacs.test.js"
    "tests/performance.test.js"
    "tests/utils.test.js"
    "tests/ui.test.js"
    "tests/config.test.js"
    "tests/setup.js"
)

missing_files=()
for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "⚠️  Warning: ${#missing_files[@]} test files are missing"
    echo "Missing files: ${missing_files[*]}"
fi

# Set up permissions
echo "🔐 Setting up permissions..."
chmod +x tests/run-tests.sh 2>/dev/null || true
chmod +x tests/setup-env.sh 2>/dev/null || true

# Create a test summary
echo ""
echo "📊 Test Environment Summary"
echo "=========================="
echo "Node.js: $node_version"
echo "Electron: $(npx electron --version 2>/dev/null || echo 'Not available')"
echo "Jest: $(npx jest --version 2>/dev/null || echo 'Not available')"
echo "Spectron: $(npx spectron --version 2>/dev/null || echo 'Not available')"
echo "Test files: $(find tests -name '*.test.js' | wc -l)"
echo "Environment: $NODE_ENV"

echo ""
echo "✅ Test environment setup complete!"
echo ""
echo "🚀 You can now run tests with:"
echo "  make test              # Run all tests"
echo "  make test-coverage     # Run tests with coverage"
echo "  make test-watch        # Run tests in watch mode"
echo "  ./tests/run-tests.sh   # Run tests with custom options"
echo ""
echo "📚 For more information, see tests/README.md"
