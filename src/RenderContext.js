'use strict';

var Transform = require('./Transform');
var Origin = require('./Origin');
var MountPoint = require('./MountPoint');
var Align = require('./Align');
var Opacity = require('./Opacity');
var CallbackStore = require('famous-utilities').CallbackStore;
var Size = require('./Size');

var CHANGE = 'change';
var TRANSFORM = 'transform';
var SIZE = 'size';
var ORIGIN = 'origin';
var OPACITY = 'opacity';

/**
 * A RenderContext does not have a notion of a nested scene graph hierarchy.
 * Its sole purpose it to manage the `origin`, `opacity`, `mountPoint`,
 * `align` and `size` primitives primitives by updating its internal transform
 * matrix.
 *
 * The RenderContext is being created by a LocalDisaptch, which delegates to
 * the RenderContext's update method on every `FRAME` in order to apply
 * corresponding updates to the transform matrix attached to the node and all
 * its children. While the scene graph is being traversed recursively, the RenderContext
 * does not have a notion of children. Instead, the Node recursively updates
 * its LocalDispatch (and therefore its RenderContext) and all its children.
 *
 * @class RenderContext
 * @constructor
 * @private
 *
 * @param {LocalDisaptch} dispatch
 */
function RenderContext (dispatch) {
    this._origin = new Origin(this);
    this._opacity = new Opacity(this);
    this._mountPoint = new MountPoint(this);
    this._align = new Align(this);
    this._transform = new Transform(this);
    this._size = new Size(this);
    this._events = new CallbackStore();
    this._needsReflow = false;
    this._recalcAll = true;
    this._dispatch = dispatch;
    this._noParent = false;
}

// TODO @dan Can we remove the CHANGE event? It has never been used.
RenderContext.prototype.onChange = function onChange (cb) {
    this._events.on(CHANGE, cb);
    return this;
};

RenderContext.prototype.offChange = function offChange (cb) {
    this._events.off(CHANGE, cb);
    return this;
};

/**
 * Registers a callback function to be invoked whenever the transform attached
 * to the RenderContext changes.
 *
 * @method  onTransformChange
 * @chainable
 *
 * @param  {Function} cb    callback function to be invoked whenever the transform
 *                          attached to the RenderContext changes
 * @return {RenderContext}  this
 */
RenderContext.prototype.onTransformChange = function onTransformChange (cb) {
    this._events.on(TRANSFORM, cb);
    return this;
};

/**
 * Deregisters a callback function previously attached to the `transform`
 * event using `onTransformChange`.
 *
 * @method  offTransformChange
 * @chainable
 *
 * @param  {Function} cb    callback function previously attached to the `transform`
 *                          event using `onTransformChange`
 * @return {RenderContext}  this
 */
RenderContext.prototype.offTransformChange = function offTransformChange (cb) {
    this._events.on(TRANSFORM, cb);
    return this;
};

/**
 * Registers a callback function to be invoked whenever the size of the
 * RenderContext changes.
 *
 * @method  onSizeChange
 * @chainable
 *
 * @param  {Function} cb    callback function to be invoked whenever the size
 *                          of the RenderContext changes
 * @return {RenderContext}  this
 */
RenderContext.prototype.onSizeChange = function onSizeChange (cb) {
    this._events.on(SIZE, cb);
    return this;
};

/**
 * Deregisters a callback function previously attached to the `size`
 * event using `onSizeChange`.
 *
 * @method  offSizeChange
 * @chainable
 *
 * @param  {Function} cb    callback function previously attached to the `size`
 *                          event using `onSizeChange`
 * @return {RenderContext}  this
 */
RenderContext.prototype.offSizeChange = function offSizeChange (cb) {
    this._events.off(SIZE, cb);
    return this;
};

/**
 * Registers a callback function to be invoked whenever the transform attached
 * to the RenderContext changes.
 *
 * @method  onTransformChange
 * @chainable
 *
 * @param  {Function} cb    callback function to be invoked whenever the transform
 *                          attached to the RenderContext changed
 * @return {RenderContext}  this
 */
