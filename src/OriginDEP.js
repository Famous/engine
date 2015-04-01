'use strict';

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
    this.z = 0;
    this.isActive = false;
    this.dirty = false;
}

/**
 * Internal helper method used for setting the origin without marking it as active.
 *
 * @method _setWithoutActivating
 * @private
 * @chainable
 * 
 * @param {Number|null} x relative position to RenderContext in interval [0, 1]
 * @param {Number|null} y relative position to RenderContext in interval [0, 1]
 * @param {Number|null} z relative position to RenderContext in interval [0, 1]
 */
Origin.prototype._setWithoutActivating = function _setWithoutActivating (x, y, z) {
    this.set(x, y, z);
    this.isActive = false;
    return this;
};

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
        this.setDirty();
    }
    if (this.y !== y && y != null) {
        this.y = y;
        this.setDirty();
    }
    if (this.z !== z && z != null) {
        this.z = z;
        this.setDirty();
    }
    return this;
};

/**
 * Dirties the origin by setting its `dirty` property to true. `origin.dirty`
 * will be read by the `LocalDispatch` on the next update.
 *
 * @method  setDirty
 * @chainable
 * @private
 *
 * @return {Origin} this
 */
Origin.prototype.setDirty = function setDirty () {
    this.dirty = true;
    return this;
};

/**
 * Cleans the Origin by setting its `dirty` property to `false`. This prevents
 * the origin from being read on the next update by the `LocalDispatch`.
 *
 * @method clean
 * @chainable
 * @private
 * 
 * @return {Origin} this
 */
Origin.prototype.clean = function clean () {
    this.dirty = false;
    return this;
};

module.exports = Origin;
