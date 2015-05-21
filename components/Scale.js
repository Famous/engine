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

var Position = require('./Position');

/**
 * Scale is a component that allows the tweening of a Node's scale. Scale
 * happens about a Node's origin which is by default [0, 0, .5].
 *
 * @class Scale
 * @augments Position
 *
 * @param {Node} node Node that the Scale component will be attached to
 */
function Scale(node) {
    Position.call(this, node);

    this._x.set(1);
    this._y.set(1);
    this._z.set(1);
}

/**
 * Return the name of the Scale component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Scale.prototype.toString = function toString() {
    return 'Scale';
};

Scale.prototype = Object.create(Position.prototype);
Scale.prototype.constructor = Scale;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's scale.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Scale.prototype.update = function update() {
    this._node.setScale(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Scale.prototype.onUpdate = Scale.prototype.update;

module.exports = Scale;
