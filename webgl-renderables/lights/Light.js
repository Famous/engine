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
 * The blueprint for all light components.
 *
 * @class Light
 * @constructor
 * @component
 *
 * @param {Node} node The controlling node from the corresponding Render Node
 *
 * @return {undefined} undefined
 */
function Light(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._requestingUpdate = false;
    this.queue = [];
    this._color = null;
    this.commands = { color: 'GL_LIGHT_COLOR' };
}

/**
* Changes the color of the light, using the 'Color' utility component.
*
* @method
*
* @param {Color} color Color instance
*
* @return {Light} Light
*/
Light.prototype.setColor = function setColor(color) {
    if (!color.getNormalizedRGB) return false;
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this._color = color;
    this.queue.push(this.commands.color);
    var rgb = this._color.getNormalizedRGB();
    this.queue.push(rgb[0]);
    this.queue.push(rgb[1]);
    this.queue.push(rgb[2]);
    return this;
};

/**
* Returns the current color.

* @method
*
* @returns {Color} Color
*/
Light.prototype.getColor = function getColor() {
    return this._color;
};

/**
* Sends draw commands to the renderer
*
* @private
* @method
*
* @return {undefined} undefined
*/
Light.prototype.onUpdate = function onUpdate() {
    var path = this._node.getLocation();

    this._node
        .sendDrawCommand('WITH')
        .sendDrawCommand(path);

    var i = this.queue.length;
    while (i--) {
        this._node.sendDrawCommand(this.queue.shift());
    }

    if (this._color && this._color.isActive()) {
        this._node.sendDrawCommand(this.commands.color);
        var rgb = this._color.getNormalizedRGB();
        this._node.sendDrawCommand(rgb[0]);
        this._node.sendDrawCommand(rgb[1]);
        this._node.sendDrawCommand(rgb[2]);
        this._node.requestUpdateOnNextTick(this._id);
    }
    else {
        this._requestingUpdate = false;
    }
};

module.exports = Light;
