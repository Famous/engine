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


/**
* @method
* Return the definition of the Component Class: 'Origin'
*/
Origin.toString = function toString() {
    return 'Origin';
};

Origin.prototype = Object.create(Position.prototype);
Origin.prototype.constructor = Origin;

/**
* @method
* Returns boolean: if true, component is to be updated on next engine tick
*/
Origin.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setOrigin(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Origin;
