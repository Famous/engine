'use strict';

var Transitionable = require('famous-transitions/src/Transitionable');
var Quaternion = require('famous-math/src/Quaternion');

var Q_REGISTER = new Quaternion();

function Vec3Transitionable() {
    this._dirty = false;
    this._x = new Transitionable(0);
    this._y = new Transitionable(0);
    this._z = new Transitionable(0);
}

Vec3Transitionable.prototype.set = function set(x, y, z, options, callback) {
    this.dirty = true;
    this._x.set(x, options);
    this._y.set(y, options);
    this._z.set(z, options, callback);
    return this;
}

Vec3Transitionable.prototype.isActive = function isActive() {
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

function QuatTransitionable() {
    this._dirty = false;
    this._eulers = {x: 0, y: 0, z: 0};
    this._t = new Transitionable(0);
    this._lastQ = new Quaternion();
    this._q = new Quaternion();
    this._targetQ = new Quaternion();
}

QuatTransitionable.prototype.get = function get() {
    this._lastQ.slerp(this._targetQ, this._t.get(), this._q);
    this._q.toEuler(this._eulers);
    return this._eulers;
};

QuatTransitionable.prototype.set = function set(x, y, z, options, callback) {
    this.dirty = true;
    this._lastQ.copy(this._q);
    this._targetQ.fromEuler(x, y, z);
    this._t.reset().set(0).set(1, options, callback);
    return this;
};

QuatTransitionable.prototype.rotate = function rotate(x, y, z, options, callback) {
    this.dirty = true;
    this._lastQ.copy(this._q);
    this._targetQ.fromEuler(x, y, z).leftMultiply(this._lastQ);
    this._t.reset().set(0).set(1, options, callback);
    return this;
};

/**
 * @class Transform
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch LocalDispatch to be retrieved from corresponding Render Node of the Transform component
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
*
* stringifies Transform constructor
*
* @method
* @return {String} the definition of the Component Class: 'Transform'
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

Transform.prototype.setRotation = function setRotation(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.rotation) this.rotation = new QuatTransitionable();
    this.rotation.set(x, y, z, options, callback);
};

Transform.prototype.rotate = function rotate(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    if (!this.rotation) this.rotation = new QuatTransitionable();
    this.rotation.rotate(x, y, z, options, callback);
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
