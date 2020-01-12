"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function blend(bg, fg) {
    var a = (fg.rgba & 0xFF) / 255;
    if (a === 1) {
        return {
            css: fg.css,
            rgba: fg.rgba
        };
    }
    var fgR = (fg.rgba >> 24) & 0xFF;
    var fgG = (fg.rgba >> 16) & 0xFF;
    var fgB = (fg.rgba >> 8) & 0xFF;
    var bgR = (bg.rgba >> 24) & 0xFF;
    var bgG = (bg.rgba >> 16) & 0xFF;
    var bgB = (bg.rgba >> 8) & 0xFF;
    var r = bgR + Math.round((fgR - bgR) * a);
    var g = bgG + Math.round((fgG - bgG) * a);
    var b = bgB + Math.round((fgB - bgB) * a);
    var css = toCss(r, g, b);
    var rgba = toRgba(r, g, b);
    return { css: css, rgba: rgba };
}
exports.blend = blend;
function fromCss(css) {
    return {
        css: css,
        rgba: (parseInt(css.slice(1), 16) << 8 | 0xFF) >>> 0
    };
}
exports.fromCss = fromCss;
function toPaddedHex(c) {
    var s = c.toString(16);
    return s.length < 2 ? '0' + s : s;
}
exports.toPaddedHex = toPaddedHex;
function toCss(r, g, b) {
    return "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b);
}
exports.toCss = toCss;
function toRgba(r, g, b, a) {
    if (a === void 0) { a = 0xFF; }
    return (r << 24 | g << 16 | b << 8 | a) >>> 0;
}
exports.toRgba = toRgba;
//# sourceMappingURL=Color.js.map