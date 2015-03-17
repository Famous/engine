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
* @method
* Return the definition of the Component Class: 'Opacity'
*/
Opacity.toString = function toString() {
    return 'Opacity';
};

/**
* @method
* Returns object containing a component key which holds the stringified constructor, and a value key which contains the numeric value
*/
Opacity.prototype.getState = function getState() {
    return {
        component: this.constructor.toString(),
        value: this._value.get()
    };
};

/** 
* @method
* @param {object} state contains component key, which holds stringified constructor, and a value key, which contains a numeric value used to set opacity if the constructor value matches
* Returns boolean true if set is successful, false otherwise
*/
Opacity.prototype.setState = function setState(state) {
    if (this.constructor.toString() === state.component) {
        this.set(state.value);
        return true;
    }
    return false;
};

/**
* @method
* Returns boolean: if true, component is to be updated on next engine tick
*/
Opacity.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setOpacity(this._value.get());
    return this._value.isActive();
};

/**
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
* @method
* Returns numeric opacity value
*/
Opacity.prototype.get = function get() {
    return this._value.get();
};

/**
* @method
* Stops Opacity transition
* @chainable
*/
Opacity.prototype.halt = function halt() {
    this._value.halt();
    return this;
};

module.exports = Opacity;
