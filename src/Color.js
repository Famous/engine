'use strict';

/**
 * Module dependencies
 */
var Transitionable = require('famous-transitions').Transitionable;


/**
 * Color
 * Accepts RGB, HSL, HEX with getters and setters
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
    else if (_isType('hex', type)) {
        this.setHex(options[1], options[2]);
    }
    else if (_isType('rgb', type)) {
        this.setRGB(options.slice(1));
    }
    else if (_isType('hsl', type)) {
        this.setHSL(options.slice(1));
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
    return false;
};

Color.prototype.copyGammaToLinear = function copyGammaToLinear(color) {
    if (_isColorInstance(color)) {
        var r = color.getR();
        var g = color.getG();
        var b = color.getB();
        this.setRGB(r*r, g*g, b*b);
    }
    return this;
};

Color.prototype.convertGammaToLinear = function convertGammaToLinear() {
    var r = this.getR();
    var g = this.getG();
    var b = this.getB();
    this.setRGB(r*r, g*g, b*b);
    return this;
};

Color.prototype.addColors = function addColors(color1, color2) {
    var r = color1.getR() + color2.getR();
    var g = color1.getG() + color2.getG();
    var b = color1.getB() + color2.getB();
    return [r, g, b];
};

Color.prototype.hueToRGB = function hueToRGB(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

Color.prototype.setHSL = function setHSL(h, s, l, options) {
    h /= 360.0;
    s /= 100.0;
    l /= 100.0;
    var r, g, b;
    if (s === 0) {
        r = g = b = l;
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = this.hueToRGB(p, q, h + 1/3);
        g = this.hueToRGB(p, q, h);
        b = this.hueToRGB(p, q, h - 1/3);
    }
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    this.setRGB(r, g, b, options);
    return this;
};

Color.prototype.getHSL = function getHSL() {
    var rgb = this.getNormalizedRGB();
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }
    return [h, s*100, l*100];
};

Color.prototype.getHue = function getHue() {
    var hsl = this.getHSL();
    return hsl[0];
};

Color.prototype.setHue = function setHue(h, options) {
    var hsl = this.getHSL();
    this.setHSL(h, hsl[1], hsl[2], options);
    return this;
};

Color.prototype.getSaturation = function getSaturation() {
    var hsl = this.getHSL();
    return hsl[1];
};

Color.prototype.setSaturation = function setSaturation(s, options) {
    var hsl = this.getHSL();
    this.setHSL(hsl[0], s, hsl[2], options);
    return this;
};

Color.prototype.getLightness = function getLightness() {
    var hsl = this.getHSL();
    return hsl[2];
};

Color.prototype.setLightness = function setLightness(l, options) {
    var hsl = this.getHSL();
    this.setHSL(hsl[0], hsl[0], l, options);
    return this;
};

Color.prototype.setHSV = function setHSV(h, s, v, options) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    this.setRGB(r*255, g*255, b*255, options);
    return this;
}

Color.prototype.getHSV = function getHSV() {
    var rgb = this.getNormalizedRGB();
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;
    var d = max - min;
    s = max == 0 ? 0 : d / max;
    if (max == min) {
        h = 0;
    }
    else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
}


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
    var values = _argsToArray(arguments);
    for(var i = 0; i < values.length; i++) {
        if (!_isString(values[i])) return false;
    }
    return true;
};

function _isPercentage(val) {
    return /%/.test(val);
};

function _isType(type, value) {
    return _allStrings(type, value) && type.toLowerCase() === value.toLowerCase();
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
