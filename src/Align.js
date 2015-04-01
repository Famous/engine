'use strict';

var Position = require('./Position');

/**
 * @class Align
 * @constructor
 * @component
 * @param {LocalDispatch} node LocalDispatch to be retrieved from corresponding Render Node of the Align component
 */

function Align(node) {
    Position.call(this, node);
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

Align.prototype.onUpdate = function onUpdate() {
    this._node.setAlign(this._x.get(), this._y.get(), this._z.get());

    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
};

module.exports = Align;
