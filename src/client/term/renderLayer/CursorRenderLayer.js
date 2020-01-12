"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRenderLayer_1 = require("./BaseRenderLayer");
const CellData_1 = require("../common/CellData");
const BLINK_INTERVAL = 600;
class CursorRenderLayer extends BaseRenderLayer_1.BaseRenderLayer {
    constructor(container, zIndex, colors, _onRequestRefreshRowsEvent) {
        super(container, 'cursor', zIndex, true, colors);
        this._onRequestRefreshRowsEvent = _onRequestRefreshRowsEvent;
        this._cell = new CellData_1.CellData();
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
        this._cursorRenderers = {
            'bar': this._renderBarCursor.bind(this),
            'block': this._renderBlockCursor.bind(this),
            'underline': this._renderUnderlineCursor.bind(this)
        };
    }
    resize(terminal, dim) {
        super.resize(terminal, dim);
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
    }
    reset(terminal) {
        this._clearCursor();
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.dispose();
            this.onOptionsChanged(terminal);
        }
    }
    onBlur(terminal) {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.pause();
        }
        this._onRequestRefreshRowsEvent.fire({ start: terminal.buffer.cursorY, end: terminal.buffer.cursorY });
    }
    onFocus(terminal) {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.resume(terminal);
        }
        else {
            this._onRequestRefreshRowsEvent.fire({ start: terminal.buffer.cursorY, end: terminal.buffer.cursorY });
        }
    }
    onOptionsChanged(terminal) {
        var _a;
        if (terminal.getOption('cursorBlink')) {
            if (!this._cursorBlinkStateManager) {
                this._cursorBlinkStateManager = new CursorBlinkStateManager(terminal, () => {
                    this._render(terminal, true);
                });
            }
        }
        else {
            (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.dispose();
            this._cursorBlinkStateManager = undefined;
        }
        this._onRequestRefreshRowsEvent.fire({ start: terminal.buffer.cursorY, end: terminal.buffer.cursorY });
    }
    onCursorMove(terminal) {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.restartBlinkAnimation(terminal);
        }
    }
    onGridChanged(terminal, startRow, endRow) {
        if (!this._cursorBlinkStateManager || this._cursorBlinkStateManager.isPaused) {
            this._render(terminal, false);
        }
        else {
            this._cursorBlinkStateManager.restartBlinkAnimation(terminal);
        }
    }
    _render(terminal, triggeredByAnimationFrame) {
        if (!terminal._core._coreService.isCursorInitialized || terminal._core._coreService.isCursorHidden) {
            this._clearCursor();
            return;
        }
        const cursorY = terminal.buffer.baseY + terminal.buffer.cursorY;
        const viewportRelativeCursorY = cursorY - terminal.buffer.viewportY;
        if (viewportRelativeCursorY < 0 || viewportRelativeCursorY >= terminal.rows) {
            this._clearCursor();
            return;
        }
        terminal._core.buffer.lines.get(cursorY).loadCell(terminal.buffer.cursorX, this._cell);
        if (this._cell.content === undefined) {
            return;
        }
        if (!isTerminalFocused(terminal)) {
            this._clearCursor();
            this._ctx.save();
            this._ctx.fillStyle = this._colors.cursor.css;
            const cursorStyle = terminal.getOption('cursorStyle');
            if (cursorStyle && cursorStyle !== 'block') {
                this._cursorRenderers[cursorStyle](terminal, terminal.buffer.cursorX, viewportRelativeCursorY, this._cell);
            }
            else {
                this._renderBlurCursor(terminal, terminal.buffer.cursorX, viewportRelativeCursorY, this._cell);
            }
            this._ctx.restore();
            this._state.x = terminal.buffer.cursorX;
            this._state.y = viewportRelativeCursorY;
            this._state.isFocused = false;
            this._state.style = cursorStyle;
            this._state.width = this._cell.getWidth();
            return;
        }
        if (this._cursorBlinkStateManager && !this._cursorBlinkStateManager.isCursorVisible) {
            this._clearCursor();
            return;
        }
        if (this._state) {
            if (this._state.x === terminal.buffer.cursorX &&
                this._state.y === viewportRelativeCursorY &&
                this._state.isFocused === isTerminalFocused(terminal) &&
                this._state.style === terminal.getOption('cursorStyle') &&
                this._state.width === this._cell.getWidth()) {
                return;
            }
            this._clearCursor();
        }
        this._ctx.save();
        this._cursorRenderers[terminal.getOption('cursorStyle') || 'block'](terminal, terminal.buffer.cursorX, viewportRelativeCursorY, this._cell);
        this._ctx.restore();
        this._state.x = terminal.buffer.cursorX;
        this._state.y = viewportRelativeCursorY;
        this._state.isFocused = false;
        this._state.style = terminal.getOption('cursorStyle');
        this._state.width = this._cell.getWidth();
    }
    _clearCursor() {
        if (this._state) {
            this._clearCells(this._state.x, this._state.y, this._state.width, 1);
            this._state = {
                x: 0,
                y: 0,
                isFocused: false,
                style: '',
                width: 0
            };
        }
    }
    _renderBarCursor(terminal, x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillLeftLineAtCell(x, y);
        this._ctx.restore();
    }
    _renderBlockCursor(terminal, x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillCells(x, y, cell.getWidth(), 1);
        this._ctx.fillStyle = this._colors.cursorAccent.css;
        this._fillCharTrueColor(terminal, cell, x, y);
        this._ctx.restore();
    }
    _renderUnderlineCursor(terminal, x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillBottomLineAtCells(x, y);
        this._ctx.restore();
    }
    _renderBlurCursor(terminal, x, y, cell) {
        this._ctx.save();
        this._ctx.strokeStyle = this._colors.cursor.css;
        this._strokeRectAtCell(x, y, cell.getWidth(), 1);
        this._ctx.restore();
    }
}
exports.CursorRenderLayer = CursorRenderLayer;
class CursorBlinkStateManager {
    constructor(terminal, _renderCallback) {
        this._renderCallback = _renderCallback;
        this.isCursorVisible = true;
        if (isTerminalFocused(terminal)) {
            this._restartInterval();
        }
    }
    get isPaused() { return !(this._blinkStartTimeout || this._blinkInterval); }
    dispose() {
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    }
    restartBlinkAnimation(terminal) {
        if (this.isPaused) {
            return;
        }
        this._animationTimeRestarted = Date.now();
        this.isCursorVisible = true;
        if (!this._animationFrame) {
            this._animationFrame = window.requestAnimationFrame(() => {
                this._renderCallback();
                this._animationFrame = undefined;
            });
        }
    }
    _restartInterval(timeToStart = BLINK_INTERVAL) {
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
        }
        this._blinkStartTimeout = setTimeout(() => {
            if (this._animationTimeRestarted) {
                const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
                this._animationTimeRestarted = undefined;
                if (time > 0) {
                    this._restartInterval(time);
                    return;
                }
            }
            this.isCursorVisible = false;
            this._animationFrame = window.requestAnimationFrame(() => {
                this._renderCallback();
                this._animationFrame = undefined;
            });
            this._blinkInterval = setInterval(() => {
                if (this._animationTimeRestarted) {
                    const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
                    this._animationTimeRestarted = undefined;
                    this._restartInterval(time);
                    return;
                }
                this.isCursorVisible = !this.isCursorVisible;
                this._animationFrame = window.requestAnimationFrame(() => {
                    this._renderCallback();
                    this._animationFrame = undefined;
                });
            }, BLINK_INTERVAL);
        }, timeToStart);
    }
    pause() {
        this.isCursorVisible = true;
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    }
    resume(terminal) {
        this._animationTimeRestarted = undefined;
        this._restartInterval();
        this.restartBlinkAnimation(terminal);
    }
}
function isTerminalFocused(terminal) {
    return document.activeElement === terminal.textarea && document.hasFocus();
}
//# sourceMappingURL=CursorRenderLayer.js.map
