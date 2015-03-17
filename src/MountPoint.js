'use strict';

var Position = require('./Position');

/**
 * @class MountPoint
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the MountPoint component
 */
function MountPoint(dispatch) {
    Position.call(this, dispatch);
}

/**
*
* Stringifies MountPoint constructor
*
* @method
* @return string the definition of the Component Class: 'MountPoint'
*/
MountPoint.toString = function toString() {
    return 'MountPoint';
};

MountPoint.prototype = Object.create(Position.prototype);
MountPoint.prototype.constructor = MountPoint;

/**
*
* If true, component is to be updated on next engine tick
*
* @method
* @return boolean 
*/
MountPoint.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setMountPoint(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = MountPoint;
