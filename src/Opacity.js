'use strict';

var Transitionable = require('famous-transitions').Transitionable;


/**
 * @class Opacity
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Opacity component
 */
function Opacity(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this._value = new Transitionable(1);
}

/**
*
* returns stringified constructor
*
* @method
* @return string the definition of the Component Class: 'Opacity'
*/
Opacity.toString = function toString() {
    return 'Opacity';
};

/**
*
* Retrieves state of Opacity
*
* @method
* @return object containins  component key which holds the stringified constructor, and value key which contains the numeric value
*/
Opacity.prototype.getState = function getState() {
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
* @param {object} state contains component key, which holds stringified constructor, and a value key, which contains a numeric value used to set opacity if the constructor value matches
* @return boolean true if set is successful, false otherwise
*/
Opacity.prototype.setState = function setState(state) {
    if (this.constructor.toString() === state.component) {
        this.set(state.value);
        return true;
    }
    return false;
};

/**
*
* If true, component is to be updated on next engine tick
*
* @method
* @return boolean
*/
Opacity.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setOpacity(this._value.get());
    return this._value.isActive();
};

/**
*
* Setter for Opacity with callback
*
* @method
* @param {number} value value used to set Opacity
* @param {object} options options hash
* @param {function} callback to be called following Opacity set
* @chainable
*/
Opacity.prototype.set = function set(value, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._value.set(value, options, callback);
    return this;
};

/**
*
* Getter for Opacity
*
* @method
* @return number
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

module.exports = Opacity;
