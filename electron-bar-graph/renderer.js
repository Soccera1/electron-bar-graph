/*
 * Electron Bar Graph - A bar graph application using Electron and JavaScript.
 * Copyright (C) 2025
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

document.addEventListener("DOMContentLoaded", () => {
  const valuesInput = document.getElementById("valuesInput");
  const labelsInput = document.getElementById("labelsInput");
  const plotButton = document.getElementById("plotButton");
  const canvas = document.getElementById("barGraphCanvas");
  const ctx = canvas.getContext("2d");
  const errorMessageDiv = document.getElementById("errorMessage");
  
  // Load configuration from config.h if available
  const loadConfiguration = () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(process.cwd(), 'config.h');
      
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Parse EMACS_INTEGRATION
        const emacsMatch = configContent.match(/#define EMACS_INTEGRATION\s+(\d+)/);
        if (emacsMatch) {
          window.EMACS_INTEGRATION = emacsMatch[1] === '1';
        }
        
        // Parse DEBUG
        const debugMatch = configContent.match(/#define DEBUG\s+(\d+)/);
        if (debugMatch) {
          window.DEBUG = debugMatch[1] === '1';
        }
        
        // Parse VERBOSE
        const verboseMatch = configContent.match(/#define VERBOSE\s+(\d+)/);
        if (verboseMatch) {
          window.VERBOSE = verboseMatch[1] === '1';
        }
      } else {
        // Default configuration
        window.EMACS_INTEGRATION = true;
        window.DEBUG = false;
        window.VERBOSE = false;
      }
    } catch (error) {
      console.warn('Could not load configuration:', error.message);
      // Default configuration
      window.EMACS_INTEGRATION = true;
      window.DEBUG = false;
      window.VERBOSE = false;
    }
  };
  
  // Load configuration
  loadConfiguration();
  
  // Show/hide Emacs section based on configuration
  const emacsSection = document.getElementById('emacsSection');
  if (window.EMACS_INTEGRATION) {
    emacsSection.style.display = 'block';
  }
  
  // Color controls
  const colorMode = document.getElementById("colorMode");
  const primaryColor = document.getElementById("primaryColor");
  const secondaryColor = document.getElementById("secondaryColor");
  const secondaryColorLabel = document.getElementById("secondaryColorLabel");
  const customColors = document.getElementById("customColors");
  const customColorsLabel = document.getElementById("customColorsLabel");

  const displayError = (message) => {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = message ? "block" : "none";
  };
  
  // Debug logging function
  const debugLog = (message, ...args) => {
    if (window.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  };
  
  // Verbose logging function
  const verboseLog = (message, ...args) => {
    if (window.VERBOSE) {
      console.log(`[VERBOSE] ${message}`, ...args);
    }
  };

  // Handle color mode changes
  const updateColorControls = () => {
    const mode = colorMode.value;
    
    // Hide all optional controls first
    secondaryColor.style.display = "none";
    secondaryColorLabel.style.display = "none";
    customColors.style.display = "none";
    customColorsLabel.style.display = "none";
    
    // Show relevant controls based on mode
    if (mode === "gradient") {
      secondaryColor.style.display = "inline-block";
      secondaryColorLabel.style.display = "inline-block";
    } else if (mode === "custom") {
      customColors.style.display = "inline-block";
      customColorsLabel.style.display = "inline-block";
    }
  };

  // Generate colors based on mode
  const generateColors = (count) => {
    const mode = colorMode.value;
    const primary = primaryColor.value;
    const secondary = secondaryColor.value;
    
    switch (mode) {
      case "single":
        return Array(count).fill(primary);
        
      case "gradient":
        return generateGradientColors(primary, secondary, count);
        
      case "rainbow":
        return generateRainbowColors(count);
        
      case "custom":
        const customColorList = customColors.value.split(",").map(c => c.trim());
        if (customColorList.length >= count) {
          return customColorList.slice(0, count);
        } else {
          // Repeat colors if not enough provided
          const colors = [];
          for (let i = 0; i < count; i++) {
            colors.push(customColorList[i % customColorList.length]);
          }
          return colors;
        }
        
      default:
        return Array(count).fill(primary);
    }
  };

  const generateGradientColors = (color1, color2, steps) => {
    const colors = [];
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    for (let i = 0; i < steps; i++) {
      const ratio = steps === 1 ? 0 : i / (steps - 1);
      const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
      const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
      const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
  };

  const generateRainbowColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360) / count;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const parseInputValues = () => {
    debugLog("Parsing input values");
    displayError(""); // Clear previous errors
    const valueText = valuesInput.value;
    const labelText = labelsInput.value;

    let dataValues = [];
    let labels = [];

    try {
      dataValues = valueText
        .split(",")
        .map((x) => parseFloat(x.trim()))
        .filter((val) => !isNaN(val));
      dataValues = dataValues.map((val) => Math.max(0, val));

      labels = labelText.split(",").map((x) => x.trim());

      debugLog("Parsed values:", dataValues);
      debugLog("Parsed labels:", labels);

      if (dataValues.length !== labels.length) {
        displayError(
          "Error: Number of values must match the number of labels.",
        );
        return { dataValues: [], labels: [], hasError: true }; // Indicate error
      }
    } catch (e) {
      console.error(
        "Invalid input. Please enter comma-separated numbers and labels.",
        e,
      );
      displayError("Invalid input. Please ensure all values are numbers.");
      dataValues = [];
      labels = [];
      return { dataValues: [], labels: [], hasError: true }; // Indicate error
    }
    return { dataValues, labels, hasError: false };
  };

  const drawGraph = (dataValues, labels) => {
    debugLog("Drawing graph with data:", dataValues, "labels:", labels);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (dataValues.length === 0) {
      debugLog("No data to draw");
      return;
    }

    const topPadding = 30;
    const bottomPadding = 40;
    const sidePadding = 30;

    const graphWidth = canvas.width - 2 * sidePadding;
    const graphHeight = canvas.height - topPadding - bottomPadding;

    const numBars = dataValues.length;
    const barSpacing = 10;
    let barWidth;
    if (numBars > 0) {
      const availableWidthForBars = graphWidth - (numBars - 1) * barSpacing;
      barWidth = availableWidthForBars / numBars;
    } else {
      barWidth = 0;
    }
    if (barWidth <= 0) barWidth = 1;

    const maxValue = Math.max(...dataValues);
    const scale = graphHeight / (maxValue > 0 ? maxValue : 1);

    // Generate colors for bars
    const barColors = generateColors(dataValues.length);

    // Draw bars with custom colors
    let xOffset = sidePadding;
    for (let i = 0; i < dataValues.length; i++) {
      const value = dataValues[i];
      const barHeight = value * scale;
      
      // Set bar color
      ctx.fillStyle = barColors[i];
      ctx.fillRect(
        xOffset,
        canvas.height - bottomPadding - barHeight,
        barWidth,
        barHeight,
      );

      // Draw label for the bar
      if (labels && labels[i] !== undefined) {
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(
          labels[i],
          xOffset + barWidth / 2,
          canvas.height - bottomPadding + 5,
        );
      }
      xOffset += barWidth + barSpacing;
    }

    // Draw X-axis
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sidePadding, canvas.height - bottomPadding);
    ctx.lineTo(canvas.width - sidePadding, canvas.height - bottomPadding);
    ctx.stroke();

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(sidePadding, topPadding);
    ctx.lineTo(sidePadding, canvas.height - bottomPadding);
    ctx.stroke();

    // Label for max value on Y-axis
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(maxValue.toFixed(1), sidePadding - 5, topPadding);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("0", sidePadding - 5, canvas.height - bottomPadding + 5);
  };

  plotButton.addEventListener("click", () => {
    const { dataValues, labels, hasError } = parseInputValues();
    if (!hasError) {
      drawGraph(dataValues, labels);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear graph on error
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  });

  // Export functionality
  const exportCanvas = (format) => {
    let dataURL;
    let filename;
    
    switch (format) {
      case 'png':
        dataURL = canvas.toDataURL('image/png');
        filename = 'bar-graph.png';
        break;
      case 'jpeg':
        dataURL = canvas.toDataURL('image/jpeg', 0.9);
        filename = 'bar-graph.jpg';
        break;
      case 'webp':
        dataURL = canvas.toDataURL('image/webp', 0.9);
        filename = 'bar-graph.webp';
        break;
      default:
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSVG = () => {
    const { dataValues, labels } = parseInputValues();
    if (dataValues.length === 0) return;

    const svgWidth = 760;
    const svgHeight = 400;
    const topPadding = 30;
    const bottomPadding = 40;
    const sidePadding = 30;
    const graphWidth = svgWidth - 2 * sidePadding;
    const graphHeight = svgHeight - topPadding - bottomPadding;

    const numBars = dataValues.length;
    const barSpacing = 10;
    const availableWidthForBars = graphWidth - (numBars - 1) * barSpacing;
    const barWidth = availableWidthForBars / numBars;
    const maxValue = Math.max(...dataValues);
    const scale = graphHeight / (maxValue > 0 ? maxValue : 1);

    // Generate colors for SVG export
    const barColors = generateColors(dataValues.length);

    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="white"/>`;
    
    // Bars with custom colors
    let xOffset = sidePadding;
    for (let i = 0; i < dataValues.length; i++) {
      const value = dataValues[i];
      const barHeight = value * scale;
      const y = svgHeight - bottomPadding - barHeight;
      
      svgContent += `<rect x="${xOffset}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${barColors[i]}"/>`;
      
      // Labels
      if (labels && labels[i] !== undefined) {
        const textX = xOffset + barWidth / 2;
        const textY = svgHeight - bottomPadding + 20;
        svgContent += `<text x="${textX}" y="${textY}" text-anchor="middle" font-family="Arial" font-size="12" fill="black">${labels[i]}</text>`;
      }
      
      xOffset += barWidth + barSpacing;
    }
    
    // Axes
    svgContent += `<line x1="${sidePadding}" y1="${svgHeight - bottomPadding}" x2="${svgWidth - sidePadding}" y2="${svgHeight - bottomPadding}" stroke="black" stroke-width="2"/>`;
    svgContent += `<line x1="${sidePadding}" y1="${topPadding}" x2="${sidePadding}" y2="${svgHeight - bottomPadding}" stroke="black" stroke-width="2"/>`;
    
    // Y-axis labels
    svgContent += `<text x="${sidePadding - 10}" y="${topPadding}" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="black">${maxValue.toFixed(1)}</text>`;
    svgContent += `<text x="${sidePadding - 10}" y="${svgHeight - bottomPadding}" text-anchor="end" dominant-baseline="middle" font-family="Arial" font-size="12" fill="black">0</text>`;
    
    svgContent += '</svg>';
    
    // Download SVG
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'bar-graph.svg';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Event listeners
  colorMode.addEventListener('change', updateColorControls);
  primaryColor.addEventListener('change', () => {
    const { dataValues, labels, hasError } = parseInputValues();
    if (!hasError) drawGraph(dataValues, labels);
  });
  secondaryColor.addEventListener('change', () => {
    const { dataValues, labels, hasError } = parseInputValues();
    if (!hasError) drawGraph(dataValues, labels);
  });
  customColors.addEventListener('input', () => {
    const { dataValues, labels, hasError } = parseInputValues();
    if (!hasError) drawGraph(dataValues, labels);
  });

  // Export button event listeners
  document.getElementById('exportPNG').addEventListener('click', () => exportCanvas('png'));
  document.getElementById('exportJPEG').addEventListener('click', () => exportCanvas('jpeg'));
  document.getElementById('exportWEBP').addEventListener('click', () => exportCanvas('webp'));
  document.getElementById('exportSVG').addEventListener('click', exportSVG);

  // Check if Emacs is installed and available
  const checkEmacsInstallation = () => {
    return new Promise((resolve, reject) => {
      // Check if Emacs integration is enabled
      if (typeof window.EMACS_INTEGRATION !== 'undefined' && !window.EMACS_INTEGRATION) {
        reject(new Error('Emacs integration is disabled'));
        return;
      }
      
      const { spawn } = require('child_process');
      const emacs = spawn('emacs', ['--version'], {
        stdio: 'pipe'
      });
      
      let output = '';
      let error = '';
      
      emacs.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      emacs.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      emacs.on('close', (code) => {
        if (code === 0 && output.includes('GNU Emacs')) {
          resolve(true);
        } else {
          reject(new Error('Emacs not found or not working properly'));
        }
      });
      
      emacs.on('error', (err) => {
        reject(new Error(`Failed to execute emacs: ${err.message}`));
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        emacs.kill();
        reject(new Error('Emacs check timed out'));
      }, 5000);
    });
  };

  // Open in Emacs functionality
  const openInEmacs = async () => {
    verboseLog("Opening in Emacs");
    const { dataValues, labels, hasError } = parseInputValues();
    if (hasError) {
      displayError("Please fix input errors before opening in Emacs.");
      return;
    }

    if (dataValues.length === 0) {
      displayError("No data to display. Please enter some values.");
      return;
    }

    // Check if Emacs is installed first
    try {
      verboseLog("Checking Emacs installation...");
      displayError("Checking Emacs installation...");
      await checkEmacsInstallation();
      verboseLog("Emacs installation check passed");
      displayError(""); // Clear the checking message
    } catch (error) {
      verboseLog("Emacs installation check failed:", error.message);
      displayError(`Emacs not found: ${error.message}. Please install Emacs and ensure it's in your PATH.`);
      return;
    }

    // Create a temporary file with the current data
    const data = {
      values: dataValues,
      labels: labels,
      timestamp: new Date().toISOString()
    };

    // Create a script that will load the bar-graph.el and create the graph
    const emacsScript = `
;; Load the bar graph package
(load-file "${process.cwd()}/bar-graph.el")

;; Set the data
(setq bar-graph-data '(${dataValues.join(' ')}))
(setq bar-graph-labels '(${labels.map(l => `"${l}"`).join(' ')}))

;; Create the ASCII graph
(bar-graph-create-ascii bar-graph-data bar-graph-labels)

;; Switch to the bar graph buffer
(switch-to-buffer "*Bar Graph*")
(bar-graph-mode)

;; Show help message
(message "Bar Graph loaded! Use C-c C-e to export, C-c C-n for new graph")
`;

    // Write the script to a temporary file
    const fs = require('fs');
    const path = require('path');
    const tempScript = path.join(process.cwd(), 'temp-bar-graph.el');
    
    try {
      fs.writeFileSync(tempScript, emacsScript);
      
      // Launch Emacs with the script
      const { spawn } = require('child_process');
      const emacs = spawn('emacs', ['--no-splash', '--load', tempScript], {
        detached: true,
        stdio: 'ignore'
      });
      
      emacs.unref();
      
      // Clean up the temporary file after a delay
      setTimeout(() => {
        try {
          fs.unlinkSync(tempScript);
        } catch (e) {
          console.log('Could not clean up temporary file:', e.message);
        }
      }, 5000);
      
      displayError(""); // Clear any previous errors
      
    } catch (error) {
      displayError(`Error launching Emacs: ${error.message}. Make sure Emacs is installed and in your PATH.`);
    }
  };

  // Open in Emacs button event listener
  document.getElementById('openInEmacs').addEventListener('click', openInEmacs);

  // Initialize color controls
  updateColorControls();

  // Initial plot on load
  const {
    dataValues: initialDataValues,
    labels: initialLabels,
    hasError: initialError,
  } = parseInputValues();
  if (!initialError) {
    drawGraph(initialDataValues, initialLabels);
  }
});
