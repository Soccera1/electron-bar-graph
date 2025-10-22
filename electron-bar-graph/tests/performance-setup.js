/**
 * Performance test setup for Electron Bar Graph
 * This file is used to set up the environment for performance testing
 */

// Increase memory limits for performance tests
if (process.env.NODE_ENV === 'performance') {
  // Set higher memory limits
  process.env.NODE_OPTIONS = '--max-old-space-size=8192';
  
  // Disable garbage collection during performance tests
  if (global.gc) {
    global.gc();
  }
}

// Performance monitoring utilities
const performanceMonitor = {
  startTime: null,
  memoryUsage: null,
  
  start() {
    this.startTime = process.hrtime.bigint();
    this.memoryUsage = process.memoryUsage();
  },
  
  end() {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - this.startTime) / 1000000; // Convert to milliseconds
    const currentMemory = process.memoryUsage();
    
    return {
      duration,
      memoryDelta: {
        rss: currentMemory.rss - this.memoryUsage.rss,
        heapUsed: currentMemory.heapUsed - this.memoryUsage.heapUsed,
        heapTotal: currentMemory.heapTotal - this.memoryUsage.heapTotal,
        external: currentMemory.external - this.memoryUsage.external
      },
      peakMemory: currentMemory
    };
  }
};

// Performance test data generators
const performanceDataGenerators = {
  // Generate large dataset for testing
  generateLargeDataset(size = 10000) {
    const values = Array.from({ length: size }, (_, i) => Math.random() * 100);
    const labels = Array.from({ length: size }, (_, i) => `Item ${i + 1}`);
    return { values, labels };
  },
  
  // Generate stress test data
  generateStressData(size = 50000) {
    const values = Array.from({ length: size }, (_, i) => Math.random() * 1000);
    const labels = Array.from({ length: size }, (_, i) => `Stress Test Item ${i + 1}`);
    return { values, labels };
  },
  
  // Generate memory-intensive data
  generateMemoryIntensiveData(size = 100000) {
    const values = Array.from({ length: size }, (_, i) => Math.random() * 100);
    const labels = Array.from({ length: size }, (_, i) => `Memory Test Item ${i + 1} with very long label text`);
    return { values, labels };
  }
};

// Performance benchmarks
const performanceBenchmarks = {
  // Expected performance thresholds
  thresholds: {
    dataParsing: 100, // ms for 1000 items
    colorGeneration: 50, // ms for 1000 colors
    canvasDrawing: 200, // ms for 1000 bars
    memoryUsage: 100 * 1024 * 1024, // 100MB max
    totalRenderTime: 500 // ms for complete render
  },
  
  // Check if performance meets thresholds
  checkThreshold(operation, duration, dataSize = 1) {
    const threshold = this.thresholds[operation];
    if (!threshold) return true;
    
    const normalizedDuration = duration / dataSize;
    return normalizedDuration <= threshold;
  },
  
  // Get performance score (0-100)
  getPerformanceScore(operation, duration, dataSize = 1) {
    const threshold = this.thresholds[operation];
    if (!threshold) return 100;
    
    const normalizedDuration = duration / dataSize;
    const score = Math.max(0, 100 - (normalizedDuration / threshold) * 100);
    return Math.round(score);
  }
};

// Memory monitoring utilities
const memoryMonitor = {
  // Get current memory usage
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
    };
  },
  
  // Check for memory leaks
  checkMemoryLeak(initialMemory, currentMemory, threshold = 50) {
    const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
    return memoryIncrease > threshold;
  },
  
  // Force garbage collection if available
  forceGC() {
    if (global.gc) {
      global.gc();
      return true;
    }
    return false;
  }
};

// Performance test helpers
const performanceHelpers = {
  // Run performance test with monitoring
  async runPerformanceTest(testFunction, data, options = {}) {
    const { iterations = 1, warmup = false } = options;
    
    // Warmup run
    if (warmup) {
      await testFunction(data);
    }
    
    // Force garbage collection
    memoryMonitor.forceGC();
    
    // Start monitoring
    performanceMonitor.start();
    const initialMemory = memoryMonitor.getMemoryUsage();
    
    // Run test iterations
    for (let i = 0; i < iterations; i++) {
      await testFunction(data);
    }
    
    // End monitoring
    const results = performanceMonitor.end();
    const finalMemory = memoryMonitor.getMemoryUsage();
    
    return {
      ...results,
      iterations,
      averageDuration: results.duration / iterations,
      memoryLeak: memoryMonitor.checkMemoryLeak(initialMemory, finalMemory),
      initialMemory,
      finalMemory
    };
  },
  
  // Benchmark multiple operations
  async benchmarkOperations(operations, data) {
    const results = {};
    
    for (const [name, operation] of Object.entries(operations)) {
      results[name] = await this.runPerformanceTest(operation, data);
    }
    
    return results;
  }
};

// Export utilities for use in tests
global.performanceMonitor = performanceMonitor;
global.performanceDataGenerators = performanceDataGenerators;
global.performanceBenchmarks = performanceBenchmarks;
global.memoryMonitor = memoryMonitor;
global.performanceHelpers = performanceHelpers;

// Performance test configuration
const performanceConfig = {
  // Test data sizes
  dataSizes: {
    small: 100,
    medium: 1000,
    large: 10000,
    xlarge: 50000
  },
  
  // Performance test iterations
  iterations: {
    fast: 1,
    normal: 3,
    thorough: 10
  },
  
  // Memory thresholds (MB)
  memoryThresholds: {
    low: 50,
    medium: 100,
    high: 200,
    critical: 500
  }
};

// Set up performance test environment
if (process.env.NODE_ENV === 'performance') {
  console.log('🚀 Performance test environment initialized');
  console.log('📊 Memory limits increased for performance testing');
  console.log('⚡ Performance monitoring enabled');
}

module.exports = {
  performanceMonitor,
  performanceDataGenerators,
  performanceBenchmarks,
  memoryMonitor,
  performanceHelpers,
  performanceConfig
};
