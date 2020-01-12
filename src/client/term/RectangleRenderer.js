"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebglUtils_1 = require("./WebglUtils");
const TypedArrayUtils_1 = require("./common/TypedArrayUtils");
const RenderModel_1 = require("./RenderModel");
const vertexShaderSource = `#version 300 es
layout (location = ${0}) in vec2 a_position;
layout (location = ${1}) in vec2 a_size;
layout (location = ${2}) in vec3 a_color;
layout (location = ${3}) in vec2 a_unitquad;

uniform mat4 u_projection;
uniform vec2 u_resolution;

out vec3 v_color;

void main() {
  vec2 zeroToOne = (a_position + (a_unitquad * a_size)) / u_resolution;
  gl_Position = u_projection * vec4(zeroToOne, 0.0, 1.0);
  v_color = a_color;
}`;
const fragmentShaderSource = `#version 300 es
precision lowp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1);
}`;
const INDICES_PER_RECTANGLE = 8;
const BYTES_PER_RECTANGLE = INDICES_PER_RECTANGLE * Float32Array.BYTES_PER_ELEMENT;
const INITIAL_BUFFER_RECTANGLE_CAPACITY = 20 * INDICES_PER_RECTANGLE;
class RectangleRenderer {
    constructor(_terminal, _colors, _gl, _dimensions) {
        this._terminal = _terminal;
        this._colors = _colors;
        this._gl = _gl;
        this._dimensions = _dimensions;
        this._vertices = {
            count: 0,
            attributes: new Float32Array(INITIAL_BUFFER_RECTANGLE_CAPACITY),
            selection: new Float32Array(3 * INDICES_PER_RECTANGLE)
        };
        const gl = this._gl;
        this._program = WebglUtils_1.throwIfFalsy(WebglUtils_1.createProgram(gl, vertexShaderSource, fragmentShaderSource));
        this._resolutionLocation = WebglUtils_1.throwIfFalsy(gl.getUniformLocation(this._program, 'u_resolution'));
        this._projectionLocation = WebglUtils_1.throwIfFalsy(gl.getUniformLocation(this._program, 'u_projection'));
        this._vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(this._vertexArrayObject);
        const unitQuadVertices = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
        const unitQuadVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, unitQuadVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, unitQuadVertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 2, this._gl.FLOAT, false, 0, 0);
        const unitQuadElementIndices = new Uint8Array([0, 1, 3, 0, 2, 3]);
        const elementIndicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementIndicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, unitQuadElementIndices, gl.STATIC_DRAW);
        this._attributesBuffer = WebglUtils_1.throwIfFalsy(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributesBuffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, BYTES_PER_RECTANGLE, 0);
        gl.vertexAttribDivisor(0, 1);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, BYTES_PER_RECTANGLE, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribDivisor(1, 1);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, BYTES_PER_RECTANGLE, 4 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribDivisor(2, 1);
        this._updateCachedColors();
    }
    render() {
        const gl = this._gl;
        gl.useProgram(this._program);
        gl.bindVertexArray(this._vertexArrayObject);
        gl.uniformMatrix4fv(this._projectionLocation, false, WebglUtils_1.PROJECTION_MATRIX);
        gl.uniform2f(this._resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertices.attributes, gl.DYNAMIC_DRAW);
        gl.drawElementsInstanced(this._gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, this._vertices.count);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertices.selection, gl.DYNAMIC_DRAW);
        gl.drawElementsInstanced(this._gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 3);
    }
    onResize() {
        this._updateViewportRectangle();
    }
    setColors() {
        this._updateCachedColors();
        this._updateViewportRectangle();
    }
    _updateCachedColors() {
        this._bgFloat = this._colorToFloat32Array(this._colors.background);
        this._selectionFloat = this._colorToFloat32Array(this._colors.selectionOpaque);
    }
    _updateViewportRectangle() {
        this._addRectangleFloat(this._vertices.attributes, 0, 0, 0, this._terminal.cols * this._dimensions.scaledCellWidth, this._terminal.rows * this._dimensions.scaledCellHeight, this._bgFloat);
    }
    updateSelection(model, columnSelectMode) {
        const terminal = this._terminal;
        if (!model.hasSelection) {
            TypedArrayUtils_1.fill(this._vertices.selection, 0, 0);
            return;
        }
        if (columnSelectMode) {
            const startCol = model.startCol;
            const width = model.endCol - startCol;
            const height = model.viewportCappedEndRow - model.viewportCappedStartRow + 1;
            this._addRectangleFloat(this._vertices.selection, 0, startCol * this._dimensions.scaledCellWidth, model.viewportCappedStartRow * this._dimensions.scaledCellHeight, width * this._dimensions.scaledCellWidth, height * this._dimensions.scaledCellHeight, this._selectionFloat);
            TypedArrayUtils_1.fill(this._vertices.selection, 0, INDICES_PER_RECTANGLE);
        }
        else {
            const startCol = model.viewportStartRow === model.viewportCappedStartRow ? model.startCol : 0;
            const startRowEndCol = model.viewportCappedStartRow === model.viewportCappedEndRow ? model.endCol : terminal.cols;
            this._addRectangleFloat(this._vertices.selection, 0, startCol * this._dimensions.scaledCellWidth, model.viewportCappedStartRow * this._dimensions.scaledCellHeight, (startRowEndCol - startCol) * this._dimensions.scaledCellWidth, this._dimensions.scaledCellHeight, this._selectionFloat);
            const middleRowsCount = Math.max(model.viewportCappedEndRow - model.viewportCappedStartRow - 1, 0);
            this._addRectangleFloat(this._vertices.selection, INDICES_PER_RECTANGLE, 0, (model.viewportCappedStartRow + 1) * this._dimensions.scaledCellHeight, terminal.cols * this._dimensions.scaledCellWidth, middleRowsCount * this._dimensions.scaledCellHeight, this._selectionFloat);
            if (model.viewportCappedStartRow !== model.viewportCappedEndRow) {
                const endCol = model.viewportEndRow === model.viewportCappedEndRow ? model.endCol : terminal.cols;
                this._addRectangleFloat(this._vertices.selection, INDICES_PER_RECTANGLE * 2, 0, model.viewportCappedEndRow * this._dimensions.scaledCellHeight, endCol * this._dimensions.scaledCellWidth, this._dimensions.scaledCellHeight, this._selectionFloat);
            }
            else {
                TypedArrayUtils_1.fill(this._vertices.selection, 0, INDICES_PER_RECTANGLE * 2);
            }
        }
    }
    updateBackgrounds(model) {
        const terminal = this._terminal;
        const vertices = this._vertices;
        let rectangleCount = 1;
        for (let y = 0; y < terminal.rows; y++) {
            let currentStartX = -1;
            let currentBg = 0;
            let currentFg = 0;
            for (let x = 0; x < terminal.cols; x++) {
                const modelIndex = ((y * terminal.cols) + x) * RenderModel_1.RENDER_MODEL_INDICIES_PER_CELL;
                const bg = model.cells[modelIndex + RenderModel_1.RENDER_MODEL_BG_OFFSET];
                const fg = model.cells[modelIndex + RenderModel_1.RENDER_MODEL_FG_OFFSET];
                if (bg !== currentBg) {
                    if (currentBg !== 0) {
                        const offset = rectangleCount++ * INDICES_PER_RECTANGLE;
                        this._updateRectangle(vertices, offset, currentFg, currentBg, currentStartX, x, y);
                    }
                    currentStartX = x;
                    currentBg = bg;
                    currentFg = fg;
                }
            }
            if (currentBg !== 0) {
                const offset = rectangleCount++ * INDICES_PER_RECTANGLE;
                this._updateRectangle(vertices, offset, currentFg, currentBg, currentStartX, terminal.cols, y);
            }
        }
        vertices.count = rectangleCount;
    }
    _updateRectangle(vertices, offset, fg, bg, startX, endX, y) {
        let rgba;
        const colorMode = bg & 50331648;
        if (fg & 67108864) {
            rgba = this._colors.foreground.rgba;
        }
        else {
            switch (colorMode) {
                case 16777216:
                case 33554432:
                    rgba = this._colors.ansi[bg & 255].rgba;
                    break;
                case 50331648:
                    rgba = (bg & 16777215) << 8;
                    break;
                case 0:
                default:
                    rgba = this._colors.background.rgba;
            }
        }
        if (vertices.attributes.length < offset + 4) {
            vertices.attributes = WebglUtils_1.expandFloat32Array(vertices.attributes, this._terminal.rows * this._terminal.cols * INDICES_PER_RECTANGLE);
        }
        const x1 = startX * this._dimensions.scaledCellWidth;
        const y1 = y * this._dimensions.scaledCellHeight;
        const r = ((rgba >> 24) & 0xFF) / 255;
        const g = ((rgba >> 16) & 0xFF) / 255;
        const b = ((rgba >> 8) & 0xFF) / 255;
        this._addRectangle(vertices.attributes, offset, x1, y1, (endX - startX) * this._dimensions.scaledCellWidth, this._dimensions.scaledCellHeight, r, g, b, 1);
    }
    _addRectangle(array, offset, x1, y1, width, height, r, g, b, a) {
        array[offset] = x1;
        array[offset + 1] = y1;
        array[offset + 2] = width;
        array[offset + 3] = height;
        array[offset + 4] = r;
        array[offset + 5] = g;
        array[offset + 6] = b;
        array[offset + 7] = a;
    }
    _addRectangleFloat(array, offset, x1, y1, width, height, color) {
        array[offset] = x1;
        array[offset + 1] = y1;
        array[offset + 2] = width;
        array[offset + 3] = height;
        array[offset + 4] = color[0];
        array[offset + 5] = color[1];
        array[offset + 6] = color[2];
        array[offset + 7] = color[3];
    }
    _colorToFloat32Array(color) {
        return new Float32Array([
            ((color.rgba >> 24) & 0xFF) / 255,
            ((color.rgba >> 16) & 0xFF) / 255,
            ((color.rgba >> 8) & 0xFF) / 255,
            ((color.rgba) & 0xFF) / 255
        ]);
    }
}
exports.RectangleRenderer = RectangleRenderer;
//# sourceMappingURL=RectangleRenderer.js.map
