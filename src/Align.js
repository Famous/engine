'use strict';

var Position = require('./Position');

function Align(dispatch) {
    Position.call(this, dispatch);
}

Align.toString = function toString() {
    return 'Align';
};

Align.prototype = Object.create(Position.prototype);
Align.prototype.constructor = Align;

Align.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setAlign(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Align;
