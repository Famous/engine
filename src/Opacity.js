'use strict';

/**
 * Initilizes the Opacity primitive by settings its value to 1 (default value).
 * Hierarchically setting opacity does not affect the final, local opacity
 * being returned. Rather, this functionality needs to be implemented in the
 * corresponding render targets (e.g. DOM has blending by default).
 *
 * @class Opacity
 * @private
 * @constructor
 */
function Opacity () {
    this.value = 1;
    this.isActive = false;
    this.dirty = false;
}

/**
 * Sets, activates and dirties the internal notion of opacity being read by the
 * RenderContext.
 *
 * @method set
 * @chainable
 * @private
 * 
 * @param {Opacity} value new opacity to be set
 */
Opacity.prototype.set = function set (value) {
    this.isActive = true;
    if (this.value !== value && value != null) {
        this.value = value;
        this.setDirty();
    }
    return this;
};

/**
 * Dirties the opacity.
 * This forces the RenderContext to trigger the `opacity` event on the next
 * invocation of the `update` method on RenderContext.
 *
 * @method setDirty
 * @chainable
 * @private
 *
 * @return {Opacity} this
 */
Opacity.prototype.setDirty = function setDirty () {
    this.dirty = true;
    return this;
};

/**
 * Cleans the opacity. This sets its dirty flag to `false`, thus no longer
 * reading it in `update` of the RenderContext.
 *
 * @method clean
 * @chainable
 * @private
 * 
 * @return {Opacity} this
 */
Opacity.prototype.clean = function clean () {
    this.dirty = false;
    return this;
};

module.exports = Opacity;
