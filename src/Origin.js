'use strict';

var Position = require('./Position');

/**
 * @class Origin
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Origin component
 */
function Origin(dispatch) {
    Position.call(this, dispatch);
}


// Return the definition of the Component Class: 'Align'
Origin.toString = function toString() {
    return 'Origin';
};

Origin.prototype = Object.create(Position.prototype);
Origin.prototype.constructor = Origin;

// Returns boolean: if true, component is to be updated on next engine tick
Origin.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setOrigin(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Origin;
