#!/bin/bash
# Test runner script for Electron Bar Graph

set -e

echo "🧪 Electron Bar Graph Test Suite"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from the project root."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run different test suites based on arguments
case "${1:-all}" in
    "all")
        echo "🚀 Running all tests..."
        npm test
        ;;
    "unit")
        echo "🔧 Running unit tests..."
        npx jest tests/main.test.js tests/renderer.test.js tests/utils.test.js
        ;;
    "integration")
        echo "🔗 Running integration tests..."
        npx jest tests/integration.test.js tests/config.test.js
        ;;
    "e2e")
        echo "🌐 Running end-to-end tests..."
        npx jest tests/e2e.test.js
        ;;
    "performance")
        echo "⚡ Running performance tests..."
        npx jest tests/performance.test.js
        ;;
    "ui")
        echo "🎨 Running UI tests..."
        npx jest tests/ui.test.js
        ;;
    "emacs")
        echo "📝 Running Emacs integration tests..."
        npx jest tests/emacs.test.js
        ;;
    "coverage")
        echo "📊 Running tests with coverage..."
        npm run test:coverage
        ;;
    "watch")
        echo "👀 Running tests in watch mode..."
        npm run test:watch
        ;;
    "help")
        echo "Available test commands:"
        echo "  all         - Run all tests (default)"
        echo "  unit        - Run unit tests only"
        echo "  integration - Run integration tests only"
        echo "  e2e         - Run end-to-end tests only"
        echo "  performance - Run performance tests only"
        echo "  ui          - Run UI tests only"
        echo "  emacs       - Run Emacs integration tests only"
        echo "  coverage    - Run tests with coverage report"
        echo "  watch       - Run tests in watch mode"
        echo "  help        - Show this help"
        ;;
    *)
        echo "❌ Unknown test type: $1"
        echo "Use 'help' to see available options"
        exit 1
        ;;
esac

echo "✅ Test suite completed!"
