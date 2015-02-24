'use strict';

/**
 * A two-dimensional vector.
 *
 * @class Vec2
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 */
var Vec2 = function(x, y){
    if (x instanceof Array || x instanceof Float32Array) {
        this.x = x[0] || 0;
        this.y = x[1] || 0;
    }
    else {
        this.x = x || 0;
        this.y = y || 0;
    }
};

/**
 * Set the components of the current Vec2.
 *
 * @method set
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @chainable
 */
Vec2.prototype.set = function set(x, y) {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    return this;
};

/**
 * Add the input v to the current Vec2.
 *
 * @method add
 * @param {Vec2} v The Vec2 to add.
 * @chainable
 */
Vec2.prototype.add = function add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};

/**
 * Subtract the input v from the current Vec2.
 *
 * @method subtract
 * @param {Vec2} v The Vec2 to subtract.
 * @chainable
 */
Vec2.prototype.subtract = function subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

/**
 * Scale the current Vec2 by a scalar or Vec2.
 *
 * @method scale
 * @param {Number|Vec2} s The Number or vec2 by which to scale.
 * @chainable
 */
Vec2.prototype.scale = function scale(s) {
    if (s instanceof Vec2) {
        this.x *= s.x;
        this.y *= s.y;
    } else {
        this.x *= s;
        this.y *= s;
    }
    return this;
};

/**
 * Preserve the magnitude but invert the orientation of the current Vec2.
 *
 * @method invert
 * @chainable
 */
Vec2.prototype.invert = function invert() {
    this.x *= -1;
    this.y *= -1;
    return this;
};

/**
 * Apply a function component-wise to the current Vec2.
 *
 * @method map
 * @param {Function} fn Function to apply.
 * @chainable
 */
Vec2.prototype.map = function map(fn) {
    this.x = fn(this.x);
    this.y = fn(this.y);
    return this;
};

/**
 * The magnitude of the current Vec2.
 *
 * @method length
 * @return {Number}
 */
Vec2.prototype.length = function length() {
    var x = this.x;
    var y = this.y;

    return Math.sqrt(x * x + y * y);
};

/**
 * Copy the input onto the current Vec2.
 *
 * @method copy
 * @param {Vec2} v Vec2 to copy.
 * @chainable
 */
Vec2.prototype.copy = function copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
};

/**
 * Reset the current Vec2.
 *
 * @method clear
 * @chainable
 */
Vec2.prototype.clear = function clear() {
    this.x = 0;
    this.y = 0;
    return this;
};

/**
 * Check whether the magnitude of the current Vec2 is exactly 0.
 *
 * @method isZero
 * @return {Boolean}
 */
Vec2.prototype.isZero = function isZero() {
    if (this.x !== 0 || this.y !== 0) return false;
    else return true;
};

/**
 * Check whether Vec2 is equal to Current Vec2
 *
 * @param  {Vec2} v Vec2 to compare
 * @return {Boolean}
 */
Vec2.prototype.identity = function identity(v) {
    if (this.x !== v.x || this.y !== v.y) return false;
    else return true;
};

/**
 * The array form of the current Vec2.
 *
 * @method toArray
 * @return {Number[]}
 */
Vec2.prototype.toArray = function toArray() {
    return [this.x, this.y];
};

/**
 * Normalize the input Vec2.
 *
 * @method normalize
 * @param {Vec2} v The reference Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 * @return {Vec2} The normalize Vec2.
 */
Vec2.normalize = function normalize(v, output) {
    var length = v.length();
    output.x = v.x/length;
    output.y = v.y/length;

    return output;
};

/**
 * Clone the input Vec2.
 *
 * @method clone
 * @param {Vec2} v The Vec2 to clone.
 * @return {Vec2} The cloned Vec2.
 */
Vec2.clone = function clone(v) {
    return new Vec2(v.x, v.y);
};

/**
 * Add the input Vec2's.
 *
 * @method add
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 * @return {Vec2} The result of the addition.
 */
Vec2.add = function add(v1, v2, output) {
    output.x = v1.x + v2.x;
    output.y = v1.y + v2.y;

    return output;
};

/**
 * Subtract the second Vec2 from the first.
 *
 * @method subtract
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 * @return {Vec2} The result of the subtraction.
 */
Vec2.subtract = function subtract(v1, v2, output) {
    output.x = v1.x - v2.x;
    output.y = v1.y - v2.y;
    return output;
};

/**
 * Scale the input Vec2.
 *
 * @method scale
 * @param {Vec2} v The reference Vec2.
 * @param {Number} s Number to scale by.
 * @param {Vec2} output Vec2 in which to place the result.
 * @return {Vec2} The result of the scaling.
 */
Vec2.scale = function scale(v, s, output) {
    output.x = v.x * s;
    output.y = v.y * s;
    return output;
};

/**
 * The dot product of the input Vec2's.
 *
 * @method dotProduct
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 * @return {Number} The dot product.
 */
Vec2.dotProduct = function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

/**
 * Check whether two Vec2's are equal
 *
 * @param  {Vec2} v1 The left Vec2
 * @param  {Vec2} v2 The right Vec2
 * @return {Boolean}
 */
Vec2.equals = function equals(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y;
};

module.exports = Vec2;
