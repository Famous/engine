'use strict';

var Position = require('./Position');

function Scale(dispatch) {
    Position.call(this, dispatch);
    this._x.set(1);
    this._y.set(1);
    this._z.set(1);
}

Scale.toString = function toString() {
    return 'Scale';
};

Scale.prototype = Object.create(Position.prototype);
Scale.prototype.constructor = Scale;

Scale.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setScale(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Scale;
