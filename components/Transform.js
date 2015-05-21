/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../transitions/Transitionable');
var Quaternion = require('../math/Quaternion');

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
    if (!this._transform._dirty) {
        this._transform._node.requestUpdate(this._transform._id);
        this._transform._dirty = true;
    }
    this._dirty = true;

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

function QuatTransitionable(x, y, z, w, transform) {
    this._transform = transform;
    this._dirty = false;
    this._t = new Transitionable([x,y,z,w]);
}

QuatTransitionable.prototype.get = function get() {
    return this._t.get();
};


QuatTransitionable.prototype.set = function set(x, y, z, w, options, callback) {
    if (!this._transform._dirty) {
        this._transform._node.requestUpdate(this._transform._id);
        this._transform._dirty = true;
    }
    this._dirty = true;

    options.method = 'slerp';
    this._t.set([x,y,z,w], options, callback);
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
    this._t.halt();
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

Transform.prototype.toString = function toString() {
    return 'Transform';
};

Transform.prototype.getValue = function getValue() {
    return {
        component: this.toString(),
        origin: this.origin && this.origin.get(),
        mountPoint: this.mountPoint && this.mountPoint.get(),
        align: this.align && this.align.get(),
        scale: this.scale && this.scale.get(),
        position: this.position && this.position.get(),
        rotation: this.rotation && this.rotation.get()
    };
};

Transform.prototype.setState = function setState(state) {
    if (this.toString() === state.component) {
        if (state.origin) {
            this.setOrigin(state.origin.x, state.origin.y, state.origin.z);
        }
        if (state.mountPoint) {
            this.setMountPoint(state.mountPoint.x, state.mountPoint.y, state.mountPoint.z);
        }
        if (state.align) {
            this.setAlign(state.align.x, state.align.y, state.align.z);
        }
        if (state.scale) {
            this.setScale(state.scale.x, state.scale.y, state.scale.z);
        }
        if (state.position) {
            this.setPosition(state.position.x, state.position.y, state.position.z);
        }
        if (state.rotation) {
            this.setRotation(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);
        }
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
    var xEnd = x == null ? null : x + (xq.length > 0 ? xq[xq.length - 5] : p.x._state);
    var yEnd = y == null ? null : y + (yq.length > 0 ? yq[yq.length - 5] : p.y._state);
    var zEnd = z == null ? null : z + (zq.length > 0 ? zq[zq.length - 5] : p.z._state);
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
    var queue = this.rotation._t._queue;
    var len = queue.length;
    var referenceQ;
    var arr;
    if (len !== 0) arr = queue[len - 5];
    else arr = this.rotation._t._state;
    referenceQ = Q2_REGISTER.set(arr[3], arr[0], arr[1], arr[2]);

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
        var q = c.get();
        node.setRotation(q[0], q[1], q[2], q[3]);
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if (isDirty) this._node.requestUpdateOnNextTick(this._id);
    else this._dirty = false;
};

Transform.prototype.onUpdate = Transform.prototype.clean;

module.exports = Transform;
