'use strict';

/**
 * The size primitive is being used internally by the RenderContext to manage
 * and update its respective transform matrix. It doesn't expose user-facing
 * APIs, but instead is being exposed on the RenderContext level in form of
 * various methods, e.g. `setProportional` and `setAbsolute`.
 *
 * @class Size
 * @constructor
 * @private
 * 
 * @param {RenderContext} context RenderContext the Size is being attached to
 */
function Size (context) {
    this._context = context;
    this._size = [0, 0, 0];
    this._proportions = [1, 1, 1];
    this._differential = [0, 0, 0];
    this._absolute = [0, 0, 0];
    this._absoluteSized = [false, false, false];
    this._bottomUpSize = [0, 0, 0];
    this._invalidated = 0;
    this._previouslyInvalidated = 0;
}

/**
 * Retrieves the current top-down, absolute pixel size. Incorporates it parent size.
 *
 * @method  get
 * @private
 * 
 * @return {Number[]} absolute pixel size
 */
Size.prototype.get = function get () {
    if (this._context._dispatch.hasRenderables())
        return this._context._dispatch.getTotalRenderableSize();
    else
        return this.getTopDownSize();
};

/**
 * Sets the proportional size.
 *
 * @method setProportions
 * @chainable
 * @private
 * 
 * @param {Number|null} x
 * @param {Number|null} y
 * @param {Number|null} z
 */
Size.prototype.setProportions = function setProportions(x, y, z) {
    if (x !== this._proportions[0] && x != null) {
        this._proportions[0] = x;
        this._invalidated |= 1;
    }
    if (y !== this._proportions[1] && y != null) {
        this._proportions[1] = y;
        this._invalidated |= 2;
    }
    if (z !== this._proportions[2] && z != null) {
        this._proportions[2] = z;
        this._invalidated |= 4;
    }
    return this;
};

/**
 * Sets the differential size.
 *
 * @method  setDifferential
 * @chainable
 * @private
 * 
 * @param {Number|null} x
 * @param {Number|null} y
 * @param {Number|null} z
 */
Size.prototype.setDifferential = function setDifferential (x, y, z) {
    if (x !== this._differential[0] && x != null) {
        this._differential[0] = x;
        this._invalidated |= 1;
    }
    if (y !== this._differential[1] && y != null) {
        this._differential[1] = y;
        this._invalidated |= 2;
    }
    if (z !== this._differential[2] && z != null) {
        this._differential[2] = z;
        this._invalidated |= 4;
    }
    return this;
};

/**
 * Internal helper function called by `setAbsolute` in order to update the absolute size.
 * 
 * @method  _setAbsolute
 * @chainable
 * @private
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
Size.prototype._setAbsolute = function _setAbsolute (x, y, z) {
    if (x !== this._absolute[0] && x != null) {
        this._absolute[0] = x;
        this._invalidated |= 1;
    }
    if (y !== this._absolute[1] && y != null) {
        this._absolute[1] = y;
        this._invalidated |= 2;
    }
    if (z !== this._absolute[2] && z != null) {
        this._absolute[2] = z;
        this._invalidated |= 4;
    }
    return this;
};

/**
 * Updates the internal notion of absolute sizing.
 *
 * @method  setAbsolute
 * @chainable
 * @private
 * 
 * @param {Number|null} x
 * @param {Number|null} y
 * @param {Number|null} z
 */
Size.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this._absoluteSized[0] = x != null;
    this._absoluteSized[1] = y != null;
    this._absoluteSized[2] = z != null;
    this._setAbsolute(x, y, z);
    return this;
};

/**
 * Retrieves the top-down size.
 *
 * @method  getTopDownSize
 * @chainable
 * 
 * @return {Size} this
 */
Size.prototype.getTopDownSize = function getTopDownSize () {
    return this._size;
};

/**
 * Updates the size according to previously set invalidations.
 *
 * @method  _update
 * @private
 * 
 * @param  {Number} parentReport    bit scheme
 * @param  {Number[]} parentSize    absolute parent size
 * @return {Number}                 bit scheme
 */
Size.prototype._update = function _update(parentReport, parentSize) {
    this._invalidated |= parentReport;
    if (this._invalidated & 1)
        if (this._absoluteSized[0]) this._size[0] = this._absolute[0];
        else this._size[0] = parentSize[0] * this._proportions[0] + this._differential[0];
    if (this._invalidated & 2)
        if (this._absoluteSized[1]) this._size[1] = this._absolute[1];
        else this._size[1] = parentSize[1] * this._proportions[1] + this._differential[1];
    if (this._invalidated & 4)
        if (this._absoluteSized[2]) this._size[2] = this._absolute[2];
        else this._size[2] = parentSize[2] * this._proportions[2] + this._differential[2];
    this._previouslyInvalidated = this._invalidated;
    this._invalidated = 0;
    return this._previouslyInvalidated;
};

/**
 * Resets the internal managed size (parent size). Invalidates the primitive
 * and therefore recalculates the size on the next invocation of the _update
 * function.
 *
 * @method  toIdentity
 * @chainable
 * 
 * @return {Size} this
 */
Size.prototype.toIdentity = function toIdentity () {
    this._absolute[0] = this._absolute[1] = this._absolute[2] = 0;
    this._differential[0] = this._differential[1] = this._differential[2] = 0;
    this._proportions[0] = this._proportions[1] = this._proportions[2] = 1;
    this._invalidated = 7;
    return this;
};

module.exports = Size;