RenderContext.prototype.onOpacityChange = function onOpacityChange (cb) {
    this._events.on(OPACITY, cb);
    return this;
};

/**
 * Deregisters a callback function previously attached to the `transform`
 * event using `onTransformChange`.
 *
 * @method  offTransformChange
 * @chainable
 *
 * @param  {Function} cb    callback function previously attached to the `transform`
 *                          event using `onTransformChange`
 * @return {RenderContext}  this
 */
RenderContext.prototype.offOpacityChange = function offOpacityChange (cb) {
    this._events.off(OPACITY, cb);
    return this;
};

/**
 * Sets the opacity of the RenderContext.
 *
 * @method  setOpacity
 * @chainable
 *
 * @param {Number} opacity  opacity to be set on the RenderContext
 * @return {RenderContext}  this
 */
RenderContext.prototype.setOpacity = function setOpacity (opacity) {
    this._opacity.set(opacity);
    return this;
};

/**
 * Sets the position of the RenderContext.
 *
 * @method setPosition
 * @chainable
 *
 * @param {Number} x        x position
 * @param {Number} y        y position
 * @param {Number} z        z position
 * @return {RenderContext}  this
 */
RenderContext.prototype.setPosition = function setPosition (x, y, z) {
    this._transform.setTranslation(x, y, z);
    return this;
};

/**
 * Sets the absolute size of the RenderContext.
 *
 * @method setAbsolute
 * @chainable
 *
 * @param {Number} x        absolute allocated pixel space in x direction
 *                          (absolute width)
 * @param {Number} y        absolute allocated pixel space in y direction
 *                          (absolute height)
 * @param {Number} z        absolute allocated **pixel** space in z direction
 *                          (absolute depth)
 * @return {RenderContext}  this
 */
RenderContext.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this._size.setAbsolute(x, y, z);
    return this;
};

/**
 * Returns the absolute (pixel) size of the RenderContext.
 *
 * @method  getSize
 * @chainable
 *
 * @return {Number[]} 3D absolute **pixel** size
 */
RenderContext.prototype.getSize = function getSize () {
    return this._size.get();
};

/**
 * Sets the proportional size of the RenderContext, relative to its parent.
 *
 * @method  setProportions
 * @chainable
 *
 * @param {Number} x        proportional allocated relative space in x direction (relative width)
 * @param {Number} y        proportional allocated relative space in y direction (relative height)
 * @param {Number} z        proportional allocated relative space in z direction (relative depth)
 * @return {RenderContext}  this
 */
RenderContext.prototype.setProportions = function setProportions (x, y, z) {
    this._size.setProportions(x, y, z);
    return this;
};

/**
 * Sets the differential size of the RenderContext. Differential sizing enables
 * adding an additional offset after applying an absolute and proportional size.
 *
 * @method  setDifferntial
 * @chainable
 *
 * @param {Number} x        absolute pixel size to be added in x direction
 *                          (additional width)
 * @param {Number} y        absolute pixel size to be added in y direction
 *                          (additional height)
 * @param {Number} z        absolute pixel size to be added in z direction
 *                          (additional depth)
 * @return {RenderContext}  this
 */
RenderContext.prototype.setDifferential = function setDifferentials (x, y, z) {
    this._size.setDifferential(x, y, z);
    return this;
};

/**
 * Sets the rotation of the RenderContext in euler angles.
 *
 * @method  setRotation
 * @chainable
 *
 * @param {RenderContext} x     x rotation
 * @param {RenderContext} y     y rotation
 * @param {RenderContext} z     z rotation
 * @return {RenderContext}      this
 */
RenderContext.prototype.setRotation = function setRotation (x, y, z) {
    this._transform.setRotation(x, y, z);
    return this;
};

/**
 * Sets the three dimensional scale of the RenderContext.
 *
 * @method  setScale
 * @chainable
 *
 * @param {Number} x        x scale
 * @param {Number} y        y scale
 * @param {Number} z        z scale
 * @return {RenderContext}  this
 */
RenderContext.prototype.setScale = function setScale (x, y, z) {
    this._transform.setScale(x, y, z);
    return this;
};

