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
 * @class Color
 * @constructor
 *
 * @param {Color|String|Array} color Optional argument for setting color using Hex, a Color instance, color name or RGB.
 * @param {Object} transition Optional transition.
 * @param {Function} cb Callback function to be called on completion of the initial transition.
 *
 * @return {undefined} undefined
 */
function Color(color, transition, cb) {
    this._r = new Transitionable(0);
    this._g = new Transitionable(0);
    this._b = new Transitionable(0);
    this._opacity = new Transitionable(1);
    if (color) this.set(color, transition, cb);
}

/**
 * Returns the definition of the Class: 'Color'.
 *
 * @method
 *
 * @return {String} "Color"
 */
Color.prototype.toString = function toString() {
    return 'Color';
};

/**
 * Sets the color. It accepts an optional transition parameter and callback.
 * set(Color, transition, callback)
 * set('#000000', transition, callback)
 * set('black', transition, callback)
 * set([r, g, b], transition, callback)
 *
 * @method
 *
 * @param {Color|String|Array} color Sets color using Hex, a Color instance, color name or RGB.
 * @param {Object} transition Optional transition
 * @param {Function} cb Callback function to be called on completion of the transition.
 *
 * @return {Color} Color
 */
Color.prototype.set = function set(color, transition, cb) {
    switch (Color.determineType(color)) {
        case 'hex': return this.setHex(color, transition, cb);
        case 'colorName': return this.setColor(color, transition, cb);
        case 'instance': return this.changeTo(color, transition, cb);
        case 'rgb': return this.setRGB(color[0], color[1], color[2], transition, cb);
    }
    return this;
};

/**
 * Returns whether Color is still in an animating (transitioning) state.
 *
 * @method
 *
 * @returns {Boolean} Boolean value indicating whether the there is an active transition.
 */
Color.prototype.isActive = function isActive() {
    return this._r.isActive() ||
           this._g.isActive() ||
           this._b.isActive() ||
           this._opacity.isActive();
};

/**
 * Halt transition at current state and erase all pending actions.
 *
 * @method
 *
 * @return {Color} Color
 */
Color.prototype.halt = function halt() {
    this._r.halt();
    this._g.halt();
    this._b.halt();
    this._opacity.halt();
    return this;
};

/**
 * Sets the color values from another Color instance.
 *
 * @method
 *
 * @param {Color} color Color instance.
 * @param {Object} transition Optional transition.
 * @param {Function} cb Optional callback function.
 *
 * @return {Color} Color
 */
Color.prototype.changeTo = function changeTo(color, transition, cb) {
    if (Color.isColorInstance(color)) {
        var rgb = color.getRGB();
        this.setRGB(rgb[0], rgb[1], rgb[2], transition, cb);
    }
    return this;
};

/**
 * Sets the color based on static color names.
 *
 * @method
 *
 * @param {String} name Color name
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setColor = function setColor(name, transition, cb) {
    if (colorNames[name]) {
        this.setHex(colorNames[name], transition, cb);
    }
    return this;
};

/**
 * Returns the color in either RGB or with the requested format.
 *
 * @method
 *
 * @param {String} option Optional argument for determining which type of color to get (default is RGB)
 *
 * @returns {Object} Color in either RGB or specific option value
 */
Color.prototype.getColor = function getColor(option) {
    if (Color.isString(option)) option = option.toLowerCase();
    return (option === 'hex') ? this.getHex() : this.getRGB();
};

/**
 * Sets the R of the Color's RGB
 *
 * @method
 *
 * @param {Number} r R channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setR = function setR(r, transition, cb) {
    this._r.set(r, transition, cb);
    return this;
};

/**
 * Sets the G of the Color's RGB
 *
 * @method
 *
 * @param {Number} g G channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setG = function setG(g, transition, cb) {
    this._g.set(g, transition, cb);
    return this;
};

/**
 * Sets the B of the Color's RGB
 *
 * @method
 *
 * @param {Number} b B channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setB = function setB(b, transition, cb) {
    this._b.set(b, transition, cb);
    return this;
};

/**
 * Sets opacity value
 *
 * @method
 *
 * @param {Number} opacity Opacity value
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setOpacity = function setOpacity(opacity, transition, cb) {
    this._opacity.set(opacity, transition, cb);
    return this;
};

/**
 * Sets RGB
 *
 * @method
 *
 * @param {Number} r R channel of color
 * @param {Number} g G channel of color
 * @param {Number} b B channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setRGB = function setRGB(r, g, b, transition, cb) {
    this.setR(r, transition);
    this.setG(g, transition);
    this.setB(b, transition, cb);
    return this;
};

/**
 * Returns R of RGB
 *
 * @method
 *
 * @returns {Number} R of Color
 */
