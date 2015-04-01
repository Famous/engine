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

/**
*
* stringifies Align
*
* @method
* @return {String} the name of the Component Class: 'Align'
*/
Align.toString = function toString() {
    return Align.toString;
};

Align.prototype = Object.create(Position.prototype);
Align.prototype.constructor = Align;

/**
*
* If true, component is to be updated on next engine tick
*
* @method
* @return {Boolean}
*/
Align.prototype.onUpdate = function onUpdate() {
    this._node.setAlign(this._x.get(), this._y.get(), this._z.get());

    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
};

module.exports = Align;
