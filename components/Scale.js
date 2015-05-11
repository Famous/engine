'use strict';

var Position = require('./Position');

/**
 * @class Scale
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Scale component
 */
function Scale(node) {
    Position.call(this, node);
    this._x.set(1);
    this._y.set(1);
    this._z.set(1);
}

/**
*
* stringifies Scale
*
* @method 
* @return {String} the name of the Component Class: 'Scale'
*/
Scale.toString = function toString() {
    return 'Scale';
};

Scale.prototype = Object.create(Position.prototype);
Scale.prototype.constructor = Scale;

Scale.prototype.update = function update() {
    this._node.setScale(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Scale.prototype.onUpdate = Scale.prototype.update;

module.exports = Scale;
