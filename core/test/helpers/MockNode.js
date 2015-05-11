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

function MockNode (selector, receivedQueue) {
    this.children = [];
    this.selector = selector;
    this.receivedQueue = receivedQueue;
}

MockNode.prototype.getSelector = function getSelector () {
    return this.selector;
};

MockNode.prototype.getChildren = function getChildren () {
    return this.children;
};

MockNode.prototype.addChild = function addChild (receivedQueue) {
    var node = new MockNode(this.selector + '/' + this.children.length, receivedQueue);
    this.children.push(node);
    return node;
};

MockNode.prototype.getLocation = function getLocation () {
    return this.selector;
};

MockNode.prototype.onReceive = function () {
    this.receivedQueue.push(this);
};

module.exports = MockNode;

