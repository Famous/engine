'use strict';

/**
 * Module dependencies
 */
var Transitionable = require('famous-transitions').Transitionable;


/**
 * Color constructor
 */
var Color = function Color() {
    this._r = new Transitionable(0);
    this._g = new Transitionable(0);
    this._b = new Transitionable(0);
    var options = _standardizeArguments(arguments);
    if (options.length) this.set(options);
};

Color.prototype.set = function set() {
    var options = _standardizeArguments(arguments);
    var type = options[0];
    if (typeof type === 'string' && type.toLowerCase() === 'rgb') {
        this.setRGB(options[1], options[2], options[3], options[4]);
    }
    else {
        this.setRGB(options[0], options[1], options[2], options[3]);
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
    var rgb = _standardizeArguments(arguments);
    var options = rgb[3];
    this.setR(rgb[0], options);
    this.setG(rgb[1], options);
    this.setB(rgb[2], options);
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

Color.prototype.changeTo = function changeTo(color, options) {
    var rgb = (_isColorInstance(color)) ? color.getRGB() : false;
    this.setRGB(rgb[0], rgb[1], rgb[2], options);
};


/**
 * Helper functions
 */
function _standardizeArguments(options) {
    return Array.prototype.concat.apply(Array.prototype, options);
}

function _argsToArray(val) {
    return Array.prototype.slice.call(val);
}

function _isColorInstance(val) {
    return (val instanceof Color);
};


/**
 * Expose
 */
module.exports = Color;
