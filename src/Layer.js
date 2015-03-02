'use strict';

function Layer () {
    this._components = [];
    this._componentIsDirty = [];
}

Layer.prototype.clear = function clear () {
    var components = this._components;
    var componentIsDirty = this._componentIsDirty;
    var i = 0;
    var len = components.length;
    var component;
    for (; i < len ; i++) {
        component = components.shift();
        componentIsDirty.shift();
        if (component.kill) component.kill();
    }
    return this;
};

Layer.prototype.requestId = function requestId () {
    return this._components.length;
};

Layer.prototype.registerAt = function registerAt (id, component) {
    this._components[id] = component;
    this._componentIsDirty[id] = false;
    return this;
};

Layer.prototype.dirtyAt = function dirtyAt (id) {
    this._componentIsDirty[id] = true;
    return this;
};

Layer.prototype.cleanAt = function cleanAt (id) {
    this._componentIsDirty[id] = this._components[id].clean ? this._components[id].clean() : true;
    return this;
};

Layer.prototype.clean = function clean () {
    var i = 0;
    var len = this._components.length;
    for (; i < len ; i++) if (this._componentIsDirty[i]) this.cleanAt(i);
    return this;
};

Layer.prototype.getAt = function getAt (id) {
    return this._components[id];
};

Layer.prototype.get = function get () {
    return this._components;
};

module.exports = Layer;
