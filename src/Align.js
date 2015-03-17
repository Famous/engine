'use strict';

var Position = require('./Position');

/**
 * @class Align
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Align component
 */

function Align(dispatch) {
    Position.call(this, dispatch);
}

// Return the definition of the Component Class: 'Align'
Align.toString = function toString() {
    return 'Align';
};

Align.prototype = Object.create(Position.prototype);
Align.prototype.constructor = Align;

// Returns boolean: if true, component is to be updated on next engine tick
Align.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setAlign(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Align;
