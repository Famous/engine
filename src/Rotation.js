'use strict';

var Position = require('./Position');

function Rotation(dispatch) {
    Position.call(this, dispatch);
}

Rotation.toString = function toString() {
    return 'Rotation';
};

Rotation.prototype = Object.create(Position.prototype);
Rotation.prototype.constructor = Rotation;

Rotation.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setRotation(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Rotation;
