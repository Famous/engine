'use strict';

var Transform = require('./Transform');

/**
 * The origin primitive defines the relative position of a point within a
 * RenderContext that should be used to apply further transformations on.
 *
 * @private
 * @class  Origin
 * @constructor
 */
function Origin () {
    this.x = 0;
    this.y = 0;
    this.z = 0.5;
    this.isActive = false;
    this.dirty = false;
    this.toOriginTransform = new Transform();
    this.fromOriginTransform = new Transform();
}

/**
 * Sets the relative position of the origin.
 *
 * @method  set
 * @private
 * @chainable
 *
 * @param {Number} x relative position to RenderContext in interval [0, 1]
 * @param {Number} y relative position to RenderContext in interval [0, 1]
 * @param {Number} z relative position to RenderContext in interval [0, 1]
 */
Origin.prototype.set = function set (x, y, z) {
    this.isActive = true;
    if (this.x !== x && x != null) {
        this.x = x;
    }
    if (this.y !== y && y != null) {
        this.y = y;
    }
    if (this.z !== z && z != null) {
        this.z = z;
    }
    return this;
};

Origin.prototype.update = function update (size) {
    var x = size[0] * this.x;
    var y = size[1] * this.y;
    var z = size[2] * (this.z - 0.5);
    this.toOriginTransform.setTranslation(-x, -y, -z);
    this.fromOriginTransform.setTranslation(x, y, z);
    return this.transform;
};

module.exports = Origin;
