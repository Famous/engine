'use strict';

/**
 * Module dependencies
 */
var Transitionable = require('famous-transitions').Transitionable;


/**
 * Color constructor
 */
var Color = function Color() {
    var _r = new Transitionable(0);
    var _g = new Transitionable(0);
    var _b = new Transitionable(0);
    var options = _standardizeArguments(arguments);
    if (options.length) this.set(options);
};

Color.prototype.set = function set(options) {
    var type = options[0].toLowerCase();
    var first = options[1];
    var second = options[2];
    var third = options[3];

    switch (type) {
        case 'rgb': this.setRGB(first, second, third); break;
        default console.log("ERROR!");;
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

Color.prototype.setRGB = function setRGB(r, g, b, options) {
    this.setR(r, options);
    this.setG(g, options);
    this.setB(b, options);
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
