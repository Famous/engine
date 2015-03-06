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
}

RenderContext.prototype.onChange = function onChange (cb) {
    this._events.on(CHANGE, cb);
    return this;
};

RenderContext.prototype.offChange = function offChange (cb) {
    this._events.off(CHANGE, cb);
    return this;
};

RenderContext.prototype.onTransformChange = function onTransformChange (cb) {
    this._events.on(TRANSFORM, cb);
    return this;
};

RenderContext.prototype.offTransformChange = function offTransformChange (cb) {
    this._events.on(TRANSFORM, cb);
    return this;
};

RenderContext.prototype.onSizeChange = function onSizeChange (cb) {
    this._events.on(SIZE, cb);
    return this;
};

RenderContext.prototype.offSizeChange = function offSizeChange (cb) {
    this._events.off(SIZE, cb);
    return this;
};

RenderContext.prototype.onOriginChange = function onOriginChange (cb) {
    this._events.on(ORIGIN, cb);
    return this;
};

RenderContext.prototype.offOriginChange = function offOriginChange (cb) {
    this._events.off(ORIGIN, cb);
    return this;
};

RenderContext.prototype.onOpacityChange = function onOpacityChange (cb) {
    this._events.on(OPACITY, cb);
    return this;
};

RenderContext.prototype.offOpacityChange = function offOpacityChange (cb) {
    this._events.off(OPACITY, cb);
    return this;
};

RenderContext.prototype.setOpacity = function setOpacity (opacity) {
    this._opacity.set(opacity);
    return this;
};

RenderContext.prototype.setPosition = function setPosition (x, y, z) {
    this._transform.setTranslation(x, y, z);
    return this;
};

RenderContext.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this._size.setAbsolute(x, y, z);
    return this;
};

RenderContext.prototype.getSize = function getSize () {
    return this._size.get();
};

RenderContext.prototype.setProportions = function setProportions (x, y, z) {
    this._size.setProportions(x, y, z);
    return this;
};

RenderContext.prototype.setDifferential = function setDifferentials (x, y, z) {
    this._size.setDifferential(x, y, z);
    return this;
};

RenderContext.prototype.setRotation = function setRotation (x, y, z) {
    this._transform.setRotation(x, y, z);
    return this;
};

RenderContext.prototype.setScale = function setScale (x, y, z) {
    this._transform.setScale(x, y, z);
    return this;
};

RenderContext.prototype.setAlign = function setAlign (x, y, z) {
    this._align.set(x, y, z);
    return this;
};

RenderContext.prototype.setOrigin = function setOrigin (x, y, z) {
    this._origin.set(x, y, z);
    return this;
};

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

RenderContext.prototype.update = function update (parentContext) {
    this._size._update(
        this._recalcAll || !parentContext ? 7 : parentContext._size._previouslyInvalidated,
        parentContext ? parentContext._size.getTopDownSize() : identSize
    );

    if (!this._origin.isActive) 
        this._origin._setWithoutActivating(
            parentContext ? parentContext._origin.x : 0,
            parentContext ? parentContext._origin.y : 0,
            parentContext ? parentContext._origin.z : 0);
    var mySize = this._size.get();
    var parentSize = parentContext ? parentContext._size.get() : identSize;
    this._align.update(parentSize);
    this._mountPoint.update(mySize);

    this._align.transform._update(
        this._recalcAll || !parentContext ? (1 << 16) - 1 : parentContext._transform._previouslyInvalidated,
        parentContext ? parentContext._transform._matrix : identTrans
    );

    this._mountPoint.transform._update(
        this._align.transform._previouslyInvalidated,
        this._align.transform._matrix
    );

    this._transform._update(
        this._mountPoint.transform._previouslyInvalidated,
        this._mountPoint.transform._matrix
    );

    if (this._transform._previouslyInvalidated)
       this._events.trigger(TRANSFORM, this._transform);

    if (this._origin.dirty) {
        this._events.trigger(ORIGIN, this._origin);
        this._origin.clean();
    }

    if (this._size._previouslyInvalidated)
        this._events.trigger(SIZE, this._size);

    if (this._opacity.dirty) {
        this._events.trigger(OPACITY, this._opacity);
        this._opacity.clean();
    }

    if (this._recalcAll) this._recalcAll = false;

    return this;
};

module.exports = RenderContext;
