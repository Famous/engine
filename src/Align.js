'use strict';

var Transform = require('./Transform');

/**
 * Layout is often easily described in terms of "top left", "bottom right",
 * etc. Align is a way of defining an alignment relative to a bounding-box
 * given by a size. Align is given by an array [x, y, z] of proportions betwee
 * 0 and 1. The default value for the align is top left, or [0, 0, 0].
 *
 * @class Align
 * @constructor
 * @private
 */
function Align () {
    this.x = 0;
    this.y = 0;
    this.z = 0.5;
    this.transform = new Transform();
}

/**
 * Sets the alignment in x direction relative to its parent.
 *
 * @method setX
 * @chainable
 * 
 * @param {Number} x alignment in x direction
 * @return {Align} this
 */
Align.prototype.setX = function setX (x) {
    this.x = x;
    return this;
};

/**
 * Sets the alignment in y direction relative to its parent.
 *
 * @method setX
 * @chainable
 * 
 * @param {Number} y alignment in y direction
 * @return {Align} this
 */
Align.prototype.setY = function setY (y) {
    this.y = y;
    return this;
};

/**
 * Sets the alignment in z direction relative to its parent.
 *
 * @method setX
 * @chainable
 * 
 * @param {Number} z alignment in z direction
 * @return {Align} this
 */
Align.prototype.setZ = function setZ (z) {
    this.z = z;
    return this;
};

/**
 * Sets the alignment relative to its parent.
 *
 * @method set
 * @chainable
 * 
 * @param {Number} [x] alignment in x direction
 * @param {Number} [y] alignment in y direction
 * @param {Number} [z] alignment in z direction
 * @return {Align} this
 */
Align.prototype.set = function set (x, y, z) {
    this.x = x != null ? x : this.x;
    this.y = y != null ? y : this.y;
    this.z = z != null ? z : this.z;
    return this;
};

/**
 * Mutates the internal transform matrix according to the passed in size
 *
 * @method update
 * 
 * @param  {Number[]} size  3D size
 * @return {Transform}      internal Transform class
 */
Align.prototype.update = function update (size) {
    var x = size[0] * this.x;
    var y = size[1] * this.y;
    var z = size[2] * (this.z - 0.5);
    this.transform.setTranslation(x, y, z);
    return this.transform;
};

module.exports = Align;
