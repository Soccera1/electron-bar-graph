document.addEventListener("DOMContentLoaded", () => {
  const valuesInput = document.getElementById("valuesInput");
  const labelsInput = document.getElementById("labelsInput");
  const plotButton = document.getElementById("plotButton");
  const canvas = document.getElementById("barGraphCanvas");
  const ctx = canvas.getContext("2d");
  const errorMessageDiv = document.getElementById("errorMessage"); // New: Get error message div

  const displayError = (message) => {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = message ? "block" : "none";
  };

  const parseInputValues = () => {
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
    // New: Added labels parameter
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (dataValues.length === 0) {
      return;
    }

    const topPadding = 30;
    const bottomPadding = 40; // Increased padding for labels
    const sidePadding = 30;

    const graphWidth = canvas.width - 2 * sidePadding;
    const graphHeight = canvas.height - topPadding - bottomPadding; // Adjusted graph height

    const numBars = dataValues.length;
    const barSpacing = 10; // Pixels between bars
    let barWidth;
    if (numBars > 0) {
      const availableWidthForBars = graphWidth - (numBars - 1) * barSpacing;
      barWidth = availableWidthForBars / numBars;
    } else {
      barWidth = 0; // No bars, no width
    }
    if (barWidth <= 0) barWidth = 1; // Ensure minimum bar width

    const maxValue = Math.max(...dataValues);
    const scale = graphHeight / (maxValue > 0 ? maxValue : 1); // Avoid division by zero

    // Draw bars
    ctx.fillStyle = "rgba(52, 152, 219, 0.8)"; // Blue color for bars
    let xOffset = sidePadding;
    for (let i = 0; i < dataValues.length; i++) {
      const value = dataValues[i];
      const barHeight = value * scale;
      ctx.fillRect(
        xOffset,
        canvas.height - bottomPadding - barHeight,
        barWidth,
        barHeight,
      );

      // Draw label for the bar (New logic)
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

    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svgContent += `<rect width="${svgWidth}" height="${svgHeight}" fill="white"/>`;
    
    // Bars
    let xOffset = sidePadding;
    for (let i = 0; i < dataValues.length; i++) {
      const value = dataValues[i];
      const barHeight = value * scale;
      const y = svgHeight - bottomPadding - barHeight;
      
      svgContent += `<rect x="${xOffset}" y="${y}" width="${barWidth}" height="${barHeight}" fill="rgba(52, 152, 219, 0.8)"/>`;
      
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

  // Export button event listeners
  document.getElementById('exportPNG').addEventListener('click', () => exportCanvas('png'));
  document.getElementById('exportJPEG').addEventListener('click', () => exportCanvas('jpeg'));
  document.getElementById('exportWEBP').addEventListener('click', () => exportCanvas('webp'));
  document.getElementById('exportSVG').addEventListener('click', exportSVG);

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
