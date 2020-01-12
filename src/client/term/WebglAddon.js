"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebglRenderer_1 = require("./WebglRenderer");
class WebglAddon {
    constructor(_preserveDrawingBuffer) {
        this._preserveDrawingBuffer = _preserveDrawingBuffer;
    }
    activate(terminal) {
        if (!terminal.element) {
            throw new Error('Cannot activate WebglAddon before Terminal.open');
        }
        this._terminal = terminal;
        const renderService = terminal._core._renderService;
        const colors = terminal._core._colorManager.colors;
        renderService.setRenderer(new WebglRenderer_1.WebglRenderer(terminal, colors, this._preserveDrawingBuffer));
    }
    dispose() {
        if (!this._terminal) {
            throw new Error('Cannot dispose WebglAddon because it is activated');
        }
        const renderService = this._terminal._core._renderService;
        renderService.setRenderer(this._terminal._core._createRenderer());
        renderService.onResize(this._terminal.cols, this._terminal.rows);
    }
}
exports.WebglAddon = WebglAddon;
//# sourceMappingURL=WebglAddon.js.map