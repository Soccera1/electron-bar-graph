# Electron Bar Graph Application

This is a simple bar graph visualization tool built as an Electron desktop application. It allows you to input comma-separated numerical values and corresponding labels, which are then rendered as a dynamic bar graph using HTML Canvas.

## Features

*   **Input Values**: Enter numerical data points (e.g., `10, 20, 30, 40`).
*   **Input Labels**: Provide corresponding text labels for each bar (e.g., `Item A, Item B, Item C, Item D`).
*   **Dynamic Rendering**: The bar graph updates instantly when you click the "Plot Graph" button.
*   **Canvas-based Drawing**: The graph is drawn using the HTML5 Canvas API.

## Project Structure

*   `main.js`: The main Electron process script. It creates and manages the application window.
*   `index.html`: The user interface for the application, containing input fields, a button, and the HTML Canvas for drawing.
*   `renderer.js`: The renderer process script. It handles parsing user input and drawing the bar graph on the canvas.
*   `style.css`: Provides basic styling for the UI elements.
*   `package.json`: Defines project metadata and dependencies.

## Setup and Running

To get this application running on your system, follow these steps:

1.  **Ensure Bun is Installed**:
    If you don't have Bun installed, you can get it from [bun.sh](https://bun.sh/).

2.  **Navigate to the Project Directory**:
    Open your terminal and change into the `electron-bar-graph` directory:
    ```bash
    cd hc/electron-bar-graph
    ```

3.  **Install Dependencies**:
    Use Bun to install the project dependencies (primarily Electron):
    ```bash
    bun install
    ```

4.  **Run the Application**:
    Start the Electron application using the `start` script defined in `package.json`:
    ```bash
    bun run start
    ```
    This will open a new desktop window with the bar graph application.

## Usage

1.  In the application window, you will see two input fields:
    *   **Enter values (comma-separated)**: Type your numerical data here (e.g., `100, 150, 75, 200`).
    *   **Enter labels (comma-separated)**: Type the labels for each value here (e.g., `Q1 Sales, Q2 Sales, Q3 Sales, Q4 Sales`).
2.  Click the **"Plot Graph"** button.
3.  The bar graph will update to display your entered values with their corresponding labels.