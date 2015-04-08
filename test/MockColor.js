'use strict';

function MockColor() {
    this._r = 1;
    this._g = 1;
    this._b = 1;
}

MockColor.prototype.getNormalizedRGB = function getNormalizedRGB() {
    // Stringified for easing checking
    return [this._r, this._g, this._b].toString();
};

MockColor.prototype.getColor = function getColor(option) {
    return (option === 'hex') ? this.getNormalizedRGB() : '#ffffff';
};

module.exports = MockColor;
