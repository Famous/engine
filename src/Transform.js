'use strict';

var Transitionable = require('famous-transitions').Transitionable;
var Quaternion = require('famous-math').Quaternion;

var Q_REGISTER = new Quaternion();
var Q2_REGISTER = new Quaternion();

function Vec3Transitionable(x, y, z, transform) {
    this._transform = transform;
    this._dirty = false;
    this.x = new Transitionable(x);
    this.y = new Transitionable(y);
    this.z = new Transitionable(z);
    this._values = {x: x, y: y, z: z};
}

Vec3Transitionable.prototype.get = function get() {
    this._values.x = this.x.get();
    this._values.y = this.y.get();
    this._values.z = this.z.get();
    return this._values;
};

Vec3Transitionable.prototype.set = function set(x, y, z, options, callback) {
    this.dirty();

    var cbX = null;
    var cbY = null;
    var cbZ = null;

    if (z != null) cbZ = callback;
    else if (y != null) cbY = callback;
    else if (x != null) cbX = callback;

    if (x != null) this.x.set(x, options, cbX);
    if (y != null) this.y.set(y, options, cbY);
    if (z != null) this.z.set(z, options, cbZ);

    return this;
};

Vec3Transitionable.prototype.isActive = function isActive() {
    return this.x.isActive() || this.y.isActive() || this.z.isActive();
};

Vec3Transitionable.prototype.pause = function pause() {
    this.x.pause();
    this.y.pause();
    this.z.pause();
    return this;
};

Vec3Transitionable.prototype.resume = function resume() {
    this.x.resume();
    this.y.resume();
    this.z.resume();
    return this;
};

Vec3Transitionable.prototype.halt = function halt() {
    this.x.halt();
    this.y.halt();
    this.z.halt();
    return this;
};

Vec3Transitionable.prototype.dirty = function dirty() {
    if (!this._transform._dirty) {
        this._transform._node.requestUpdate(this._transform._id);
        this._transform._dirty = true;
    }
    this._dirty = true;
    return this;
};

function QuatTransitionable(x, y, z, w, transform) {
    this._transform = transform;
    this._queue = [];
    this._front = 0;
    this._end = 0;
    this._dirty = false;
    this._t = new Transitionable(0);
    this._fromQ = new Quaternion(w, x, y, z);
    this._toQ = new Quaternion();
    this._q = new Quaternion(w, x, y, z);
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
    return this._q;
};

QuatTransitionable.prototype.set = function set(x, y, z, w, options, callback) {
    if (!this._transform._dirty) {
        this._transform._node.requestUpdate(this._transform._id);
        this._transform._dirty = true;
    }
    this._dirty = true;
    if (this._queue.length === 0) this._toQ.set(w, x, y, z);
    this._queue.push(w, x, y, z);
    this._end++;
    this._t.set(this._end, options, callback);
    return this;
};

QuatTransitionable.prototype.isActive = function isActive() {
    return this._t.isActive();
};

QuatTransitionable.prototype.pause = function pause() {
    this._t.pause();
    return this;
};

QuatTransitionable.prototype.resume = function resume() {
    this._t.resume();
    return this;
};

QuatTransitionable.prototype.halt = function halt() {
    this._dirty = false;
    this._t.reset(0);
    this._queue.length = 0;
    this._front = 0;
    this._end = 0;
    return this;
};

function Transform(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this.origin = null;
    this.mountPoint = null;
    this.align = null;
    this.scale = null;
    this.position = null;
    this.rotation = null;

    this._dirty = false;
}

Transform.toString = function toString() {
    return 'Transform';
};

Transform.prototype.getValue = function getValue() {
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
        state.rotation && this.setRotation(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);
        return true;
    }
    return false;
};

Transform.prototype.setOrigin = function setOrigin(x, y, z, options, callback) {
    if (!this.origin) {
        var v = this._node.getOrigin();
        this.origin = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.origin.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setMountPoint = function setMountPoint(x, y, z, options, callback) {
    if (!this.mountPoint) {
        var v = this._node.getMountPoint();
        this.mountPoint = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.mountPoint.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setAlign = function setAlign(x, y, z, options, callback) {
    if (!this.align) {
        var v = this._node.getAlign();
        this.align = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.align.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setScale = function setScale(x, y, z, options, callback) {
    if (!this.scale) {
        var v = this._node.getScale();
        this.scale = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.scale.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setPosition = function setPosition(x, y, z, options, callback) {
    if (!this.position) {
        var v = this._node.getPosition();
        this.position = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.position.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.translate = function translate(x, y, z, options, callback) {
    if (!this.position) {
        var v = this._node.getPosition();
        this.position = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    var p = this.position;
    var xq = p.x._queue;
    var yq = p.y._queue;
    var zq = p.z._queue;
    var xEnd = x == null ? null : x + (xq.length > 0 ? xq[xq.length - 4] : p.x._end);
    var yEnd = y == null ? null : y + (yq.length > 0 ? yq[yq.length - 4] : p.y._end);
    var zEnd = z == null ? null : z + (zq.length > 0 ? zq[zq.length - 4] : p.z._end);
    this.position.set(xEnd, yEnd, zEnd, options, callback);
    return this;
};

Transform.prototype.setRotation = function setRotation(x, y, z, w, options, callback) {
    if (!this.rotation) {
        var v = this._node.getRotation();
        this.rotation = new QuatTransitionable(v[0], v[1], v[2], v[3], this);
    }
    var q = Q_REGISTER;
    if (typeof w === 'number') {
        q.set(w, x, y, z);
    }
    else {
        q.fromEuler(x, y, z);
        callback = options;
        options = w;
    }
    this.rotation.set(q.x, q.y, q.z, q.w, options, callback);
    return this;
};

Transform.prototype.rotate = function rotate(x, y, z, w, options, callback) {
    if (!this.rotation) {
        var v = this._node.getRotation();
        this.rotation = new QuatTransitionable(v[0], v[1], v[2], v[3], this);
    }
    var queue = this.rotation._queue;
    var len = this.rotation._queue.length;
    var referenceQ;
    if (len !== 0) {
        referenceQ = Q2_REGISTER.set(queue[len - 4], queue[len - 3], queue[len - 2], queue[len - 1]);
    }
    else referenceQ = Q2_REGISTER.copy(this.rotation._q);

    var rotQ = Q_REGISTER;
    if (typeof w === 'number') {
        rotQ.set(w, x, y, z);
    }
    else {
        rotQ.fromEuler(x, y, z);
        callback = options;
        options = w;
    }

    var q = referenceQ.multiply(rotQ);
    this.rotation.set(q.x, q.y, q.z, q.w, options, callback);
    return this;
};

Transform.prototype.clean = function clean() {
    var node = this._node;
    var c;
    var isDirty = false;
    if ((c = this.origin) && c._dirty) {
        node.setOrigin(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.mountPoint) && c._dirty) {
        node.setMountPoint(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.align) && c._dirty) {
        node.setAlign(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.scale) && c._dirty) {
        node.setScale(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.position) && c._dirty) {
        node.setPosition(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.rotation) && c._dirty) {
        c.get();
        node.setRotation(c._q.x, c._q.y, c._q.z, c._q.w);
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if (isDirty) this._node.requestUpdateOnNextTick(this._id);
    else this._dirty = false;
};

Transform.prototype.onUpdate = Transform.prototype.clean;

module.exports = Transform;
