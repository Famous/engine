'use strict';

var Transitionable = require('famous-transitions').Transitionable;

function Position(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this._x = new Transitionable(0);
    this._y = new Transitionable(0);
    this._z = new Transitionable(0);
}

Position.toString = function toString() {
    return 'Position';
};

Position.prototype.getState = function getState() {
    return {
        component: this.constructor.toString(),
        x: this._x.get(),
        y: this._y.get(),
        z: this._z.get()
    };
};

Position.prototype.setState = function setState(state) {
    if (state.component === this.constructor.toString()) {
        this.set(state.x, state.y, state.z);
        return true;
    }
    return false;
};

Position.prototype.getX = function getX() {
    return this._x.get();
};

Position.prototype.getY = function getY() {
    return this._y.get();
};

Position.prototype.getZ = function getZ() {
    return this._z.get();
};

Position.prototype.isActive = function isActive() {
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

Position.prototype.clean = function clean() {
    var context = this._dispatch.getContext();
    context.setPosition(this._x.get(), this._y.get(), this._z.get());
    return this.isActive();
};

Position.prototype.setX = function setX(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._x.set(val, options, callback);
    return this;
};

Position.prototype.setY = function setY(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._y.set(val, options, callback);
    return this;
};

Position.prototype.setZ = function setZ(val, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._z.set(val, options, callback);
    return this;
};

Position.prototype.set = function set(x, y, z, options, callback) {
    this._dispatch.dirtyComponent(this._id);
    this._x.set(x, options, callback);
    this._y.set(y, options, callback);
    this._z.set(z, options, callback);
    return this;
};

Position.prototype.halt = function halt() {
    this._x.halt();
    this._y.halt();
    this._z.halt();
    return this;
};

module.exports = Position;
