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
        
Position.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setPosition(this._x.get(), this._y.get(), this._z.get());
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

Position.prototype.setX = function setX(val, options) {
    this._dispatch.dirtyComponent(this._id);
    return this._x.set(val, options);
};

Position.prototype.setY = function setY(val, options) {
    this._dispatch.dirtyComponent(this._id);
    return this._y.set(val, options);
};

Position.prototype.setZ = function setZ(val, options) {
    this._dispatch.dirtyComponent(this._id);
    return this._z.set(val, options);
};

Position.prototype.set = function set(x, y, z, options) {
    this._dispatch.dirtyComponent(this._id);
    this._x.set(x, options);
    this._y.set(y, options);
    this._z.set(z, options);
    return this;
};

Position.prototype.halt = function halt() {
    this._x.halt();
    this._y.halt();
    this._z.halt();
    return this;
};

module.exports = Position;
