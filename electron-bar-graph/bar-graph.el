;;; bar-graph.el --- A bar graph application for Emacs
;;; Copyright (C) 2025
;;; SPDX-License-Identifier: AGPL-3.0-or-later
;;;
;;; This program is free software: you can redistribute it and/or modify
;;; it under the terms of the GNU Affero General Public License as published
;;; by the Free Software Foundation, either version 3 of the License, or
;;; (at your option) any later version.
;;;
;;; This program is distributed in the hope that it will be useful,
;;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;;; GNU Affero General Public License for more details.
;;;
;;; You should have received a copy of the GNU Affero General Public License
;;; along with this program.  If not, see <https://www.gnu.org/licenses/>.

;;; Commentary:
;;; This is an Emacs version of the Electron Bar Graph application.
;;; It provides ASCII art bar graphs and can export to various formats.

;;; Code:

(require 'cl-lib)

(defgroup bar-graph nil
  "Bar graph visualization in Emacs."
  :group 'applications)

(defcustom bar-graph-width 80
  "Width of the bar graph in characters."
  :type 'integer
  :group 'bar-graph)

(defcustom bar-graph-height 20
  "Height of the bar graph in characters."
  :type 'integer
  :group 'bar-graph)

(defcustom bar-graph-char "█"
  "Character used to draw bars."
  :type 'string
  :group 'bar-graph)

(defcustom bar-graph-colors '("#3498db" "#e74c3c" "#2ecc71" "#f39c12" "#9b59b6" "#1abc9c")
  "List of colors for bars."
  :type '(repeat string)
  :group 'bar-graph)

(defvar bar-graph-data nil
  "Current bar graph data.")

(defvar bar-graph-labels nil
  "Current bar graph labels.")

(defun bar-graph-parse-values (values-string)
  "Parse comma-separated values string into a list of numbers."
  (let ((values (split-string values-string ",")))
    (mapcar (lambda (x) (string-to-number (string-trim x))) values)))

(defun bar-graph-parse-labels (labels-string)
  "Parse comma-separated labels string into a list of strings."
  (mapcar 'string-trim (split-string labels-string ",")))

(defun bar-graph-normalize-data (values)
  "Normalize values to fit within the graph height."
  (let ((max-value (apply 'max values)))
    (if (> max-value 0)
        (mapcar (lambda (x) (* (/ x max-value) bar-graph-height)) values)
      values)))

(defun bar-graph-draw-bar (value label color)
  "Draw a single bar with the given value, label, and color."
  (let ((bar-height (round value)))
    ;; Draw the bar
    (dotimes (i bar-height)
      (insert (propertize bar-graph-char 'face `(:foreground ,color))))
    (insert "\n")
    ;; Draw the label
    (insert (format " %s\n" label))))

(defun bar-graph-create-ascii (values labels)
  "Create ASCII art bar graph from values and labels."
  (let ((normalized-values (bar-graph-normalize-data values))
        (buffer (get-buffer-create "*Bar Graph*")))
    (with-current-buffer buffer
      (erase-buffer)
      (insert "Bar Graph Visualization\n")
      (insert (make-string (+ (length (car (split-string (buffer-string) "\n"))) 2) ?=) "\n\n")
      
      ;; Draw bars
      (cl-mapcar (lambda (value label color)
                   (bar-graph-draw-bar value label color))
                 normalized-values
                 labels
                 (cl-loop for i from 0 below (length values)
                          collect (nth (mod i (length bar-graph-colors)) bar-graph-colors)))
      
      ;; Draw X-axis
      (insert (make-string bar-graph-width ?-))
      (insert "\n")
      
      ;; Add statistics
      (insert (format "\nStatistics:\n"))
      (insert (format "Total: %s\n" (apply '+ values)))
      (insert (format "Average: %.2f\n" (/ (apply '+ values) (length values))))
      (insert (format "Maximum: %s\n" (apply 'max values)))
      (insert (format "Minimum: %s\n" (apply 'min values))))
    
    (switch-to-buffer buffer)
    (goto-char (point-min))))

(defun bar-graph-export-svg (values labels filename)
  "Export bar graph as SVG."
  (let ((svg-width 760)
        (svg-height 400)
        (top-padding 30)
        (bottom-padding 40)
        (side-padding 30)
        (graph-width (- svg-width (* 2 side-padding)))
        (graph-height (- svg-height top-padding bottom-padding))
        (max-value (apply 'max values))
        (scale (/ graph-height max-value))
        (num-bars (length values)))
    
    (with-temp-file filename
      (insert (format "<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">\n" svg-width svg-height))
      (insert "<rect width=\"100%\" height=\"100%\" fill=\"white\"/>\n")
      
      ;; Draw bars
      (let ((bar-width (/ graph-width num-bars))
            (x-offset side-padding))
        (cl-mapcar (lambda (value label color)
                     (let ((bar-height (* value scale)))
                       (insert (format "<rect x=\"%d\" y=\"%d\" width=\"%d\" height=\"%d\" fill=\"%s\"/>\n"
                                       x-offset
                                       (- svg-height bottom-padding bar-height)
                                       bar-width
                                       bar-height
                                       color))
                       (insert (format "<text x=\"%d\" y=\"%d\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"12\" fill=\"black\">%s</text>\n"
                                       (+ x-offset (/ bar-width 2))
                                       (+ svg-height (- bottom-padding) 20)
                                       label))
                       (setq x-offset (+ x-offset bar-width))))
                   values
                   labels
                   (cl-loop for i from 0 below (length values)
                            collect (nth (mod i (length bar-graph-colors)) bar-graph-colors)))
      
      ;; Draw axes
      (insert (format "<line x1=\"%d\" y1=\"%d\" x2=\"%d\" y2=\"%d\" stroke=\"black\" stroke-width=\"2\"/>\n"
                      side-padding (- svg-height bottom-padding)
                      (- svg-width side-padding) (- svg-height bottom-padding)))
      (insert (format "<line x1=\"%d\" y1=\"%d\" x2=\"%d\" y2=\"%d\" stroke=\"black\" stroke-width=\"2\"/>\n"
                      side-padding top-padding
                      side-padding (- svg-height bottom-padding)))
      
      ;; Y-axis labels
      (insert (format "<text x=\"%d\" y=\"%d\" text-anchor=\"end\" dominant-baseline=\"middle\" font-family=\"Arial\" font-size=\"12\" fill=\"black\">%.1f</text>\n"
                      (- side-padding 10) top-padding max-value))
      (insert (format "<text x=\"%d\" y=\"%d\" text-anchor=\"end\" dominant-baseline=\"middle\" font-family=\"Arial\" font-size=\"12\" fill=\"black\">0</text>\n"
                      (- side-padding 10) (- svg-height bottom-padding)))
      
      (insert "</svg>\n")))))

(defun bar-graph-interactive ()
  "Interactive bar graph creation."
  (interactive)
  (let ((values-string (read-string "Enter values (comma-separated): " "10,20,30,40"))
        (labels-string (read-string "Enter labels (comma-separated): " "A,B,C,D")))
    (let ((values (bar-graph-parse-values values-string))
          (labels (bar-graph-parse-labels labels-string)))
      (if (= (length values) (length labels))
          (progn
            (setq bar-graph-data values)
            (setq bar-graph-labels labels)
            (bar-graph-create-ascii values labels))
        (message "Error: Number of values must match number of labels")))))

(defun bar-graph-export-menu ()
  "Export menu for bar graph."
  (interactive)
  (if (and bar-graph-data bar-graph-labels)
      (let ((format (completing-read "Export format: " '("svg" "ascii") nil t)))
        (cond
         ((string= format "svg")
          (let ((filename (read-file-name "Save SVG as: " nil nil nil "bar-graph.svg")))
            (bar-graph-export-svg bar-graph-data bar-graph-labels filename)
            (message "SVG exported to %s" filename)))
         ((string= format "ascii")
          (let ((filename (read-file-name "Save ASCII as: " nil nil nil "bar-graph.txt")))
            (with-temp-file filename
              (insert (with-current-buffer "*Bar Graph*" (buffer-string))))
            (message "ASCII art exported to %s" filename)))))
    (message "No data to export. Create a graph first.")))

(defun bar-graph-mode ()
  "Major mode for bar graph visualization."
  (interactive)
  (kill-all-local-variables)
  (setq major-mode 'bar-graph-mode)
  (setq mode-name "Bar Graph")
  (use-local-map (make-sparse-keymap))
  (define-key (current-local-map) (kbd "C-c C-e") 'bar-graph-export-menu)
  (define-key (current-local-map) (kbd "C-c C-n") 'bar-graph-interactive)
  (run-hooks 'bar-graph-mode-hook))

(provide 'bar-graph)

;;; bar-graph.el ends here
