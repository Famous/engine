'use strict';

var Position = require('./Position');

function MountPoint(dispatch) {
    Position.call(this, dispatch);
}

MountPoint.toString = function toString() {
    return 'MountPoint';
};

MountPoint.prototype = Object.create(Position.prototype);
MountPoint.prototype.constructor = MountPoint;

MountPoint.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setMountPoint(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = MountPoint;
