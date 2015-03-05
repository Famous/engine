'use strict';

/**
 * Module dependencies
 */
var Transitionable = require('famous-transitions').Transitionable;


/**
 * Color Constructor
 * Color('rgb', 255, 255, 255) RGB
 * Color('rgb', '255', '255', '255') RGB
 *
 * Color('hsl', '360', '10%', '50%') HSL
 * Color('hsl', 360, '10%', '50%') HSL
 * Color('hsl', '360', '0.5', '0.3') HSL
 *
 * Color('nrgb', 1.0, 0.5, 0.5) Normalized RGB
 * Color('rgb', '1.0', '0.5', '0.5') Normalized RGB
 *
 * Color('#FF00000') HEX
 * Color('beige') Color name
 *
 * Color('rgb(255, 255, 255)') String RGB
 * Color('hsl(360, 10%, 50%)') String HSL
 * Color('rgb(1.0, 0.0, 0.0)') String Normalized RGB
 *
 * Color(otherColor) Color instance
 */
var Color = function Color() {
    this._r = new Transitionable(0);
    this._g = new Transitionable(0);
    this._b = new Transitionable(0);
    var options = _flattenArguments(arguments);
    if (options.length) this.set(options);
};

Color.toString = function toString() {
    return 'Color';
};

Color.prototype.set = function set() {
    var options = _flattenArguments(arguments);
    var type = options[0];

    if (_isColorInstance(type)) {
        var rgb = type.getRGB();
        this.setRGB(rgb, options[1]);
    }
    else if (_isHex(type)) {
        this.setHex(options[1], options[2]);
    }
    else if (_isRGB(type)) {
        this.setRGB(options.slice(1));
    }
    else {
        this.setRGB(options);
    }

    return this;
};

Color.prototype.setR = function setR(r, options) {
    this._r.set(r, options);
    return this;
};

Color.prototype.setG = function setG(g, options) {
    this._g.set(g, options);
    return this;
};

Color.prototype.setB = function setB(b, options) {
    this._b.set(b, options);
    return this;
};

Color.prototype.setRGB = function setRGB() {
    var values = _flattenArguments(arguments);
    var options = values[3];
    this.setR(values[0], options);
    this.setG(values[1], options);
    this.setB(values[2], options);
    return this;
};

Color.prototype.getR = function getR() {
    return this._r.get();
};

Color.prototype.getG = function getG() {
    return this._g.get();
};

Color.prototype.getB = function getB() {
    return this._b.get();
};

Color.prototype.getRGB = function getRGB() {
    return [this.getR(), this.getG(), this.getB()];
};

Color.prototype.isActive = function isActive() {
    return this._r.isActive() || this._g.isActive() || this._b.isActive();
};

Color.prototype.getNormalizedRGB = function getNormalizedRGB() {
    var r = this.getR() / 255.0;
    var g = this.getG() / 255.0;
    var b = this.getB() / 255.0;
    return [r, g, b];
};

Color.prototype.changeTo = function changeTo() {
    var options = _flattenArguments(arguments);
    if (options.length) this.set(options);
    return this;
};

Color.prototype.copy = function copy(color) {
    if (_isColorInstance(color)) {
        this.setRGB(color.getRGB());
    }
    return this;
};

Color.prototype.getRGBString = function toRGBString() {
    var r = this.getR();
    var g = this.getG();
    var b = this.getB();
    return 'rgb('+ r +', '+ g +', '+ b +');';
};

Color.prototype.getBrightness = function getBrightness() {
    var rgb = this.getNormalizedRGB();
    return Math.max(rgb[0], rgb[1], rgb[2]) * 100.0;
};

Color.prototype.getLightness = function getLightness() {
    var rgb = this.getNormalizedRGB();
    var r = rgb[0], g = rgb[1], b = rgb[2];
    return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2.0) * 100.0;
};

Color.prototype.setHex = function setHex(hex, options) {
    hex = (hex.charAt(0) === '#') ? hex.substring(1, hex.length) : hex;

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    this.setRGB(r, g, b, options);
    return this;
};

Color.prototype.clone = function clone() {
    var rgb = this.getRGB();
    return new Color('rgb', rgb[0], rgb[1], rgb[2]);
};

Color.prototype.toHex = function toHex(num) {
    var hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
};

Color.prototype.getHex = function getHex() {
    var r = this.toHex(this.getR());
    var g = this.toHex(this.getG());
    var b = this.toHex(this.getB());
    return '#' + r + g + b;
};

Color.prototype.addRGB = function addRGB(r, g, b) {
    var r = _clamp(this.getR() + r);
    var g = _clamp(this.getG() + g);
    var b = _clamp(this.getB() + b);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.addScalar = function addScalar(s) {
    var r = _clamp(this.getR() + s);
    var g = _clamp(this.getG() + s);
    var b = _clamp(this.getB() + s);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.multiplyRGB = function multiplyRGB(r, g, b) {
    var r = _clamp(this.getR() * r);
    var g = _clamp(this.getG() * g);
    var b = _clamp(this.getB() * b);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.multiplyScalar = function multiplyScalar(s) {
    var r = _clamp(this.getR() * s);
    var g = _clamp(this.getG() * s);
    var b = _clamp(this.getB() * s);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.equals = function equals(color) {
    if (_isColorInstance(color)) {
        return  this.getR() === color.getR() &&
                this.getG() === color.getG() &&
                this.getB() === color.getB();
    }
};


/**
 * Helper functions
 */
function _flattenArguments(options) {
    return Array.prototype.concat.apply([], options);
}

function _argsToArray(val) {
    return Array.prototype.slice.call(val);
}

function _isColorInstance(val) {
    return (val instanceof Color);
}

function _isArray(val) {
    return Array.isArray(val);
}

function _isString(val) {
    return (typeof val === 'string');
};

function _isInt(val) {
    return parseInt(val) === val;
};

function _isFloat(val) {
    return !_isInt(val);
};

function _allFloats() {
    var val = _argsToArray(arguments);
    for(var i = 0; i < val.length; i++) {
        if (!_isFloat(val[i])) return false;
    }
    return true;
};

function _allInts(val) {
    return !_allFloats(val);
};

function _allStrings() {
    var val = _argsToArray(arguments);
    for(var i = 0; i < val.length; i++) {
        if (!_isString(item)) return false;
    }
    return true;
};

function _isPercentage(val) {
    return /%/.test(val);
};

function _isRGB(type) {
    return _isString(type) && type.toLowerCase() === 'rgb';
}

function _isHex(type) {
    return _isString(type) && type.toLowerCase() === 'hex';
}

function _clamp(val, min, max) {
    min = min || 0;
    max = max || 255;
    return Math.max(Math.min(val, max), min);
};


/**
 * Expose
 */
module.exports = Color;
