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

/**
 * An abstract component meant to be subclassed.
 *
 * @class Component
 * @constructor
 * @abstract
 *
 * @param {Node} [node] Node to which the component should be added.
 */
function Component(node) {
    /** @protected */
    this._node = null;

    /** @protected */
    this._id = null;

    /** @protected */
    this._requestingUpdate = false;

    if (node) this.onAdd(node, node.addComponent(this));
}

/**
 * Method that will be called by the node after the component has been added
 * to it.
 *
 * @method
 * @private
 *
 * @param  {Node} node      Node to which the component has been added.
 * @param  {Number} id      The id under which the component has been
 *                          registered.
 * @return {undefined}      undefined
 */
Component.prototype.onAdd = function onAdd(node, id) {
    // Safety check needed for now to ensure backwards compatibility.
    if (this._node === node && this._id === id) return;

    if (this._node) throw new Error(
        'Can not add component to multiple nodes.'
    );

    this._node = node;
    this._id = id;
};

/**
 * Method that will be called by the node after the component has been added
 * to it.
 *
 * @method
 * @private
 *
 * @param  {Node} node      Node from which the component has been removed.
 * @param  {Number} id      The under which the component has previously been
 *                          registered before being removed.
 * @return {undefined}      undefined
 */
Component.prototype.onRemove = function onRemove(node, id) {
    this._node = null;
    this._id = null;
};

/**
 * Requests a new update from the Node. This results into the component's
 * `onUpdate` method being called on the next
 *
 * @method _requestUpdate
 * @protected
 *
 * @return {undefined} undefined
 */
Component.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate && this.onUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
};

/**
 * A method to be invoked during the node's update phase if an update has been
 * requested previously.
 *
 * @method onUpdate
 * @private
 *
 * @return {undefined} undefined
 */
Component.prototype.onUpdate = function onUpdate () {
    this._requestingUpdate = false;
};

module.exports = Component;
