"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GlyphRenderer_1 = require("./GlyphRenderer");
const LinkRenderLayer_1 = require("./renderLayer/LinkRenderLayer");
const CursorRenderLayer_1 = require("./renderLayer/CursorRenderLayer");
const CharAtlasCache_1 = require("./atlas/CharAtlasCache");
const Constants_1 = require("./atlas/Constants");
const RectangleRenderer_1 = require("./RectangleRenderer");
const RenderModel_1 = require("./RenderModel");
const Lifecycle_1 = require("./common/Lifecycle");
const Constants_2 = require("./common/Constants");
const EventEmitter_1 = require("./common/EventEmitter");
const CellData_1 = require("./common/CellData");
class WebglRenderer extends Lifecycle_1.Disposable {
    constructor(_terminal, _colors, preserveDrawingBuffer) {
        super();
        this._terminal = _terminal;
        this._colors = _colors;
        this._model = new RenderModel_1.RenderModel();
        this._workCell = new CellData_1.CellData();
        this._onRequestRefreshRows = new EventEmitter_1.EventEmitter();
        this._core = this._terminal._core;
        this._renderLayers = [
            new LinkRenderLayer_1.LinkRenderLayer(this._core.screenElement, 2, this._colors, this._core),
            new CursorRenderLayer_1.CursorRenderLayer(this._core.screenElement, 3, this._colors, this._onRequestRefreshRows)
        ];
        this.dimensions = {
            scaledCharWidth: 0,
            scaledCharHeight: 0,
            scaledCellWidth: 0,
            scaledCellHeight: 0,
            scaledCharLeft: 0,
            scaledCharTop: 0,
            scaledCanvasWidth: 0,
            scaledCanvasHeight: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            actualCellWidth: 0,
            actualCellHeight: 0
        };
        this._devicePixelRatio = window.devicePixelRatio;
        this._updateDimensions();
        this._canvas = document.createElement('canvas');
        const contextAttributes = {
            antialias: false,
            depth: false,
            preserveDrawingBuffer
        };
        this._gl = this._canvas.getContext('webgl2', contextAttributes);
        if (!this._gl) {
            throw new Error('WebGL2 not supported');
        }
        this._core.screenElement.appendChild(this._canvas);
        this._rectangleRenderer = new RectangleRenderer_1.RectangleRenderer(this._terminal, this._colors, this._gl, this.dimensions);
        this._glyphRenderer = new GlyphRenderer_1.GlyphRenderer(this._terminal, this._colors, this._gl, this.dimensions);
        this.onCharSizeChanged();
    }
    get onRequestRefreshRows() { return this._onRequestRefreshRows.event; }
    dispose() {
        this._renderLayers.forEach(l => l.dispose());
        this._core.screenElement.removeChild(this._canvas);
        super.dispose();
    }
    setColors(colors) {
        this._colors = colors;
        this._renderLayers.forEach(l => {
            l.setColors(this._terminal, this._colors);
            l.reset(this._terminal);
        });
        this._rectangleRenderer.setColors();
        this._glyphRenderer.setColors();
        this._refreshCharAtlas();
        this._model.clear();
    }
    onDevicePixelRatioChange() {
        if (this._devicePixelRatio !== window.devicePixelRatio) {
            this._devicePixelRatio = window.devicePixelRatio;
            this.onResize(this._terminal.cols, this._terminal.rows);
        }
    }
    onResize(cols, rows) {
        this._updateDimensions();
        this._model.resize(this._terminal.cols, this._terminal.rows);
        this._rectangleRenderer.onResize();
        this._renderLayers.forEach(l => l.resize(this._terminal, this.dimensions));
        this._canvas.width = this.dimensions.scaledCanvasWidth;
        this._canvas.height = this.dimensions.scaledCanvasHeight;
        this._canvas.style.width = `${this.dimensions.canvasWidth}px`;
        this._canvas.style.height = `${this.dimensions.canvasHeight}px`;
        this._core.screenElement.style.width = `${this.dimensions.canvasWidth}px`;
        this._core.screenElement.style.height = `${this.dimensions.canvasHeight}px`;
        this._glyphRenderer.setDimensions(this.dimensions);
        this._glyphRenderer.onResize();
        this._refreshCharAtlas();
        this._model.clear();
    }
    onCharSizeChanged() {
        this.onResize(this._terminal.cols, this._terminal.rows);
    }
    onBlur() {
        this._renderLayers.forEach(l => l.onBlur(this._terminal));
    }
    onFocus() {
        this._renderLayers.forEach(l => l.onFocus(this._terminal));
    }
    onSelectionChanged(start, end, columnSelectMode) {
        this._renderLayers.forEach(l => l.onSelectionChanged(this._terminal, start, end, columnSelectMode));
        this._updateSelectionModel(start, end);
        this._rectangleRenderer.updateSelection(this._model.selection, columnSelectMode);
        this._glyphRenderer.updateSelection(this._model, columnSelectMode);
        this._onRequestRefreshRows.fire({ start: 0, end: this._terminal.rows - 1 });
    }
    onCursorMove() {
        this._renderLayers.forEach(l => l.onCursorMove(this._terminal));
    }
    onOptionsChanged() {
        this._renderLayers.forEach(l => l.onOptionsChanged(this._terminal));
        this._updateDimensions();
        this._refreshCharAtlas();
    }
    _refreshCharAtlas() {
        if (this.dimensions.scaledCharWidth <= 0 && this.dimensions.scaledCharHeight <= 0) {
            return;
        }
        const atlas = CharAtlasCache_1.acquireCharAtlas(this._terminal, this._colors, this.dimensions.scaledCharWidth, this.dimensions.scaledCharHeight);
        if (!('getRasterizedGlyph' in atlas)) {
            throw new Error('The webgl renderer only works with the webgl char atlas');
        }
        this._charAtlas = atlas;
        this._charAtlas.warmUp();
        this._glyphRenderer.setAtlas(this._charAtlas);
    }
    clear() {
        this._renderLayers.forEach(l => l.reset(this._terminal));
    }
    registerCharacterJoiner(handler) {
        return -1;
    }
    deregisterCharacterJoiner(joinerId) {
        return false;
    }
    renderRows(start, end) {
        this._renderLayers.forEach(l => l.onGridChanged(this._terminal, start, end));
        if (this._glyphRenderer.beginFrame()) {
            this._model.clear();
        }
        this._updateModel(start, end);
        this._rectangleRenderer.render();
        this._glyphRenderer.render(this._model, this._model.selection.hasSelection);
    }
    _updateModel(start, end) {
        const terminal = this._core;
        for (let y = start; y <= end; y++) {
            const row = y + terminal.buffer.ydisp;
            const line = terminal.buffer.lines.get(row);
            this._model.lineLengths[y] = 0;
            for (let x = 0; x < terminal.cols; x++) {
                line.loadCell(x, this._workCell);
                const chars = this._workCell.getChars();
                let code = this._workCell.getCode();
                const i = ((y * terminal.cols) + x) * RenderModel_1.RENDER_MODEL_INDICIES_PER_CELL;
                if (code !== Constants_2.NULL_CELL_CODE) {
                    this._model.lineLengths[y] = x + 1;
                }
                let bg = this._workCell.bg;
                let fg = this._workCell.fg;
                if (this._model.cells[i] === code &&
                    this._model.cells[i + RenderModel_1.RENDER_MODEL_BG_OFFSET] === bg &&
                    this._model.cells[i + RenderModel_1.RENDER_MODEL_FG_OFFSET] === fg) {
                    continue;
                }
                if (this._workCell.isInverse()) {
                    const temp = bg;
                    bg = fg;
                    fg = temp;
                    if (fg === Constants_2.DEFAULT_COLOR) {
                        fg = Constants_1.INVERTED_DEFAULT_COLOR;
                    }
                    if (bg === Constants_2.DEFAULT_COLOR) {
                        bg = Constants_1.INVERTED_DEFAULT_COLOR;
                    }
                }
                if (terminal.options.drawBoldTextInBrightColors && this._workCell.isBold() && fg & 134217728 && this._workCell.getFgColor() < 8) {
                    fg += 8;
                }
                if (chars.length > 1) {
                    code = code | RenderModel_1.COMBINED_CHAR_BIT_MASK;
                }
                this._model.cells[i] = code;
                this._model.cells[i + RenderModel_1.RENDER_MODEL_BG_OFFSET] = bg;
                this._model.cells[i + RenderModel_1.RENDER_MODEL_FG_OFFSET] = fg;
                this._glyphRenderer.updateCell(x, y, code, bg, fg, chars);
            }
        }
        this._rectangleRenderer.updateBackgrounds(this._model);
    }
    _updateSelectionModel(start, end) {
        const terminal = this._terminal;
        if (!start || !end || (start[0] === end[0] && start[1] === end[1])) {
            this._model.clearSelection();
            return;
        }
        const viewportStartRow = start[1] - terminal.buffer.viewportY;
        const viewportEndRow = end[1] - terminal.buffer.viewportY;
        const viewportCappedStartRow = Math.max(viewportStartRow, 0);
        const viewportCappedEndRow = Math.min(viewportEndRow, terminal.rows - 1);
        if (viewportCappedStartRow >= terminal.rows || viewportCappedEndRow < 0) {
            this._model.clearSelection();
            return;
        }
        this._model.selection.hasSelection = true;
        this._model.selection.viewportStartRow = viewportStartRow;
        this._model.selection.viewportEndRow = viewportEndRow;
        this._model.selection.viewportCappedStartRow = viewportCappedStartRow;
        this._model.selection.viewportCappedEndRow = viewportCappedEndRow;
        this._model.selection.startCol = start[0];
        this._model.selection.endCol = end[0];
    }
    _updateDimensions() {
        if (!this._core._charSizeService.width || !this._core._charSizeService.height) {
            return;
        }
        this.dimensions.scaledCharWidth = Math.floor(this._core._charSizeService.width * this._devicePixelRatio);
        this.dimensions.scaledCharHeight = Math.ceil(this._core._charSizeService.height * this._devicePixelRatio);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._terminal.getOption('lineHeight'));
        this.dimensions.scaledCharTop = this._terminal.getOption('lineHeight') === 1 ? 0 : Math.round((this.dimensions.scaledCellHeight - this.dimensions.scaledCharHeight) / 2);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._terminal.getOption('letterSpacing'));
        this.dimensions.scaledCharLeft = Math.floor(this._terminal.getOption('letterSpacing') / 2);
        this.dimensions.scaledCanvasHeight = this._terminal.rows * this.dimensions.scaledCellHeight;
        this.dimensions.scaledCanvasWidth = this._terminal.cols * this.dimensions.scaledCellWidth;
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / this._devicePixelRatio);
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / this._devicePixelRatio);
        this.dimensions.actualCellHeight = this.dimensions.scaledCellHeight / this._devicePixelRatio;
        this.dimensions.actualCellWidth = this.dimensions.scaledCellWidth / this._devicePixelRatio;
    }
}
exports.WebglRenderer = WebglRenderer;
//# sourceMappingURL=WebglRenderer.js.map
