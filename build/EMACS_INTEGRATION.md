# Emacs Integration for Electron Bar Graph

This document explains how to use the Emacs integration feature of the Electron Bar Graph application.

## Overview

The "Open in Emacs" button allows you to transfer your current bar graph data from the Electron application to Emacs, where you can view it as ASCII art and export it in various formats.

## Prerequisites

- Emacs must be installed on your system
- Emacs must be available in your system PATH
- The `bar-graph.el` file must be in the same directory as the Electron application

## Features

### ASCII Art Visualization
- Displays bar graphs using ASCII characters (█)
- Color-coded bars using Emacs face properties
- Automatic scaling to fit the display

### Interactive Commands
- `C-c C-n`: Create a new bar graph interactively
- `C-c C-e`: Export the current graph (SVG or ASCII)

### Export Options
- **SVG Export**: High-quality vector graphics
- **ASCII Export**: Plain text representation

## Usage

1. Enter your data in the Electron application (values and labels)
2. Click the "Open in Emacs" button
3. Emacs will open with your data displayed as an ASCII bar graph
4. Use the interactive commands to manipulate or export the graph

## File Structure

```
electron-bar-graph/
├── bar-graph.el          # Emacs Lisp package
├── main.js               # Electron main process
├── renderer.js           # Electron renderer process
├── index.html            # Application interface
└── style.css             # Application styling
```

## Troubleshooting

### Emacs Not Found
If you get an error about Emacs not being found:
- Ensure Emacs is installed
- Check that `emacs` command is available in your PATH
- On some systems, you may need to use `emacsclient` instead

### Permission Issues
If you encounter permission issues:
- Ensure the application has write permissions in its directory
- Check that temporary files can be created and deleted

### Data Transfer Issues
If data doesn't transfer correctly:
- Verify that your input data is valid (numbers and labels)
- Check that the number of values matches the number of labels
- Ensure there are no special characters in labels that might break the Emacs script

## Customization

You can customize the Emacs bar graph by modifying the variables in `bar-graph.el`:

- `bar-graph-width`: Width of the graph in characters
- `bar-graph-height`: Height of the graph in characters  
- `bar-graph-char`: Character used to draw bars
- `bar-graph-colors`: List of colors for bars

## License

This integration follows the same AGPL-3.0-or-later license as the main application.
