'use strict';

var Transitionable = require('famous-transitions').Transitionable;

function Opacity(dispatch) {
    this._dispatch = dispatch;
    this._id = dispatch.addComponent(this);
    this._value = new Transitionable(1);
}

Opacity.toString = function toString() {
    return 'Opacity';
};

Opacity.prototype.getState = function getState() {
    return {
        component: this.constructor.toString(),
        value: this._value.get()
    };
};

Opacity.prototype.setState = function setState(state) {
    if (this.constructor.toString() === state.component) {
        this.set(state.value);
        return true;
    }
    return false;
};

Opacity.prototype.clean = function clean() {
    var context = this._dispatch._context;
    context.setOpacity(this._value.get());
    return this._value.isActive();
};

Opacity.prototype.set = function set(value, options) {
    this._dispatch.dirtyComponent(this._id);
    this._value.set(value, options);
    return this;
};

Opacity.prototype.halt = function halt() {
    this._value.halt();
    return this;
};

module.exports = Opacity;
