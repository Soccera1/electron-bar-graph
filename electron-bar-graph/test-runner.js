#!/usr/bin/env bun

/*
 * Electron Bar Graph - Test Runner
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const args = process.argv.slice(2);
const testPattern = args[0] || '';
const coverage = args.includes('--coverage');
const watch = args.includes('--watch');

console.log('🧪 Running Electron Bar Graph Tests\n');

// Build test command
let cmd = ['bun', 'test'];

if (testPattern) {
  cmd.push(testPattern);
}

if (coverage) {
  cmd.push('--coverage');
}

if (watch) {
  cmd.push('--watch');
}

// Run tests
const testProcess = spawn(cmd[0], cmd.slice(1), {
  stdio: 'inherit',
  cwd: process.cwd()
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
    
    if (coverage && existsSync('./coverage')) {
      console.log('\n📊 Coverage report generated in ./coverage/');
    }
  } else {
    console.log('\n❌ Some tests failed.');
    process.exit(code);
  }
});

testProcess.on('error', (error) => {
  console.error('Failed to run tests:', error);
  process.exit(1);
});