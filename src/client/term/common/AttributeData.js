"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AttributeData = (function () {
    function AttributeData() {
        this.fg = 0;
        this.bg = 0;
    }
    AttributeData.toColorRGB = function (value) {
        return [
            value >>> 16 & 255,
            value >>> 8 & 255,
            value & 255
        ];
    };
    AttributeData.fromColorRGB = function (value) {
        return (value[0] & 255) << 16 | (value[1] & 255) << 8 | value[2] & 255;
    };
    AttributeData.prototype.clone = function () {
        var newObj = new AttributeData();
        newObj.fg = this.fg;
        newObj.bg = this.bg;
        return newObj;
    };
    AttributeData.prototype.isInverse = function () { return this.fg & 67108864; };
    AttributeData.prototype.isBold = function () { return this.fg & 134217728; };
    AttributeData.prototype.isUnderline = function () { return this.fg & 268435456; };
    AttributeData.prototype.isBlink = function () { return this.fg & 536870912; };
    AttributeData.prototype.isInvisible = function () { return this.fg & 1073741824; };
    AttributeData.prototype.isItalic = function () { return this.bg & 67108864; };
    AttributeData.prototype.isDim = function () { return this.bg & 134217728; };
    AttributeData.prototype.getFgColorMode = function () { return this.fg & 50331648; };
    AttributeData.prototype.getBgColorMode = function () { return this.bg & 50331648; };
    AttributeData.prototype.isFgRGB = function () { return (this.fg & 50331648) === 50331648; };
    AttributeData.prototype.isBgRGB = function () { return (this.bg & 50331648) === 50331648; };
    AttributeData.prototype.isFgPalette = function () { return (this.fg & 50331648) === 16777216 || (this.fg & 50331648) === 33554432; };
    AttributeData.prototype.isBgPalette = function () { return (this.bg & 50331648) === 16777216 || (this.bg & 50331648) === 33554432; };
    AttributeData.prototype.isFgDefault = function () { return (this.fg & 50331648) === 0; };
    AttributeData.prototype.isBgDefault = function () { return (this.bg & 50331648) === 0; };
    AttributeData.prototype.getFgColor = function () {
        switch (this.fg & 50331648) {
            case 16777216:
            case 33554432: return this.fg & 255;
            case 50331648: return this.fg & 16777215;
            default: return -1;
        }
    };
    AttributeData.prototype.getBgColor = function () {
        switch (this.bg & 50331648) {
            case 16777216:
            case 33554432: return this.bg & 255;
            case 50331648: return this.bg & 16777215;
            default: return -1;
        }
    };
    return AttributeData;
}());
exports.AttributeData = AttributeData;
//# sourceMappingURL=AttributeData.js.map