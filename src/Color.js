'use strict';

/**
 * Module dependencies
 */
var Transitionable = require('famous-transitions').Transitionable;


/**
 * Color
 * Accepts RGB, HSL, HEX and HSV with getters and setters.
 * If no options are provided, RGB is the default setter.
 */
var Color = function Color() {
    this._r = new Transitionable(0);
    this._g = new Transitionable(0);
    this._b = new Transitionable(0);
    var options = helpers.flattenArguments(arguments);
    if (options.length) this.set(options);
};

Color.toString = function toString() {
    return 'Color';
};


/**
 * GENERAL
 */
Color.prototype.set = function set() {
    var options = helpers.flattenArguments(arguments);
    var type = helpers.determineType(options[0]);

    switch (type) {
        case 'hsl': this.setHSL(options.slice(1)); break;
        case 'rgb': this.setRGB(options.slice(1)); break;
        case 'hsv': this.setHSV(options.slice(1)); break;
        case 'hex': this.setHex(options); break;
        case 'color': this.setColor(options); break;
        case 'instance': this.copy(options); break;
        default: this.setRGB(options);
    }
    return this;
};

Color.prototype.isActive = function isActive() {
    return this._r.isActive() || this._g.isActive() || this._b.isActive();
};

Color.prototype.changeTo = function changeTo() {
    var options = helpers.flattenArguments(arguments);
    if (options.length) this.set(options);
    return this;
};

Color.prototype.copy = function copy() {
    var values = helpers.flattenArguments(arguments);
    var color = values[0], options = values[1];
    if (helpers.isColorInstance(color)) {
        this.setRGB(color.getRGB(), options);
    }
    return this;
};

Color.prototype.clone = function clone() {
    var rgb = this.getRGB();
    return new Color('rgb', rgb[0], rgb[1], rgb[2]);
};

Color.prototype.setColor = function setColor() {
    var values = helpers.flattenArguments(arguments);
    var color = values[0], options = values[1];
    this.setHex(colorNames[color], options);
    return this;
};

Color.prototype.getColor = function getColor(option) {
    option = option || 'undefined';
    switch (option.toLowerCase()) {
        case 'undefined': return this.getRGB();
        case 'rgb': return this.getRGB();
        case 'hsl': return this.getHSL();
        case 'hex': return this.getHex();
        case 'hsv': return this.getHSV();
        default: return this.getRGB();;
    }
};


/**
 * RGB
 */
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
    var values = helpers.flattenArguments(arguments);
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

Color.prototype.getNormalizedRGB = function getNormalizedRGB() {
    var r = this.getR() / 255.0;
    var g = this.getG() / 255.0;
    var b = this.getB() / 255.0;
    return [r, g, b];
};

Color.prototype.getRGBString = function toRGBString() {
    var r = this.getR();
    var g = this.getG();
    var b = this.getB();
    return 'rgb('+ r +', '+ g +', '+ b +');';
};

Color.prototype.addRGB = function addRGB(r, g, b) {
    var r = helpers.clamp(this.getR() + r);
    var g = helpers.clamp(this.getG() + g);
    var b = helpers.clamp(this.getB() + b);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.addScalar = function addScalar(s) {
    var r = helpers.clamp(this.getR() + s);
    var g = helpers.clamp(this.getG() + s);
    var b = helpers.clamp(this.getB() + s);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.multiplyRGB = function multiplyRGB(r, g, b) {
    var r = helpers.clamp(this.getR() * r);
    var g = helpers.clamp(this.getG() * g);
    var b = helpers.clamp(this.getB() * b);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.multiplyScalar = function multiplyScalar(s) {
    var r = helpers.clamp(this.getR() * s);
    var g = helpers.clamp(this.getG() * s);
    var b = helpers.clamp(this.getB() * s);
    this.setRGB(r, g, b);
    return this;
};

Color.prototype.equals = function equals(color) {
    if (helpers.isColorInstance(color)) {
        return  this.getR() === color.getR() &&
                this.getG() === color.getG() &&
                this.getB() === color.getB();
    }
    return false;
};

Color.prototype.copyGammaToLinear = function copyGammaToLinear(color) {
    if (helpers.isColorInstance(color)) {
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


/**
 * HEX
 */
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

Color.prototype.setHex = function setHex() {
    var values = helpers.flattenArguments(arguments);
    var hex, options;

    if (helpers.isHex(values[0])) {
        hex = values[0];
        options = values[1];
    }
    else {
        hex = values[1]; options = values[2];
    }
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


/**
 * HSL
 */
Color.prototype.hueToRGB = function hueToRGB(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
};

Color.prototype.setHSL = function setHSL() {
    var values = helpers.flattenArguments(arguments);
    var h = values[0], s = values[1], l = values[2];
    var options = values[3];
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

Color.prototype.getBrightness = function getBrightness() {
    var rgb = this.getNormalizedRGB();
    return Math.max(rgb[0], rgb[1], rgb[2]) * 100.0;
};

Color.prototype.getLightness = function getLightness() {
    var rgb = this.getNormalizedRGB();
    var r = rgb[0], g = rgb[1], b = rgb[2];
    return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2.0) * 100.0;
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


/**
 * HSV
 */
Color.prototype.setHSV = function setHSV() {
    var values = helpers.flattenArguments(arguments);
    var h = values[0], s = values[1], v = values[2];
    var options = values[3];
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
};

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
};


/**
 * Helper functions
 */
var helpers = {};

helpers.flattenArguments = function(options) {
    return Array.prototype.concat.apply([], options);
}

helpers.argsToArray = function(val) {
    return Array.prototype.slice.call(val);
}

helpers.isColorInstance = function(val) {
    return (val instanceof Color);
}

helpers.isArray = function(val) {
    return Array.isArray(val);
}

helpers.isString = function(val) {
    return (typeof val === 'string');
}

helpers.isInt = function(val) {
    return parseInt(val) === val;
}

helpers.isFloat = function(val) {
    return !helpers.isInt(val);
}

helpers.allFloats = function() {
    var val = helpers.argsToArray(arguments);
    for(var i = 0; i < val.length; i++) {
        if (!helpers.isFloat(val[i])) return false;
    }
    return true;
}

helpers.allInts = function(val) {
    return !helpers.allFloats(val);
}

helpers.allStrings = function() {
    var values = helpers.argsToArray(arguments);
    for(var i = 0; i < values.length; i++) {
        if (!helpers.isString(values[i])) return false;
    }
    return true;
}

helpers.isPercentage = function(val) {
    return /%/.test(val);
}

helpers.isHex = function(val) {
    return /#/.test(val);
}

helpers.isType = function(type, value) {
    return helpers.allStrings(type, value) && type.toLowerCase() === value.toLowerCase();
}

helpers.clamp = function(val, min, max) {
    min = min || 0;
    max = max || 255;
    return Math.max(Math.min(val, max), min);
}

helpers.determineType = function(val) {
    if (helpers.isColorInstance(val)) return 'instance';
    if (helpers.isHex(val)) return 'hex';
    if (colorNames[val]) return 'color';
    var types = ['rgb', 'hsl', 'hex', 'hsv'];
    for(var i = 0; i < types.length; i++) {
        if (helpers.isType(val, types[i])) return types[i];
    }
}


/**
 * Generic color names
 */
var colorNames = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    grey: '#808080',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32'
};


/**
 * Expose
 */
module.exports.Color = Color;
module.exports.helpers = helpers;
