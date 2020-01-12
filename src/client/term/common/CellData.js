"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TextDecoder_1 = require("./TextDecoder");
var Constants_1 = require("./Constants");
var AttributeData_1 = require("./AttributeData");
var CellData = (function (_super) {
    __extends(CellData, _super);
    function CellData() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.content = 0;
        _this.fg = 0;
        _this.bg = 0;
        _this.combinedData = '';
        return _this;
    }
    CellData.fromCharData = function (value) {
        var obj = new CellData();
        obj.setFromCharData(value);
        return obj;
    };
    CellData.prototype.isCombined = function () {
        return this.content & 2097152;
    };
    CellData.prototype.getWidth = function () {
        return this.content >> 22;
    };
    CellData.prototype.getChars = function () {
        if (this.content & 2097152) {
            return this.combinedData;
        }
        if (this.content & 2097151) {
            return TextDecoder_1.stringFromCodePoint(this.content & 2097151);
        }
        return '';
    };
    CellData.prototype.getCode = function () {
        return (this.isCombined())
            ? this.combinedData.charCodeAt(this.combinedData.length - 1)
            : this.content & 2097151;
    };
    CellData.prototype.setFromCharData = function (value) {
        this.fg = value[Constants_1.CHAR_DATA_ATTR_INDEX];
        this.bg = 0;
        var combined = false;
        if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length > 2) {
            combined = true;
        }
        else if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length === 2) {
            var code = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
            if (0xD800 <= code && code <= 0xDBFF) {
                var second = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    this.content = ((code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
                }
                else {
                    combined = true;
                }
            }
            else {
                combined = true;
            }
        }
        else {
            this.content = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
        if (combined) {
            this.combinedData = value[Constants_1.CHAR_DATA_CHAR_INDEX];
            this.content = 2097152 | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
    };
    CellData.prototype.getAsCharData = function () {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    };
    return CellData;
}(AttributeData_1.AttributeData));
exports.CellData = CellData;
//# sourceMappingURL=CellData.js.map
