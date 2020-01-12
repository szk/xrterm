"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CharAtlasCache_1 = require("../atlas/CharAtlasCache");
const WebglUtils_1 = require("../WebglUtils");
class BaseRenderLayer {
    constructor(_container, id, zIndex, _alpha, _colors) {
        this._container = _container;
        this._alpha = _alpha;
        this._colors = _colors;
        this._scaledCharWidth = 0;
        this._scaledCharHeight = 0;
        this._scaledCellWidth = 0;
        this._scaledCellHeight = 0;
        this._scaledCharLeft = 0;
        this._scaledCharTop = 0;
        this._canvas = document.createElement('canvas');
        this._canvas.classList.add(`xterm-${id}-layer`);
        this._canvas.style.zIndex = zIndex.toString();
        this._initCanvas();
        this._container.appendChild(this._canvas);
    }
    dispose() {
        this._container.removeChild(this._canvas);
        if (this._charAtlas) {
            this._charAtlas.dispose();
        }
    }
    _initCanvas() {
        this._ctx = WebglUtils_1.throwIfFalsy(this._canvas.getContext('2d', { alpha: this._alpha }));
        if (!this._alpha) {
            this._clearAll();
        }
    }
    onOptionsChanged(terminal) { }
    onBlur(terminal) { }
    onFocus(terminal) { }
    onCursorMove(terminal) { }
    onGridChanged(terminal, startRow, endRow) { }
    onSelectionChanged(terminal, start, end, columnSelectMode = false) { }
    setColors(terminal, colorSet) {
        this._refreshCharAtlas(terminal, colorSet);
    }
    _setTransparency(terminal, alpha) {
        if (alpha === this._alpha) {
            return;
        }
        const oldCanvas = this._canvas;
        this._alpha = alpha;
        this._canvas = this._canvas.cloneNode();
        this._initCanvas();
        this._container.replaceChild(this._canvas, oldCanvas);
        this._refreshCharAtlas(terminal, this._colors);
        this.onGridChanged(terminal, 0, terminal.rows - 1);
    }
    _refreshCharAtlas(terminal, colorSet) {
        if (this._scaledCharWidth <= 0 && this._scaledCharHeight <= 0) {
            return;
        }
        this._charAtlas = CharAtlasCache_1.acquireCharAtlas(terminal, colorSet, this._scaledCharWidth, this._scaledCharHeight);
        this._charAtlas.warmUp();
    }
    resize(terminal, dim) {
        this._scaledCellWidth = dim.scaledCellWidth;
        this._scaledCellHeight = dim.scaledCellHeight;
        this._scaledCharWidth = dim.scaledCharWidth;
        this._scaledCharHeight = dim.scaledCharHeight;
        this._scaledCharLeft = dim.scaledCharLeft;
        this._scaledCharTop = dim.scaledCharTop;
        this._canvas.width = dim.scaledCanvasWidth;
        this._canvas.height = dim.scaledCanvasHeight;
        this._canvas.style.width = `${dim.canvasWidth}px`;
        this._canvas.style.height = `${dim.canvasHeight}px`;
        if (!this._alpha) {
            this._clearAll();
        }
        this._refreshCharAtlas(terminal, this._colors);
    }
    _fillCells(x, y, width, height) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
    }
    _fillBottomLineAtCells(x, y, width = 1) {
        this._ctx.fillRect(x * this._scaledCellWidth, (y + 1) * this._scaledCellHeight - window.devicePixelRatio - 1, width * this._scaledCellWidth, window.devicePixelRatio);
    }
    _fillLeftLineAtCell(x, y) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, window.devicePixelRatio, this._scaledCellHeight);
    }
    _strokeRectAtCell(x, y, width, height) {
        this._ctx.lineWidth = window.devicePixelRatio;
        this._ctx.strokeRect(x * this._scaledCellWidth + window.devicePixelRatio / 2, y * this._scaledCellHeight + (window.devicePixelRatio / 2), width * this._scaledCellWidth - window.devicePixelRatio, (height * this._scaledCellHeight) - window.devicePixelRatio);
    }
    _clearAll() {
        if (this._alpha) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    }
    _clearCells(x, y, width, height) {
        if (this._alpha) {
            this._ctx.clearRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
    }
    _fillCharTrueColor(terminal, cell, x, y) {
        this._ctx.font = this._getFont(terminal, false, false);
        this._ctx.textBaseline = 'middle';
        this._clipRow(terminal, y);
        this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight / 2);
    }
    _clipRow(terminal, y) {
        this._ctx.beginPath();
        this._ctx.rect(0, y * this._scaledCellHeight, terminal.cols * this._scaledCellWidth, this._scaledCellHeight);
        this._ctx.clip();
    }
    _getFont(terminal, isBold, isItalic) {
        const fontWeight = isBold ? terminal.getOption('fontWeightBold') : terminal.getOption('fontWeight');
        const fontStyle = isItalic ? 'italic' : '';
        return `${fontStyle} ${fontWeight} ${terminal.getOption('fontSize') * window.devicePixelRatio}px ${terminal.getOption('fontFamily')}`;
    }
}
exports.BaseRenderLayer = BaseRenderLayer;
//# sourceMappingURL=BaseRenderLayer.js.map