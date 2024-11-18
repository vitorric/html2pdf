"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    constructor() {
        this.items = [];
    }
    enqueue(item) {
        var _a;
        if (!item.id || !((_a = item.html2pdf) === null || _a === void 0 ? void 0 : _a.html)) {
            return;
        }
        this.items.push(item);
    }
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
}
exports.Queue = Queue;
