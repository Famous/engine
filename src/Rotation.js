'use strict';

var Position = require('./Position');

/**
 * @class Rotation
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Rotation component
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
*
* stringifies Rotation
*
* @method
* @return {String} the name of the Component Class: 'Rotation'
*/
Rotation.toString = function toString() {
    return 'Rotation';
};

Rotation.prototype = Object.create(Position.prototype);
Rotation.prototype.constructor = Rotation;

Rotation.prototype.update = function update() {
    this._node.setRotation(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Rotation.prototype.onUpdate = Rotation.prototype.update;

module.exports = Rotation;
