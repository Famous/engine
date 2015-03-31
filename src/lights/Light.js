'use strict';

var Color = require('famous-utilities').Color;

/**
 * The blueprint for all light components for inheriting common functionality.
 *
 * @class Light
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved
 * from the corresponding Render Node
 */
function Light(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this.queue = [];
    this._color = new Color();
    this.commands = { color: '' };
};

/**
* Returns the definition of the Class: 'Light'
*
* @method toString
* @return {string} definition
*/
Light.toString = function toString() {
    return 'Light';
};

/**
* Changes the color of the light, using 'Color' as its helper. It accepts an
* optional transition parameter for tweening colors. Its default parameters are
* in RGB, however, you can also specify different inputs.
*
* setColor(r, g, b, transition, callback)
* setColor('rgb', 0, 0, 0, transition, callback)
* setColor('hsl', 0, 0, 0, transition, callback)
* setColor('hsv', 0, 0, 0, transition, callback)
* setColor('hex', '#000000', transition, callback)
* setColor('#000000', transition, callback)
* setColor('black', transition, callback)
* setColor(Color, transition, callback)
*
* @method setColor
* @param {Number} r Used to set the r value of Color
* @param {Number} g Used to set the g value of Color
* @param {Number} b Used to set the b value of Color
* @param {Object} transition Optional transition argument for tweening colors
* @param {Function} Callback
* @chainable
*/
Light.prototype.setColor = function setColor(type, a, b, c, transition, cb) {
    this._dispatch.dirtyComponent(this._id);
    this._color.set(type, a, b, c, transition, cb);
    this.queue.push(this.commands.color);
    var color = this._color.getNormalizedRGB();
    this.queue.push(color[0]);
    this.queue.push(color[1]);
    this.queue.push(color[2]);
    return this;
};

/**
* Returns the current color value. Defaults to RGB values if no option is
* provided.

* @method getColor
* @param {string} option An optional specification for returning colors in
* different formats: RGB, HSL, Hex, HSV
* @returns {number} value The color value. Defaults to RGB.
*/
Light.prototype.getColor = function getColor(option) {
    return this._color.getColor(option);
};

/**
* Returns boolean: if true, component is to be updated on next engine tick
*
* @private
* @method clean
* @returns {boolean} Boolean
*/
Light.prototype.clean = function clean() {
    var path = this._dispatch.getRenderPath();

    this._dispatch
        .sendDrawCommand('WITH')
        .sendDrawCommand(path)
        .sendDrawCommand('WEBGL');

    var i = this.queue.length;
    while (i--) {
        this._dispatch.sendDrawCommand(this.queue.shift());
    }

    if (this._color.isActive()) {
        this._dispatch.sendDrawCommand(this.commands.color);
        var color = this._color.getNormalizedRGB();
        this._dispatch.sendDrawCommand(color[0]);
        this._dispatch.sendDrawCommand(color[1]);
        this._dispatch.sendDrawCommand(color[2]);
        return true;
    }

    return this.queue.length;
};

module.exports = Light;
