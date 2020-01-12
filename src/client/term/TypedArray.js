"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function slice(array, start, end) {
    if (array.slice) {
        return array.slice(start, end);
    }
    return sliceFallback(array, start, end);
}
exports.slice = slice;
function sliceFallback(array, start = 0, end = array.length) {
    if (start < 0) {
        start = (array.length + start) % array.length;
    }
    if (end >= array.length) {
        end = array.length;
    }
    else {
        end = (array.length + end) % array.length;
    }
    start = Math.min(start, end);
    const result = new array.constructor(end - start);
    for (let i = 0; i < end - start; ++i) {
        result[i] = array[i + start];
    }
    return result;
}
exports.sliceFallback = sliceFallback;
//# sourceMappingURL=TypedArray.js.map