Color.prototype.getR = function getR() {
    return this._r.get();
};

/**
 * Returns G of RGB
 *
 * @method
 *
 * @returns {Number} G of Color
 */
Color.prototype.getG = function getG() {
    return this._g.get();
};

/**
 * Returns B of RGB
 *
 * @method
 *
 * @returns {Number} B of Color
 */
Color.prototype.getB = function getB() {
    return this._b.get();
};

/**
 * Returns Opacity value
 *
 * @method
 *
 * @returns {Number} Opacity
 */
Color.prototype.getOpacity = function getOpacity() {
    return this._opacity.get();
};

/**
 * Returns RGB
 *
 * @method
 *
 * @returns {Array} RGB
 */
Color.prototype.getRGB = function getRGB() {
    return [this.getR(), this.getG(), this.getB()];
};

/**
 * Returns Normalized RGB
 *
 * @method
 *
 * @returns {Array} Normalized RGB
 */
Color.prototype.getNormalizedRGB = function getNormalizedRGB() {
    var r = this.getR() / 255.0;
    var g = this.getG() / 255.0;
    var b = this.getB() / 255.0;
    return [r, g, b];
};

/**
 * Returns Normalized RGBA
 *
 * @method
 *
 * @returns {Array} Normalized RGBA
 */
Color.prototype.getNormalizedRGBA = function getNormalizedRGB() {
    var r = this.getR() / 255.0;
    var g = this.getG() / 255.0;
    var b = this.getB() / 255.0;
    var opacity = this.getOpacity();
    return [r, g, b, opacity];
};

/**
 * Returns the current color in Hex
 *
 * @method
 *
 * @returns {String} Hex value
 */
Color.prototype.getHex = function getHex() {
    var r = Color.toHex(this.getR());
    var g = Color.toHex(this.getG());
    var b = Color.toHex(this.getB());
    return '#' + r + g + b;
};

/**
 * Sets color using Hex
 *
 * @method
 *
 * @param {String} hex Hex value
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setHex = function setHex(hex, transition, cb) {
    hex = (hex.charAt(0) === '#') ? hex.substring(1, hex.length) : hex;

    if (hex.length === 3) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
    }

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    this.setRGB(r, g, b, transition, cb);
    return this;
};

/**
 * Converts a number to a hex value
 *
 * @method
 *
 * @param {Number} num Number
 *
 * @returns {String} Hex value
 */
Color.toHex = function toHex(num) {
    var hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
};

/**
 * Determines the given input with the appropriate configuration
 *
 * @method
 *
 * @param {Color|String|Array} type Color type
 *
 * @returns {String} Appropriate color type
 */
Color.determineType = function determineType(type) {
    if (Color.isColorInstance(type)) return 'instance';
    if (colorNames[type]) return 'colorName';
    if (Color.isHex(type)) return 'hex';
    if (Array.isArray(type)) return 'rgb';
};

/**
 * Returns a boolean checking whether input is a 'String'
 *
 * @method
 *
 * @param {String} val String value
 *
 * @returns {Boolean} Boolean
 */
Color.isString = function isString(val) {
    return (typeof val === 'string');
};

/**
 * Returns a boolean checking whether string input has a hash (#) symbol
 *
 * @method
 *
 * @param {String} val Value
 *
 * @returns {Boolean} Boolean
 */
Color.isHex = function isHex(val) {
    if (!Color.isString(val)) return false;
    return val[0] === '#';
};

/**
 * Returns boolean whether the input is a Color instance
 *
 * @method
 *
 * @param {Color} val Value
 *
 * @returns {Boolean} Boolean
 */
Color.isColorInstance = function isColorInstance(val) {
    return !!val.getColor;
};

/**
 * Common color names with their associated Hex values
 */
var colorNames = { aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000', blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a', burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b', darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b', darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc', darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b', darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22', fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700', goldenrod: '#daa520', gray: '#808080', green: '#008000', greenyellow: '#adff2f', grey: '#808080', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c', indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa', lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3', lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a', lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32', linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa', mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399', red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090', slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3', white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32' };

module.exports = Color;
