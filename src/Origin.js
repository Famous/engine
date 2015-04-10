'use strict';

var Position = require('./Position');

/**
 * @class Origin
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Origin component
 */
function Origin(node) {
    Position.call(this, node);
}


/**
*
* returns stringified Origin
*
* @method
* @return {String} the name of the Component Class: 'Origin'
*/
Origin.toString = function toString() {
    return 'Origin';
};

Origin.prototype = Object.create(Position.prototype);
Origin.prototype.constructor = Origin;

Origin.prototype.onUpdate = function onUpdate() {
    this._node.setOrigin(this._x.get(), this._y.get(), this._z.get());
    
    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
};


module.exports = Origin;
