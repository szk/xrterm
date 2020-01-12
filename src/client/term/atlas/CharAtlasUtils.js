"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("../common/Constants");
function generateConfig(scaledCharWidth, scaledCharHeight, options, colors) {
    var clonedColors = {
        foreground: colors.foreground,
        background: colors.background,
        cursor: undefined,
        cursorAccent: undefined,
        selection: undefined,
        ansi: colors.ansi.slice(0, 16)
    };
    return {
        devicePixelRatio: window.devicePixelRatio,
        scaledCharWidth: scaledCharWidth,
        scaledCharHeight: scaledCharHeight,
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fontWeightBold: options.fontWeightBold,
        allowTransparency: options.allowTransparency,
        colors: clonedColors
    };
}
exports.generateConfig = generateConfig;
function configEquals(a, b) {
    for (var i = 0; i < a.colors.ansi.length; i++) {
        if (a.colors.ansi[i].rgba !== b.colors.ansi[i].rgba) {
            return false;
        }
    }
    return a.devicePixelRatio === b.devicePixelRatio &&
        a.fontFamily === b.fontFamily &&
        a.fontSize === b.fontSize &&
        a.fontWeight === b.fontWeight &&
        a.fontWeightBold === b.fontWeightBold &&
        a.allowTransparency === b.allowTransparency &&
        a.scaledCharWidth === b.scaledCharWidth &&
        a.scaledCharHeight === b.scaledCharHeight &&
        a.colors.foreground === b.colors.foreground &&
        a.colors.background === b.colors.background;
}
exports.configEquals = configEquals;
function is256Color(colorCode) {
    return colorCode < Constants_1.DEFAULT_COLOR;
}
exports.is256Color = is256Color;
//# sourceMappingURL=CharAtlasUtils.js.map
