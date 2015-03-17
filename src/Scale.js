'use strict';

var Position = require('./Position');

/**
 * @class Scale
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Scale component
 */

function Scale(dispatch) {
    Position.call(this, dispatch);
    this._x.set(1);
    this._y.set(1);
    this._z.set(1);
}

/**
*
* stringifies Scale constructor deinition
*
* @method 
* @return string the definition of the Component Class: 'Scale'
*/
Scale.toString = function toString() {
    return 'Scale';
};

Scale.prototype = Object.create(Position.prototype);
Scale.prototype.constructor = Scale;

/**
*
* If true, component is to be updated on next engine tick
*
* @method
* @return boolean
*/
Scale.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setScale(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

module.exports = Scale;
