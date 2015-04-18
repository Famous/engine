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

    var initial = node.getAlign();

    this._x.set(initial[0]);
    this._y.set(initial[1]);
    this._z.set(initial[2]);
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

Align.prototype.update = function update() {
    this._node.setAlign(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Align.prototype.onUpdate = Align.prototype.update;

module.exports = Align;
