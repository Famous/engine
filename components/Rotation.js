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
 * Rotation is a component that allows the tweening of a Node's rotation. Rotation
 * happens about a Node's origin which is by default [0, 0, .5].
 *
 * @class Rotation
 * @augments Position
 *
 * @param {Node} node Node that the Rotation component will be attached to
 */
function Rotation(node) {
    Position.call(this, node);

    var initial = node.getRotation();

    var x = initial[0];
    var y = initial[1];
    var z = initial[2];
    var w = initial[3];

    var xx = x * x;
    var yy = y * y;
    var zz = z * z;

    var ty = 2 * (x * z + y * w);
    ty = ty < -1 ? -1 : ty > 1 ? 1 : ty;

    var rx = Math.atan2(2 * (x * w - y * z), 1 - 2 * (xx + yy));
    var ry = Math.asin(ty);
    var rz = Math.atan2(2 * (z * w - x * y), 1 - 2 * (yy + zz));

    this._x.set(rx);
    this._y.set(ry);
    this._z.set(rz);
}

/**
 * Return the name of the Rotation component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Rotation.prototype.toString = function toString() {
    return 'Rotation';
};

Rotation.prototype = Object.create(Position.prototype);
Rotation.prototype.constructor = Rotation;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's rotation
 *
 * @method
 *
 * @return {undefined} undefined
 */
Rotation.prototype.update = function update() {
    this._node.setRotation(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Rotation.prototype.onUpdate = Rotation.prototype.update;

module.exports = Rotation;
