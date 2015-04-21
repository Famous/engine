'use strict';

var Transitionable = require('famous-transitions').Transitionable;


/**
 * @class Opacity
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Opacity component
 */
function Opacity(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._value = new Transitionable(1);

    this._requestingUpdate = false;
}

/**
*
* returns stringified Opacity
*
* @method
* @return {String} the name of the Component Class: 'Opacity'
*/
Opacity.toString = function toString() {
    return 'Opacity';
};

/**
*
* Retrieves state of Opacity
*
* @method
* @return {Object} contains component key which holds the stringified constructor 
* and value key which contains the numeric value
*/
Opacity.prototype.getValue = function getValue() {
    return {
        component: this.constructor.toString(),
        value: this._value.get()
    };
};

/**
*
* Setter for Opacity state
*
* @method
* @param {Object} state contains component key, which holds stringified constructor, and a value key, which contains a numeric value used to set opacity if the constructor value matches
* @return {Boolean} true if set is successful, false otherwise
*/
Opacity.prototype.setValue = function setValue(value) {
    if (this.constructor.toString() === value.component) {
        this.set(value.value);
        return true;
    }
    return false;
};

/**
*
* Setter for Opacity with callback
*
* @method
* @param {Number} value value used to set Opacity
* @param {Object} options options hash
* @param {Function} callback to be called following Opacity set
* @chainable
*/
Opacity.prototype.set = function set(value, options, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._value.set(value, options, callback);
    return this;
};

/**
*
* Getter for Opacity
*
* @method
* @return {Number}
*/
Opacity.prototype.get = function get() {
    return this._value.get();
};

/**
*
* Stops Opacity transition
*
* @method
* @chainable
*/
Opacity.prototype.halt = function halt() {
    this._value.halt();
    return this;
};

Opacity.prototype.isActive = function isActive(){
    return this._value.isActive();
};

Opacity.prototype.update = function update () {
    this._node.setOpacity(this._value.get());
    if (this._value.isActive()) {
      this._node.requestUpdateOnNextTick(this._id);
    } else {
      this._requestingUpdate = false;
    }
};

Opacity.prototype.onUpdate = Opacity.prototype.update;

module.exports = Opacity;
