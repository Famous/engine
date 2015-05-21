/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../transitions/Transitionable');


/**
 * Opacity is a component designed to allow for smooth tweening
 * of the Node's opacity
 *
 * @class Opacity
 *
 * @param {Node} node Node that the Opacity component is attached to
 */
function Opacity(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._value = new Transitionable(1);

    this._requestingUpdate = false;
}

/**
 * Return the name of the Opacity component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Opacity.prototype.toString = function toString() {
    return 'Opacity';
};

/**
 * Retrieves internal state of Opacity component
 *
 * @method
 *
 * @return {Object} contains component key which holds the stringified constructor 
 * and value key which contains the numeric value
 */
Opacity.prototype.getValue = function getValue() {
    return {
        component: this.toString(),
        value: this._value.get()
    };
};

/**
 * Set the internal state of the Opacity component
 *
 * @method
 *
 * @param {Object} value Object containing the component key, which holds stringified constructor, and a value key, which contains a numeric value used to set opacity if the constructor value matches
 *
 * @return {Boolean} true if set is successful, false otherwise
 */
Opacity.prototype.setValue = function setValue(value) {
    if (this.toString() === value.component) {
        this.set(value.value);
        return true;
    }
    return false;
};

/**
 * Set the opacity of the Node
 *
 * @method
 *
 * @param {Number} value value used to set Opacity
 * @param {Object} transition options for the transition
 * @param {Function} callback to be called following Opacity set completion
 *
 * @return {Opacity} this
 */
Opacity.prototype.set = function set(value, transition, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._value.set(value, transition, callback);
    return this;
};

/**
 * Get the current opacity for the component
 *
 * @method
 *
 * @return {Number} opacity as known by the component
 */
Opacity.prototype.get = function get() {
    return this._value.get();
};

/**
 * Stops Opacity transition
 *
 * @method
 *
 * @return {Opacity} this
 */
Opacity.prototype.halt = function halt() {
    this._value.halt();
    return this;
};

/**
 * Tells whether or not the opacity is in a transition
 *
 * @method
 *
 * @return {Boolean} whether or not the opacity is transitioning
 */
Opacity.prototype.isActive = function isActive(){
    return this._value.isActive();
};

/**
 * When the node this component is attached to updates, update the value
 * of the Node's opacity.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Opacity.prototype.update = function update () {
    this._node.setOpacity(this._value.get());
    
    if (this._value.isActive()) {
      this._node.requestUpdateOnNextTick(this._id);
    }
    else {
      this._requestingUpdate = false;
    }
};

Opacity.prototype.onUpdate = Opacity.prototype.update;

module.exports = Opacity;
