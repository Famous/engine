'use strict';

function FunctionRegistry() {
    this._registry = {};
    this._id = 0;
}

FunctionRegistry.prototype.register = function register (fn) {
    var id = this._id++;
    this._registry[id] = fn;
    return id;
}

FunctionRegistry.prototype.invoke = function invoke (id, args) {
    this._registry[id].apply(null, args);
    this._registry[id] = null;
    return this;
};

module.exports = FunctionRegistry;
