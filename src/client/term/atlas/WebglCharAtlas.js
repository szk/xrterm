"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../atlas/Constants");
const Constants_2 = require("../common/Constants");
const WebglUtils_1 = require("../WebglUtils");
const AttributeData_1 = require("../common/AttributeData");
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 1024;
const TEXTURE_CAPACITY = Math.floor(TEXTURE_HEIGHT * 0.8);
const TRANSPARENT_COLOR = {
    css: 'rgba(0, 0, 0, 0)',
    rgba: 0
};
const NULL_RASTERIZED_GLYPH = {
    offset: { x: 0, y: 0 },
    texturePosition: { x: 0, y: 0 },
    texturePositionClipSpace: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    sizeClipSpace: { x: 0, y: 0 }
};
const TMP_CANVAS_GLYPH_PADDING = 2;
class WebglCharAtlas {
    constructor(document, _config) {
        this._config = _config;
        this._didWarmUp = false;
        this._cacheMap = {};
        this._cacheMapCombined = {};
        this._currentRowY = 0;
        this._currentRowX = 0;
        this._currentRowHeight = 0;
        this.hasCanvasChanged = false;
        this._workBoundingBox = { top: 0, left: 0, bottom: 0, right: 0 };
        this.cacheCanvas = document.createElement('canvas');
        this.cacheCanvas.width = TEXTURE_WIDTH;
        this.cacheCanvas.height = TEXTURE_HEIGHT;
        this._cacheCtx = WebglUtils_1.throwIfFalsy(this.cacheCanvas.getContext('2d', { alpha: true }));
        this._tmpCanvas = document.createElement('canvas');
        this._tmpCanvas.width = this._config.scaledCharWidth * 2 + TMP_CANVAS_GLYPH_PADDING * 2;
        this._tmpCanvas.height = this._config.scaledCharHeight + TMP_CANVAS_GLYPH_PADDING * 2;
        this._tmpCtx = WebglUtils_1.throwIfFalsy(this._tmpCanvas.getContext('2d', { alpha: this._config.allowTransparency }));
        document.body.appendChild(this.cacheCanvas);
    }
    dispose() {
        if (this.cacheCanvas.parentElement) {
            this.cacheCanvas.parentElement.removeChild(this.cacheCanvas);
        }
    }
    warmUp() {
        if (!this._didWarmUp) {
            this._doWarmUp();
            this._didWarmUp = true;
        }
    }
    _doWarmUp() {
        for (let i = 33; i < 126; i++) {
            const rasterizedGlyph = this._drawToCache(i, Constants_2.DEFAULT_COLOR, Constants_2.DEFAULT_COLOR);
            this._cacheMap[i] = {
                [Constants_2.DEFAULT_COLOR]: {
                    [Constants_2.DEFAULT_COLOR]: rasterizedGlyph
                }
            };
        }
    }
    beginFrame() {
        if (this._currentRowY > TEXTURE_CAPACITY) {
            this._cacheCtx.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
            this._cacheMap = {};
            this._currentRowHeight = 0;
            this._currentRowX = 0;
            this._currentRowY = 0;
            this._doWarmUp();
            return true;
        }
        return false;
    }
    getRasterizedGlyphCombinedChar(chars, bg, fg) {
        let rasterizedGlyphSet = this._cacheMapCombined[chars];
        if (!rasterizedGlyphSet) {
            rasterizedGlyphSet = {};
            this._cacheMapCombined[chars] = rasterizedGlyphSet;
        }
        let rasterizedGlyph;
        const rasterizedGlyphSetBg = rasterizedGlyphSet[bg];
        if (rasterizedGlyphSetBg) {
            rasterizedGlyph = rasterizedGlyphSetBg[fg];
        }
        if (!rasterizedGlyph) {
            rasterizedGlyph = this._drawToCache(chars, bg, fg);
            if (!rasterizedGlyphSet[bg]) {
                rasterizedGlyphSet[bg] = {};
            }
            rasterizedGlyphSet[bg][fg] = rasterizedGlyph;
        }
        return rasterizedGlyph;
    }
    getRasterizedGlyph(code, bg, fg) {
        let rasterizedGlyphSet = this._cacheMap[code];
        if (!rasterizedGlyphSet) {
            rasterizedGlyphSet = {};
            this._cacheMap[code] = rasterizedGlyphSet;
        }
        let rasterizedGlyph;
        const rasterizedGlyphSetBg = rasterizedGlyphSet[bg];
        if (rasterizedGlyphSetBg) {
            rasterizedGlyph = rasterizedGlyphSetBg[fg];
        }
        if (!rasterizedGlyph) {
            rasterizedGlyph = this._drawToCache(code, bg, fg);
            if (!rasterizedGlyphSet[bg]) {
                rasterizedGlyphSet[bg] = {};
            }
            rasterizedGlyphSet[bg][fg] = rasterizedGlyph;
        }
        return rasterizedGlyph;
    }
    _getColorFromAnsiIndex(idx) {
        if (idx >= this._config.colors.ansi.length) {
            throw new Error('No color found for idx ' + idx);
        }
        return this._config.colors.ansi[idx];
    }
    _getBackgroundColor(bg, fg) {
        if (this._config.allowTransparency) {
            return TRANSPARENT_COLOR;
        }
        else if (fg & 67108864) {
            return this._config.colors.foreground;
        }
        const colorMode = bg & 50331648;
        switch (colorMode) {
            case 16777216:
            case 33554432:
                return this._getColorFromAnsiIndex(bg & 255);
            case 50331648:
                const rgb = bg & 16777215;
                const arr = AttributeData_1.AttributeData.toColorRGB(rgb);
                return {
                    rgba: rgb << 8,
                    css: `#${toPaddedHex(arr[0])}${toPaddedHex(arr[1])}${toPaddedHex(arr[2])}`
                };
            case 0:
            default:
                return this._config.colors.background;
        }
    }
    _getForegroundCss(fg) {
        if (fg & 67108864) {
            return this._config.colors.background.css;
        }
        const colorMode = fg & 50331648;
        switch (colorMode) {
            case 16777216:
            case 33554432:
                return this._getColorFromAnsiIndex(fg & 255).css;
            case 50331648:
                const rgb = fg & 16777215;
                const arr = AttributeData_1.AttributeData.toColorRGB(rgb);
                return `#${toPaddedHex(arr[0])}${toPaddedHex(arr[1])}${toPaddedHex(arr[2])}`;
            case 0:
            default:
                return this._config.colors.foreground.css;
        }
    }
    _drawToCache(codeOrChars, bg, fg) {
        const chars = typeof codeOrChars === 'number' ? String.fromCharCode(codeOrChars) : codeOrChars;
        this.hasCanvasChanged = true;
        const bold = !!(fg & 134217728);
        const dim = !!(bg & 134217728);
        const italic = !!(bg & 67108864);
        this._tmpCtx.save();
        const backgroundColor = this._getBackgroundColor(bg, fg);
        this._tmpCtx.globalCompositeOperation = 'copy';
        this._tmpCtx.fillStyle = backgroundColor.css;
        this._tmpCtx.fillRect(0, 0, this._tmpCanvas.width, this._tmpCanvas.height);
        this._tmpCtx.globalCompositeOperation = 'source-over';
        const fontWeight = bold ? this._config.fontWeightBold : this._config.fontWeight;
        const fontStyle = italic ? 'italic' : '';
        this._tmpCtx.font =
            `${fontStyle} ${fontWeight} ${this._config.fontSize * this._config.devicePixelRatio}px ${this._config.fontFamily}`;
        this._tmpCtx.textBaseline = 'top';
        this._tmpCtx.fillStyle = this._getForegroundCss(fg);
        if (dim) {
            this._tmpCtx.globalAlpha = Constants_1.DIM_OPACITY;
        }
        this._tmpCtx.fillText(chars, TMP_CANVAS_GLYPH_PADDING, TMP_CANVAS_GLYPH_PADDING);
        this._tmpCtx.restore();
        const imageData = this._tmpCtx.getImageData(0, 0, this._tmpCanvas.width, this._tmpCanvas.height);
        const isEmpty = clearColor(imageData, backgroundColor);
        if (isEmpty) {
            return NULL_RASTERIZED_GLYPH;
        }
        const rasterizedGlyph = this._findGlyphBoundingBox(imageData, this._workBoundingBox);
        const clippedImageData = this._clipImageData(imageData, this._workBoundingBox);
        if (this._currentRowX + this._config.scaledCharWidth > TEXTURE_WIDTH) {
            this._currentRowX = 0;
            this._currentRowY += this._currentRowHeight;
            this._currentRowHeight = 0;
        }
        rasterizedGlyph.texturePosition.x = this._currentRowX;
        rasterizedGlyph.texturePosition.y = this._currentRowY;
        rasterizedGlyph.texturePositionClipSpace.x = this._currentRowX / TEXTURE_WIDTH;
        rasterizedGlyph.texturePositionClipSpace.y = this._currentRowY / TEXTURE_HEIGHT;
        this._currentRowHeight = Math.max(this._currentRowHeight, rasterizedGlyph.size.y);
        this._currentRowX += rasterizedGlyph.size.x;
        this._cacheCtx.putImageData(clippedImageData, rasterizedGlyph.texturePosition.x, rasterizedGlyph.texturePosition.y);
        return rasterizedGlyph;
    }
    _findGlyphBoundingBox(imageData, boundingBox) {
        boundingBox.top = 0;
        let found = false;
        for (let y = 0; y < this._tmpCanvas.height; y++) {
            for (let x = 0; x < this._tmpCanvas.width; x++) {
                const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    boundingBox.top = y;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        boundingBox.left = 0;
        found = false;
        for (let x = 0; x < this._tmpCanvas.width; x++) {
            for (let y = 0; y < this._tmpCanvas.height; y++) {
                const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    boundingBox.left = x;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        boundingBox.right = this._tmpCanvas.width;
        found = false;
        for (let x = this._tmpCanvas.width - 1; x >= 0; x--) {
            for (let y = 0; y < this._tmpCanvas.height; y++) {
                const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    boundingBox.right = x;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        boundingBox.bottom = this._tmpCanvas.height;
        found = false;
        for (let y = this._tmpCanvas.height - 1; y >= 0; y--) {
            for (let x = 0; x < this._tmpCanvas.width; x++) {
                const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    boundingBox.bottom = y;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        return {
            texturePosition: { x: 0, y: 0 },
            texturePositionClipSpace: { x: 0, y: 0 },
            size: {
                x: boundingBox.right - boundingBox.left + 1,
                y: boundingBox.bottom - boundingBox.top + 1
            },
            sizeClipSpace: {
                x: (boundingBox.right - boundingBox.left + 1) / TEXTURE_WIDTH,
                y: (boundingBox.bottom - boundingBox.top + 1) / TEXTURE_HEIGHT
            },
            offset: {
                x: -boundingBox.left + TMP_CANVAS_GLYPH_PADDING,
                y: -boundingBox.top + TMP_CANVAS_GLYPH_PADDING
            }
        };
    }
    _clipImageData(imageData, boundingBox) {
        const width = boundingBox.right - boundingBox.left + 1;
        const height = boundingBox.bottom - boundingBox.top + 1;
        const clippedData = new Uint8ClampedArray(width * height * 4);
        for (let y = boundingBox.top; y <= boundingBox.bottom; y++) {
            for (let x = boundingBox.left; x <= boundingBox.right; x++) {
                const oldOffset = y * this._tmpCanvas.width * 4 + x * 4;
                const newOffset = (y - boundingBox.top) * width * 4 + (x - boundingBox.left) * 4;
                clippedData[newOffset] = imageData.data[oldOffset];
                clippedData[newOffset + 1] = imageData.data[oldOffset + 1];
                clippedData[newOffset + 2] = imageData.data[oldOffset + 2];
                clippedData[newOffset + 3] = imageData.data[oldOffset + 3];
            }
        }
        return new ImageData(clippedData, width, height);
    }
}
exports.WebglCharAtlas = WebglCharAtlas;
function clearColor(imageData, color) {
    let isEmpty = true;
    const r = color.rgba >>> 24;
    const g = color.rgba >>> 16 & 0xFF;
    const b = color.rgba >>> 8 & 0xFF;
    for (let offset = 0; offset < imageData.data.length; offset += 4) {
        if (imageData.data[offset] === r &&
            imageData.data[offset + 1] === g &&
            imageData.data[offset + 2] === b) {
            imageData.data[offset + 3] = 0;
        }
        else {
            isEmpty = false;
        }
    }
    return isEmpty;
}
function toPaddedHex(c) {
    const s = c.toString(16);
    return s.length < 2 ? '0' + s : s;
}
//# sourceMappingURL=WebglCharAtlas.js.map
