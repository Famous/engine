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

function ClassList(element) {
    this._classes = [];
    this._element = element;
}

ClassList.prototype.add = function add(className) {
    this._classes.push(className);

    this._element.className += (' ' + className);
};

function DOMElement(tagName) {
    this.style = {};
    this.tagName = tagName;
    this.className = '';
    this.id = null;
    this._children = [];
    this.classList = new ClassList(this);
}

DOMElement.prototype.appendChild = function(element) {
    return this._children.push(element);
};

function Document() {
    this.body = new DOMElement('body');
}

Document.prototype.createElement = function(tagName) {
    return new DOMElement(tagName);
};

Document.prototype.querySelector = function(selector) {
    var element;
    var target;
    var result;


    switch (selector[0]) {
        case '#': target = 'id'; result = selector.slice(1); break;
        case '.': target = 'class'; result = selector.slice(1); break;
        default:  target = 'tagName'; result = selector; break;
    }

    _traverse(this.body, function(node) {
        if (node[target] === result) element = node;
    });

    return element;
};

function _traverse(node, cb) {
    var i = node._children.length;

    cb(node);

    while (i--) _traverse(node._children[i], cb);
}

module.exports = {
    document: new Document(),
    addEventListener: function() {
    }
};
