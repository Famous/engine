'use strict';

var Position = require('./Position');

/**
 * @class Rotation
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Rotation component
 */
function Rotation(node) {
    Position.call(this, node);
}

/**
*
* stringifies Rotation
*
* @method
* @return {String} the name of the Component Class: 'Rotation'
*/
Rotation.toString = function toString() {
    return 'Rotation';
};

Rotation.prototype = Object.create(Position.prototype);
Rotation.prototype.constructor = Rotation;

Rotation.prototype.onUpdate = function onUpdate() {
    this._node.setRotation(this._x.get(), this._y.get(), this._z.get());
    
    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
};

module.exports = Rotation;
