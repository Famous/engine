'use strict';

var Position = require('./Position');

function Origin(dispatch) {
    Position.call(this, dispatch);
}

Origin.toString = function toString() {
    return 'Origin';
};

Origin.prototype = Object.create(Position.prototype);
Origin.prototype.constructor = Origin;

Origin.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setOrigin(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Origin;
