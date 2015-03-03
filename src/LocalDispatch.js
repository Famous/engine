'use strict';

var RenderContext = require('./RenderContext');
var ComponentStore = require('./ComponentStore');
var RenderProxy = require('./RenderProxy');

function LocalDispatch (node, proxy) {
    this._renderProxy = new RenderProxy(proxy);
    this._context = new RenderContext(this);
    this._componentStore = new ComponentStore(this);
    this._node = node;
}

LocalDispatch.prototype.kill = function kill () {
    this._componentStore.kill();
    return this;
};

LocalDispatch.prototype.getNode = function getNode () {
    return this._node;
};

LocalDispatch.prototype.getContext = function getContext () {
    return this._context;
};

LocalDispatch.prototype.getRenderPath = function getRenderPath () {
    return this._renderProxy.getRenderPath();
};

LocalDispatch.prototype.registerTargetedEvent = function registerTargetedEvent (event, cb) {
    this._node._globalDispatch.targetedOn(this.getRenderPath(), event, cb);
    return this;
};

LocalDispatch.prototype.registerGlobalEvent = function registerGlobalEvent (event, cb) {
    this._node._globalDispatch.globalOn(this.getRenderPath(), event, cb);
    return this;
};

LocalDispatch.prototype.emit = function emit (event, payload) {
    this._node._globalDispatch.emit(event, payload);
    return this;
};

LocalDispatch.prototype.cleanComponents = function cleanComponents () {
    this._componentStore.cleanComponents();
    return this;
};

LocalDispatch.prototype.cleanRenderContext = function cleanRenderContext (parentNode) {
    this._context.update(parentNode.getDispatch()._context);
    return this;
};

LocalDispatch.prototype.cleanRenderables = function cleanRenderables () {
    this._componentStore.cleanRenderables();
    return this;
};

LocalDispatch.prototype.addComponent = function addComponent (component) {
    var store = this._componentStore;
    var id = store.requestComponentId();
    store.registerComponentAt(id, component);
    return id;
};

LocalDispatch.prototype.dirtyComponent = function dirtyComponent (id) {
    this._componentStore.makeComponentDirtyAt(id);
    return this;
};

LocalDispatch.prototype.addRenderable = function addRenderable (renderable) {
    var store = this._componentStore;
    var id = store.requestRenderableId();
    store.registerRenderableAt(id, renderable);
    return id;
};

LocalDispatch.prototype.dirtyRenderable = function dirtyRenderable (id) {
    this._componentStore.makeRenderableDirtyAt(id);
    return this;
};

LocalDispatch.prototype.onTransformChange = function onTransformChange (cb) {
    this._context.onTransformChange(cb);
    return this;
};

LocalDispatch.prototype.onSizeChange = function onSizeChange (cb) {
    this._context.onSizeChange(cb);
    return this;
};

LocalDispatch.prototype.onOriginChange = function onOriginChange (cb) {
    this._context.onOriginChange(cb);
    return this;
};

LocalDispatch.prototype.onOpacityChange = function onOpacityChange (cb) {
    this._context.onOpacityChange(cb);
    return this;
};

LocalDispatch.prototype.sendDrawCommand = function sendDrawCommand (command) {
    this._renderProxy.receive(command);
    return this;
};

LocalDispatch.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this._context.setAbsolute(x, y, z);
    return this;
};

LocalDispatch.prototype.setDifferential = function setDifferential (x, y, z) {
    this._context.setDifferential(x, y, z);
    return this;
};

LocalDispatch.prototype.setProportions = function setProportions (x, y, z) {
    this._context.setProportions(x, y, z);
    return this;
};

LocalDispatch.prototype.getTotalRenderableSize = function getTotalRenderableSize () {
    return this._componentStore.getRenderableSize();
};

LocalDispatch.prototype.getRenderables = function getRenderables () {
    return this._componentStore.getRenderables();
};

LocalDispatch.prototype.hasRenderables = function hasRenderables () {
    return !!this._componentStore.getRenderables().length;
};

LocalDispatch.prototype.dirtyRenderContext = function dirtyRenderContext () {
    this._context.dirty();
    return this;
};

module.exports = LocalDispatch;
