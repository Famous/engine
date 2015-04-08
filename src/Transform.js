'use strict';

var Transitionable = require('famous-transitions/src/Transitionable');
var Quaternion = require('famous-math/src/Quaternion');

function Vec3Transitionable() {
    this._dirty = false;
    this._x = new Transitionable(0);
    this._y = new Transitionable(0);
    this._z = new Transitionable(0);
}

Vec3Transitionable.prototype.set = function set(x, y, z, options, callback) {
    this._dirty = true;

    var cbX = null;
    var cbY = null;
    var cbZ = null;

    if (z != null) cbZ = callback;
    else if (y != null) cbY = callback;
    else if (x != null) cbX = callback;

    if (x != null) this._x.set(x, options, cbX);
    if (y != null) this._y.set(y, options, cbY);
    if (z != null) this._z.set(z, options, cbZ);

    return this;
};

Vec3Transitionable.prototype.isActive = function isActive() {
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

Vec3Transitionable.prototype.halt = function halt() {
    this._x.halt();
    this._y.halt();
    this._z.halt();
    return this;
};

function QuatTransitionable() {
    this._queue = [];
    this._front = -1;
    this._end = 0;
    this._dirty = false;
    this._t = new Transitionable(0);
    this._lastQ = new Quaternion();
    this._targetQ = new Quaternion();
    this._q = new Quaternion();
    this._eulers = {x: 0, y: 0, z: 0};
}

QuatTransitionable.prototype.get = function get() {
    var t = this._t.get();
    if (this._queue.length > 0 && t >= this._front + 1) {
        this._front++;
        this._lastQ.copy(this._q);
        this._targetQ = this._queue.shift();
    }
    this._lastQ.slerp(this._targetQ, t - this._front, this._q);
    this._q.toEuler(this._eulers);
    return this._eulers;
};

QuatTransitionable.prototype.set = function set(q, options, callback) {
    this._dirty = true;
    this._queue.push(q);
    this._end++;
    this._t.set(this._end, options, callback);
    this.get();
    return this;
};

QuatTransitionable.prototype.isActive = function isActive() {
    return this._t.isActive();
};

QuatTransitionable.prototype.halt = function halt() {
    this._dirty = false;
    this._t.reset(0);
    this._queue.length = 0;
    this._front = -1;
    this._end = 0;
    return this;
};

/**
 * Interface to manage various aspects of the transform and facilitate transitions.
 *
 * @class Transform
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Transform component.
 */
function Transform(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this.origin = null;
    this.mountPoint = null;
    this.align = null;
    this.scale = null;
    this.position = null;
    this.rotation = null;
}

/**
* The String form of the Transform component.
*
* @method
* @return {String} 'Transform'
*/
Transform.toString = function toString() {
    return 'Transform';
};

Transform.prototype.setOrigin = function setOrigin(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.origin) this.origin = new Vec3Transitionable();
    this.origin.set(x, y, z, options, callback);
};

Transform.prototype.setMountPoint = function setOrigin(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.mountPoint) this.mountPoint = new Vec3Transitionable();
    this.mountPoint.set(x, y, z, options, callback);
};

Transform.prototype.setAlign = function setOrigin(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.align) this.align = new Vec3Transitionable();
    this.align.set(x, y, z, options, callback);
};

Transform.prototype.setScale = function setScale(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.scale) this.scale = new Vec3Transitionable();
    this.scale.set(x, y, z, options, callback);
};

Transform.prototype.setPosition = function setPosition(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.position) this.position = new Vec3Transitionable();
    this.position.set(x, y, z, options, callback);
};

Transform.prototype.translate = function translate(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.position) this.position = new Vec3Transitionable();
    var curX = this.position._x.get();
    var curY = this.position._y.get();
    var curZ = this.position._z.get();
    this.position.set(curX + x, curY + y, curZ + z, options, callback);
};

Transform.prototype.setRotation = function setRotation(x, y, z, options, callback, bool) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.rotation) this.rotation = new QuatTransitionable();
    var q = new Quaternion().fromEuler(x, y, z);
    this.rotation.set(q, options, callback);
};

Transform.prototype.rotate = function rotate(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.rotation) this.rotation = new QuatTransitionable();
    var q = new Quaternion().fromEuler(x, y, z).leftMultiply(this.rotation._targetQ);
    this.rotation.set(q, options, callback);
};

Transform.prototype.clean = function clean() {
    var context = this._dispatch.getContext();
    var c;
    var isDirty = false;
    if ((c = this.origin) && c._dirty) {
        context.setOrigin(c._x.get(), c._y.get(), c._z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.mountPoint) && c._dirty) {
        context.setMountPoint(c._x.get(), c._y.get(), c._z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.align) && c._dirty) {
        context.setAlign(c._x.get(), c._y.get(), c._z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.scale) && c._dirty) {
        context.setScale(c._x.get(), c._y.get(), c._z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.position) && c._dirty) {
        context.setPosition(c._x.get(), c._y.get(), c._z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.rotation) && c._dirty) {
        c.get();
        context.setRotation(c._eulers.x, c._eulers.y, c._eulers.z);
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    return isDirty;
};

module.exports = Transform;
