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

var VoidElements = require('./VoidElements');

/**
 * ElementCache is being used for keeping track of an element's DOM Element,
 * path, world transform, inverted parent, final transform (as being used for
 * setting the actual `transform`-property) and post render size (final size as
 * being rendered to the DOM).
 *
 * @class ElementCache
 *
 * @param {Element} element DOMElement
 * @param {String} path Path used for uniquely identifying the location in the
 *                      scene graph.
 */
function ElementCache (element, path) {
    this.tagName = element.tagName.toLowerCase();
    this.void = VoidElements[this.tagName];

    var constructor = element.constructor;

    this.formElement = constructor === HTMLInputElement ||
        constructor === HTMLTextAreaElement ||
        constructor === HTMLSelectElement;

    this.element = element;
    this.path = path;
    this.content = null;
    this.size = new Int16Array(3);
    this.explicitHeight = false;
    this.explicitWidth = false;
    this.postRenderSize = new Float32Array(2);
    this.listeners = {};
    this.preventDefault = {};
    this.subscribe = {};

    this._resetValues();
}

/**
 * Resets the transform matrices to the identity matrix and size definitions to
 * 0.
 *
 * @method
 *
 * @return {undefined} undefined
 */
ElementCache.prototype._resetValues = function _resetValues() {
    this.content = null;

    this.explicitHeight = false;
    this.explicitWidth = false;

    resetSize(this.size);
    resetSize(this.postRenderSize);
};

/**
 * Resets the underlying element's listeners, unsubscribes from all events and
 * no longer prevents the browser's default action on any event.
 *
 * @method  reset
 *
 * @return {undefined} undefined
 */
ElementCache.prototype.reset = function reset () {
    this._resetValues();

    var key;
    var listener;

    for (key in this.listeners) {
        listener = this.listeners[key];
        this.element.removeEventListener(key, listener);
    }

    for (key in this.preventDefault)
        this.preventDefault[key] = false;

    for (key in this.subscribe)
        this.subscribe[key] = false;
};

/**
 * Resets the passed in size to 0.
 *
 * @private
 *
 * @param {Array} size  The Size array.
 * @return {undefined}  undefined
 */
function resetSize(size) {
    size[0] = 0;
    size[1] = 0;
    size[2] = 0;
}

module.exports = ElementCache;
