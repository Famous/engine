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

/**
 * The Size class is responsible for processing Size from a node
 * @constructor Size
 */
function Size () {
    this._size = new Float32Array(3);
}

// an enumeration of the different types of size modes
Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = Size.RELATIVE;

/**
 * fromSpecWithParent takes the parent node's size, the target node's spec,
 * and a target array to write to. Using the node's size mode it calculates
 * a final size for the node from the node's spec. Returns whether or not
 * the final size has changed from its last value.
 *
 * @param {Array} parentSize parent node's calculated size
 * @param {Node.Spec} node the target node's spec
 * @param {Array} target an array to write the result to
 *
 * @return {Boolean} true if the size of the node has changed.
 */
Size.prototype.fromSpecWithParent = function fromSpecWithParent (parentSize, node, target) {
    var spec = node.getValue().spec;
    var components = node.getComponents();
    var mode = spec.size.sizeMode;
    var prev;
    var changed = false;
    var len = components.length;
    var j;
    for (var i = 0 ; i < 3 ; i++) {
        switch (mode[i]) {
            case Size.RELATIVE:
                prev = target[i];
                target[i] = parentSize[i] * spec.size.proportional[i] + spec.size.differential[i];
                break;
            case Size.ABSOLUTE:
                prev = target[i];
                target[i] = spec.size.absolute[i];
                break;
            case Size.RENDER:
                var candidate;
                var component;
                for (j = 0; j < len ; j++) {
                    component = components[j];
                    if (component && component.getRenderSize) {
                        candidate = component.getRenderSize()[i];
                        prev = target[i];
                        target[i] = target[i] < candidate || target[i] === 0 ? candidate : target[i];
                    }
                }
                break;
        }
        changed = changed || prev !== target[i];
    }
    return changed;
};

module.exports = Size;
