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
define([
  'famous/components/Position'
  ], function ( Position ) {

/**
 * MountPoint is a component designed to allow for smooth tweening
 * of where on the Node it is attached to the parent.
 *
 * @class MountPoint
 * @augments Position
 *
* @param {Node} node Node that the MountPoint component will be attached to
 */
function MountPoint(node) {
    Position.call(this, node);

    var initial = node.getMountPoint();

    this._x.set(initial[0]);
    this._y.set(initial[1]);
    this._z.set(initial[2]);
}

/**
 * Return the name of the MountPoint component
 *
 * @method
 *
 * @return {String} Name of the component
 */
MountPoint.prototype.toString = function toString() {
    return 'MountPoint';
};

MountPoint.prototype = Object.create(Position.prototype);
MountPoint.prototype.constructor = MountPoint;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's mount point.
 *
 * @method
 *
 * @return {undefined} undefined
 */
MountPoint.prototype.update = function update() {
    this._node.setMountPoint(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

MountPoint.prototype.onUpdate = MountPoint.prototype.update;

return MountPoint;
});
