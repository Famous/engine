'use strict';

var Position = require('./Position');

/**
 * @class MountPoint
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the MountPoint component
 */
function MountPoint(node) {
    Position.call(this, node);

    var initial = node.getMountPoint();

    this._x.set(initial[0]);
    this._y.set(initial[1]);
    this._z.set(initial[2]);
}

/**
*
* Stringifies MountPoint
*
* @method
* @return {String} the name of the Component Class: 'MountPoint'
*/
MountPoint.toString = function toString() {
    return 'MountPoint';
};

MountPoint.prototype = Object.create(Position.prototype);
MountPoint.prototype.constructor = MountPoint;

MountPoint.prototype.update = function update() {
    this._node.setMountPoint(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

MountPoint.prototype.onUpdate = MountPoint.prototype.update;

module.exports = MountPoint;