/**
 * Sets the align of the RenderContext.
 *
 * @method  setAlign
 * @chainable
 *
 * @param {Number} x        x align
 * @param {Number} y        y align
 * @param {Number} z        z align
 * @return {RenderContext}  this
 */
RenderContext.prototype.setAlign = function setAlign (x, y, z) {
    this._align.set(x, y, z);
    return this;
};

/**
 * Sets the origin of the RenderContext.
 *
 * @method  setOrigin
 * @chainable
 *
 * @param {Number} x        x origin
 * @param {Number} y        y origin
 * @param {Number} z        z origin
 * @return {RenderContext}  this
 */
RenderContext.prototype.setOrigin = function setOrigin (x, y, z) {
    this._origin.set(x, y, z);
    return this;
};

/**
 * Sets the mount point of the RenderContext.
 * TODO Come up with some nice ASCII art
 *
 * @method  setMountPoint
 * @chainable
 *
 * @param {Number} x        mount point in x direction
 * @param {Number} y        mount point in y direction
 * @param {Number} z        mount point in z direction
 * @return {RenderContext}  this
 */
RenderContext.prototype.setMountPoint = function setMountPoint (x, y, z) {
    this._mountPoint.set(x, y, z);
    return this;
};

RenderContext.prototype.dirty = function dirty () {
    this._recalcAll = true;
    return this;
};

var identSize = new Float32Array([0, 0, 0]);
var identTrans = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/**
 * Updates the RenderContext's internal transform matrix and emits
 * corresponding change events. Takes into account the parentContext's size
 * invalidations in order to maintain high throughput while still updating the
 * entire scene graph on every FRAME command.
 *
 * @method  update
 * @chainable
 *
 * @param  {RenderContext} parentContext    parent context passed down recrusively by
 *                                          the Node through the LocalDispatch
 * @return {RenderContext}                  this
 */
RenderContext.prototype.update = function update (parentContext) {
    var sizeInvalidations;

    if (this._recalcAll || (!this._noParent && !parentContext)) {
        sizeInvalidations = 7;
    } else if (this._noParent && !parentContext) {
        sizeInvalidations = 0;
    } else {
        sizeInvalidations = parentContext._size._previouslyInvalidated;
    }

    this._size._update(
        sizeInvalidations,
        parentContext ? parentContext._size.getTopDownSize() : identSize
    );

    var mySize = this._size.get();
    var parentSize = parentContext ? parentContext._size.get() : identSize;
    this._align.update(parentSize);
    this._mountPoint.update(mySize);
    this._origin.update(mySize);

    var alignInvalidations;

    if (this._recalcAll || (!this._noParent && !parentContext)) {
        alignInvalidations = (1 << 16) - 1;
    }
    else if (this._noParent && !parentContext) {
        alignInvalidations = 0;
    }
    else {
        alignInvalidations = parentContext._origin.toOriginTransform._previouslyInvalidated;
    }

    this._align.transform._update(
        alignInvalidations,
        parentContext ? parentContext._origin.toOriginTransform._matrix : identTrans
    );

    this._mountPoint.transform._update(
        this._align.transform._previouslyInvalidated,
        this._align.transform._matrix
    );

    this._origin.fromOriginTransform._update(
        this._mountPoint.transform._previouslyInvalidated,
        this._mountPoint.transform._matrix
    );

    this._transform._update(
        this._origin.fromOriginTransform._previouslyInvalidated,
        this._origin.fromOriginTransform._matrix
    );

    this._origin.toOriginTransform._update(
        this._transform._previouslyInvalidated,
        this._transform._matrix
    );

    var worldTransform = this._origin.toOriginTransform;

    if (worldTransform._previouslyInvalidated) {
       this._events.trigger(TRANSFORM, worldTransform);
    }

    if (this._size._previouslyInvalidated)
        this._events.trigger(SIZE, this._size);

    if (this._opacity.dirty) {
        this._events.trigger(OPACITY, this._opacity);
        this._opacity.clean();
    }

    if (this._recalcAll) this._recalcAll = false;
    if (!parentContext) this._noParent = true;

    return this;
};

module.exports = RenderContext;
