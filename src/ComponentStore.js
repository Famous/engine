'use strict';

var Layer = require('./Layer');

function ComponentStore (dispatch) {
    this._components = new Layer();
    this._renderables = new Layer();
    this._currentRenderableSize = [0, 0, 0];
    this._localDispatch = dispatch;
}

ComponentStore.prototype.clearComponents = function clearComponents () {
    this._components.clear();
    return this;
};

ComponentStore.prototype.clearRenderables = function clearRenderables () {
    this._renderables.clear();
    return this;    
};

ComponentStore.prototype.clear = function clear () {
    this.clearComponents().clearRenderables();
};

ComponentStore.prototype.cleanComponents = function cleanComponents () {
    this._components.clean();
    return this;
};

ComponentStore.prototype.cleanRenderables = function cleanRenderables () {
    this._renderables.clean();
    return this;
};

ComponentStore.prototype.requestComponentId = function requestComponentId () {
    return this._components.requestId();
};

ComponentStore.prototype.requestRenderableId = function requestRenderableId () {
    return this._renderables.requestId();
};

ComponentStore.prototype.registerComponentAt = function registerComponentAt (id, component) {
    this._components.registerAt(id, component);
    return this;
};

ComponentStore.prototype.registerRenderableAt = function registerRenderableAt (id, renderable) {
    this._renderables.registerAt(id, renderable);
    return this;
};

ComponentStore.prototype.makeComponentDirtyAt = function makeComponentDirtyAt (id) {
    this._components.dirtyAt(id);
    return this;
};

ComponentStore.prototype.makeRenderableDirtyAt = function makeRenderableDirtyAt (id) {
    this._renderables.dirtyAt(id);
    return this;
};

ComponentStore.prototype.cleanComponentAt = function cleanComponentAt (id) {
    this._components.cleanAt(id);
    return this;
};

ComponentStore.prototype.cleanRenderableAt = function cleanRenderableAt (id) {
    this._renderables.cleanAt(id);
    return this;
};

ComponentStore.prototype.getComponentAt = function getComponentAt (id) {
    return this._components.getAt(id);
};

ComponentStore.prototype.getRenderableAt = function getRenderableAt (id) {
    return this._renderables.getAt(id);
};

ComponentStore.prototype.getComponents = function getComponents () {
    return this._components.get();
};

ComponentStore.prototype.getRenderables = function getRenderables () {
    return this._renderables.get();
};

ComponentStore.prototype.getRenderableSize = function getRenderableSize () {
    var renderables = this._renderables.get();
    var i = 0;
    var len = renderables.length;
    var size;
    this._currentRenderableSize[0] = 0;
    this._currentRenderableSize[1] = 0;
    this._currentRenderableSize[2] = 0;
    for (; i < len ; i++) {
        size = renderables[i].getSize();
        this._currentRenderableSize[0] = size[0] > this._currentRenderableSize[0] ? size[0] : this._currentRenderableSize[0];
        this._currentRenderableSize[1] = size[1] > this._currentRenderableSize[1] ? size[1] : this._currentRenderableSize[1];
        this._currentRenderableSize[2] = size[2] > this._currentRenderableSize[2] ? size[2] : this._currentRenderableSize[2];
    }
    return this._currentRenderableSize;
};

module.exports = ComponentStore;
