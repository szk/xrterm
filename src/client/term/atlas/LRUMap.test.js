"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var LRUMap_1 = require("browser/renderer/atlas/LRUMap");
describe('LRUMap', function () {
    it('can be used to store and retrieve values', function () {
        var map = new LRUMap_1.LRUMap(10);
        map.set(1, 'valuea');
        map.set(2, 'valueb');
        map.set(3, 'valuec');
        chai_1.assert.strictEqual(map.get(1), 'valuea');
        chai_1.assert.strictEqual(map.get(2), 'valueb');
        chai_1.assert.strictEqual(map.get(3), 'valuec');
    });
    it('maintains a size from insertions', function () {
        var map = new LRUMap_1.LRUMap(10);
        chai_1.assert.strictEqual(map.size, 0);
        map.set(1, 'value');
        chai_1.assert.strictEqual(map.size, 1);
        map.set(2, 'value');
        chai_1.assert.strictEqual(map.size, 2);
    });
    it('deletes the oldest entry when the capacity is exceeded', function () {
        var map = new LRUMap_1.LRUMap(4);
        map.set(1, 'value');
        map.set(2, 'value');
        map.set(3, 'value');
        map.set(4, 'value');
        map.set(5, 'value');
        chai_1.assert.isNull(map.get(1));
        chai_1.assert.isNotNull(map.get(2));
        chai_1.assert.isNotNull(map.get(3));
        chai_1.assert.isNotNull(map.get(4));
        chai_1.assert.isNotNull(map.get(5));
        chai_1.assert.strictEqual(map.size, 4);
    });
    it('prevents a recently accessed entry from getting deleted', function () {
        var map = new LRUMap_1.LRUMap(2);
        map.set(1, 'value');
        map.set(2, 'value');
        map.get(1);
        map.set(3, 'value');
        chai_1.assert.isNotNull(map.get(1));
        chai_1.assert.isNull(map.get(2));
        chai_1.assert.isNotNull(map.get(3));
    });
    it('supports mutation', function () {
        var map = new LRUMap_1.LRUMap(10);
        map.set(1, 'oldvalue');
        map.set(1, 'newvalue');
        chai_1.assert.strictEqual(map.size, 1);
        chai_1.assert.strictEqual(map.get(1), 'newvalue');
    });
});
//# sourceMappingURL=LRUMap.test.js.map