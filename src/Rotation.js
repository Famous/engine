'use strict';

var Position = require('./Position');

/**
 * @class Rotation
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Rotation component
 */
function Rotation(dispatch) {
    Position.call(this, dispatch);
}

// Return the definition of the Component Class: 'Rotation'
Rotation.toString = function toString() {
    return 'Rotation';
};

Rotation.prototype = Object.create(Position.prototype);
Rotation.prototype.constructor = Rotation;

// Returns boolean: if true, component is to be updated on next engine tick
Rotation.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setRotation(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Rotation;
