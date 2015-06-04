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

var ONES = [1, 1, 1];
var ZEROS = [0, 0, 0];

/**
 * The Size class is responsible for processing Size from a node
 * @constructor Size
 */
function Size (parent) {

    this.finalSize = new Float32Array(3);
    this.sizeChanged = false;

    this.sizeMode = new Uint8Array(3);
    this.sizeModeChanged = false;

    this.absoluteSize = new Float32Array(3);
    this.absoluteSizeChanged = false;

    this.proportionalSize = new Float32Array(ONES);
    this.proportionalSizeChanged = false;

    this.differentialSize = new Float32Array(3);
    this.differentialSizeChanged = false;

    this.renderSize = new Float32Array(3);
    this.renderSizeChanged = false;

    this.parent = parent != null ? parent : null;
}

// an enumeration of the different types of size modes
Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = Size.RELATIVE;

function _vecOptionalSet (vec, index, val) {
    if (val != null && vec[index] !== val) {
        vec[index] = val;
        return true;
    } else return false;
}

function setVec (vec, x, y, z) {
    var propagate = false;

    propagate = _vecOptionalSet(vec, 0, x) || propagate;
    propagate = _vecOptionalSet(vec, 1, y) || propagate;
    propagate = _vecOptionalSet(vec, 2, z) || propagate;

    return propagate;
}

function resolveSizeMode (val) {
    if (val.constructor === String) {
        switch (val.toLowerCase()) {
            case 'relative':
            case 'default': return Size.RELATIVE;
            case 'absolute': return Size.ABSOLUTE;
            case 'render': return Size.RENDER;
            default: throw new Error('unknown size mode: ' + val);
        }
    }
    else if (val < 0 || val > Size.RENDER) throw new Error('unknown size mode: ' + val);
    return val;
}

Size.prototype.setParent = function setParent (parent) {
    this.parent = parent;
    return this;
};

Size.prototype.getParent = function getParent () {
    return this.parent;
};

Size.prototype.setSizeMode = function setSizeMode (x, y, z) {
    if (x != null) x = resolveSizeMode(x);
    if (y != null) y = resolveSizeMode(y);
    if (z != null) z = resolveSizeMode(z);
    this.sizeModeChanged = setVec(this.sizeMode, x, y, z);
    return this;
};

Size.prototype.getSizeMode = function getSizeMode () {
    return this.sizeMode;
};

Size.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this.absoluteSizeChanged = setVec(this.absoluteSize, x, y, z);
    return this;
};

Size.prototype.getAbsoluteSize = function getAbsoluteSize () {
    return this.absoluteSize;
};

Size.prototype.setProportional = function setProportional (x, y, z) {
    this.proportionalSizeChanged = setVec(this.proportionalSize, x, y, z);
    return this;
};

Size.prototype.getProportionalSize = function getProportionalSize () {
    return this.proportionalSize;
};

Size.prototype.setDifferential = function setDifferential (x, y, z) {
    this.differentialSizeChanged = setVec(this.differentialSize, x, y, z);
    return this;
};

Size.prototype.getDifferential = function getDifferential () {
    return this.differentialSize;
};

Size.prototype.get = function get () {
    return this.finalSize;
};

/**
 * fromSpecWithParent takes the parent node's size, the target node's spec,
 * and a target array to write to. Using the node's size mode it calculates
 * a final size for the node from the node's spec. Returns whether or not
 * the final size has changed from its last value.
 *
 * @method
 *
 * @param {Array} components the node's components
 *
 * @return {Boolean} true if the size of the node has changed.
 */
Size.prototype.fromComponents = function fromComponents (components) {
    var mode = this.sizeMode;
    var target = this.finalSize;
    var parentSize = this.parent ? this.parent.get() : ZEROS;
    var prev;
    var changed = false;
    var len = components.length;
    var j;
    for (var i = 0 ; i < 3 ; i++) {
        prev = target[i];
        switch (mode[i]) {
            case Size.RELATIVE:
                target[i] = parentSize[i] * this.proportionalSize[i] + this.differentialSize[i];
                break;
            case Size.ABSOLUTE:
                target[i] = this.absoluteSize[i];
                break;
            case Size.RENDER:
                var candidate;
                var component;
                for (j = 0; j < len ; j++) {
                    component = components[j];
                    if (component && component.getRenderSize) {
                        candidate = component.getRenderSize()[i];
                        target[i] = target[i] < candidate || target[i] === 0 ? candidate : target[i];
                    }
                }
                break;
        }
        changed = changed || prev !== target[i];
    }
    this.sizeChanged = changed;
    return changed;
};

module.exports = Size;

