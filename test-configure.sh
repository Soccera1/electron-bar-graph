#!/bin/bash

# Test script for the configure script
# This script tests various configuration options

set -e

echo "Testing Electron Bar Graph Configure Script"
echo "=========================================="

# Test 1: Basic configuration
echo "Test 1: Basic configuration"
./configure --prefix=/tmp/test-install
if [ -f "config.h" ] && [ -f "Makefile" ]; then
    echo "✓ Basic configuration passed"
else
    echo "✗ Basic configuration failed"
    exit 1
fi

# Test 2: Disable Emacs integration
echo "Test 2: Disable Emacs integration"
./configure --disable-emacs --prefix=/tmp/test-install
if grep -q "EMACS_INTEGRATION 0" config.h; then
    echo "✓ Emacs integration disabled correctly"
else
    echo "✗ Emacs integration not disabled"
    exit 1
fi

# Test 3: Enable debug mode
echo "Test 3: Enable debug mode"
./configure --enable-debug --prefix=/tmp/test-install
if grep -q "DEBUG 1" config.h; then
    echo "✓ Debug mode enabled correctly"
else
    echo "✗ Debug mode not enabled"
    exit 1
fi

# Test 4: Verbose mode
echo "Test 4: Verbose mode"
./configure --verbose --prefix=/tmp/test-install
if grep -q "VERBOSE 1" config.h; then
    echo "✓ Verbose mode enabled correctly"
else
    echo "✗ Verbose mode not enabled"
    exit 1
fi

# Test 5: Custom prefix
echo "Test 5: Custom prefix"
./configure --prefix=/opt/custom
if grep -q 'PREFIX "/opt/custom"' config.h; then
    echo "✓ Custom prefix set correctly"
else
    echo "✗ Custom prefix not set"
    exit 1
fi

# Test 6: Help option
echo "Test 6: Help option"
if ./configure --help | grep -q "Usage:"; then
    echo "✓ Help option works"
else
    echo "✗ Help option failed"
    exit 1
fi

# Test 7: Root check for Emacs build
echo "Test 7: Root check for Emacs build"
if ./configure --build-emacs --prefix=/tmp/test 2>&1 | grep -q "Building Emacs requires root privileges"; then
    echo "✓ Root check works correctly"
else
    echo "✗ Root check failed"
    exit 1
fi

echo ""
echo "All tests passed! ✓"
echo "The configure script is working correctly."
