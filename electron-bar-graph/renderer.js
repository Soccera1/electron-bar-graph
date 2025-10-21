document.addEventListener("DOMContentLoaded", () => {
  const valuesInput = document.getElementById("valuesInput");
  const labelsInput = document.getElementById("labelsInput"); // New: Get labels input
  const plotButton = document.getElementById("plotButton");
  const canvas = document.getElementById("barGraphCanvas");
  const ctx = canvas.getContext("2d");

  const parseInputValues = () => {
    const valueText = valuesInput.value;
    const labelText = labelsInput.value; // New: Get label text

    let dataValues = [];
    let labels = [];

    try {
      dataValues = valueText
        .split(",")
        .map((x) => parseFloat(x.trim()))
        .filter((val) => !isNaN(val));
      // Ensure all values are non-negative
      dataValues = dataValues.map((val) => Math.max(0, val));

      labels = labelText.split(",").map((x) => x.trim()); // New: Parse labels
      // Ensure labels array has the same length as dataValues, or is empty if values are empty
      if (dataValues.length !== labels.length) {
        // If lengths mismatch, either truncate labels or extend with empty strings
        if (labels.length > dataValues.length) {
          labels = labels.slice(0, dataValues.length);
        } else if (labels.length < dataValues.length) {
          while (labels.length < dataValues.length) {
            labels.push(""); // Add empty labels
          }
        }
      }
    } catch (e) {
      console.error(
        "Invalid input. Please enter comma-separated numbers and labels.",
        e,
      );
      dataValues = [];
      labels = [];
    }
    return { dataValues, labels }; // New: Return an object with both
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
    const { dataValues, labels } = parseInputValues(); // New: Destructure result
    drawGraph(dataValues, labels); // New: Pass both
  });

  // Initial plot on load
  const { dataValues: initialDataValues, labels: initialLabels } =
    parseInputValues(); // New: Destructure initial result
  drawGraph(initialDataValues, initialLabels); // New: Pass both
});
