/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

function MethodStore () {
    this._events = {};
}

MethodStore.prototype.on = function on (key, cbclass, cbname) {
    var events = this._events[key];
    if (!events) events = [];
    events.push(cbclass, cbname);
    return this;
}

MethodStore.prototype.off = function off (key, cbclass) {
    var events = this._events[key];
    if (events) {
        var index = events.indexOf(cbclass);
        if (index > -1) events.splice(index, 2);
    }
    return this;
}

MethodStore.prototype.trigger = function trigger (key, payload) {
    var events = this._events[key];
    if (events) {
        var i = 0;
        var len = events.length;
        for (; i < len ; i += 2) events[i][events[i + 1]](payload);
    }
    return this;
};

module.exports = MethodStore;
