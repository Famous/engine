'use strict';

var Transitionable = require('famous-transitions').Transitionable;
var Quaternion = require('famous-math').Quaternion;

var Q_REGISTER = new Quaternion();
var Q2_REGISTER = new Quaternion();

function Vec3Transitionable(manager) {
    this._manager = manager;
    this._dirty = false;
    this._x = new Transitionable(0);
    this._y = new Transitionable(0);
    this._z = new Transitionable(0);
}

Vec3Transitionable.prototype.get = function get() {
    return {
        x: this._x.get(),
        y: this._y.get(),
        z: this._z.get()
    };
};

Vec3Transitionable.prototype.set = function set(x, y, z, options, callback) {
    this._manager._dispatch.dirtyComponent(this._manager._id);
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

function QuatTransitionable(manager) {
    this._manager = manager;
    this._queue = [];
    this._front = 0;
    this._end = 0;
    this._dirty = false;
    this._t = new Transitionable(0);
    this._fromQ = new Quaternion();
    this._toQ = new Quaternion();
    this._q = new Quaternion();
    this._eulers = {x: 0, y: 0, z: 0};
}

QuatTransitionable.prototype.get = function get() {
    var t = this._t.get();
    var w, x, y, z;
    var queue = this._queue;
    while (t >= this._front + 1) {
        this._front++;
        w = queue.shift();
        x = queue.shift();
        y = queue.shift();
        z = queue.shift();
        this._q.set(w, x, y, z);
        this._fromQ.set(w, x, y, z);
        if (this._queue.length !== 0) this._toQ.set(queue[0], queue[1], queue[2], queue[3]);
    }
    if (this._queue.length !== 0) this._fromQ.slerp(this._toQ, t - this._front, this._q);
    return this._q.toEuler(this._eulers);
};

QuatTransitionable.prototype.set = function set(q, options, callback) {
    this._manager._dispatch.dirtyComponent(this._manager._id);
    this._dirty = true;
    if (this._queue.length === 0) this._toQ.copy(q);
    this._queue.push(q.w, q.x, q.y, q.z);
    this._end++;
    this._t.set(this._end, options, callback);
    return this;
};

QuatTransitionable.prototype.isActive = function isActive() {
    return this._t.isActive();
};

QuatTransitionable.prototype.halt = function halt() {
    this._dirty = false;
    this._t.reset(0);
    this._queue.length = 0;
    this._front = 0;
    this._end = 0;
    return this;
};

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

Transform.toString = function toString() {
    return 'Transform';
};

Transform.prototype.getState = function getState() {
    return {
        component: this.constructor.toString(),
        origin: this.origin && this.origin.get(),
        mountPoint: this.mountPoint && this.mountPoint.get(),
        align: this.align && this.align.get(),
        scale: this.scale && this.scale.get(),
        position: this.position && this.position.get(),
        rotation: this.rotation && this.rotation.get()
    };
};

Transform.prototype.setState = function setState(state) {
    if (state.component === this.constructor.toString()) {
        state.origin && this.setOrigin(state.origin.x, state.origin.y, state.origin.z);
        state.mountPoint && this.setMountPoint(state.mountPoint.x, state.mountPoint.y, state.mountPoint.z);
        state.align && this.setAlign(state.align.x, state.align.y, state.align.z);
        state.scale && this.setScale(state.scale.x, state.scale.y, state.scale.z);
        state.position && this.setPosition(state.position.x, state.position.y, state.position.z);
        state.rotation && this.setRotation(state.rotation.x, state.rotation.y, state.rotation.z);
        return true;
    }
    return false;
};

Transform.prototype.setOrigin = function setOrigin(x, y, z, options, callback) {
    if (!this.origin) this.origin = new Vec3Transitionable(this);
    this.origin.set(x, y, z, options, callback);
};

Transform.prototype.setMountPoint = function setMountPoint(x, y, z, options, callback) {
    if (!this.mountPoint) this.mountPoint = new Vec3Transitionable(this);
    this.mountPoint.set(x, y, z, options, callback);
};

Transform.prototype.setAlign = function setAlign(x, y, z, options, callback) {
    if (!this.align) this.align = new Vec3Transitionable(this);
    this.align.set(x, y, z, options, callback);
};

Transform.prototype.setScale = function setScale(x, y, z, options, callback) {
    if (!this.scale) this.scale = new Vec3Transitionable(this);
    this.scale.set(x, y, z, options, callback);
};

Transform.prototype.setPosition = function setPosition(x, y, z, options, callback) {
    if (!this.position) this.position = new Vec3Transitionable(this);
    this.position.set(x, y, z, options, callback);
};

Transform.prototype.setRotation = function setRotation(x, y, z, options, callback) {
    if (!this.rotation) this.rotation = new QuatTransitionable(this);
    var q = Q_REGISTER.fromEuler(x, y, z);
    this.rotation.set(q, options, callback);
};

Transform.prototype.rotate = function rotate(x, y, z, options, callback) {
    if (!this.rotation) this.rotation = new QuatTransitionable(this);
    var queue = this.rotation._queue;
    var len = this.rotation._queue.length;
    var referenceQ;
    if (len !== 0) {
        referenceQ = Q2_REGISTER.set(queue[len - 4], queue[len - 3], queue[len - 2], queue[len - 1]);
    }
    else referenceQ = Q2_REGISTER.copy(this.rotation._q);
    var q = referenceQ.multiply(Q_REGISTER.fromEuler(x, y, z));
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
