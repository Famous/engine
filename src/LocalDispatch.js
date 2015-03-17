'use strict';

var RenderContext = require('./RenderContext');
var ComponentStore = require('./ComponentStore');
var RenderProxy = require('./RenderProxy');

/**
 * As opposed to a Node, a LocalDispatch does not define hierarchical
 * structures within the scene graph. Thus removing the need to manage
 * children, but at the same time requiring the Node to delegate updates to its
 * own LocalDispatch and all subsequent Nodes.
 *
 * The primary responsibilty of the LocalDispatch is to provide the ability to
 * register events on a specific Node ("targeted events"), without inducing the
 * complexity of determining the Nodes location within the scene graph.
 *
 * It also holds a reference to a RenderContext, therefore being required to
 * delegate invocations of its update function to its RenderContext, which
 * consequently mutates the actual 3D transform matrix associated with the
 * Node.
 *
 * @class  LocalDispatch
 * @constructor
 * 
 * @param {Node} node           Node being managed by the LocalDispatch.
 * @param {RenderProxy} proxy   RenderProxy associated with the managed Node's
 *                              parent.
 */
function LocalDispatch (node, proxy) {
    this._renderProxy = new RenderProxy(proxy);
    this._context = new RenderContext(this);
    this._componentStore = new ComponentStore(this);
    this._node = node;
}

/**
 * Kills the componentstore of the LocalDispatchm therefore killing all
 * Renderables and Components registered for the managed node.
 *
 * @method kill
 * @chainable
 * 
 * @return {LocalDispatch} this
 */
LocalDispatch.prototype.kill = function kill () {
    this._componentStore.kill();
    return this;
};

/**
 * Returns the managed Node.
 *
 * @method getNode
 * 
 * @return {Node} managed Node
 */
LocalDispatch.prototype.getNode = function getNode () {
    return this._node;
};

/**
 * Retrieves the RenderContext managed by the LocalDispatch.
 *
 * @method getContext
 * 
 * @return {RenderContext}  RenderContext managed by the LocalDispatch
 */
LocalDispatch.prototype.getContext = function getContext () {
    return this._context;
};

LocalDispatch.prototype.getRenderPath = function getRenderPath () {
    return this._renderProxy.getRenderPath();
};

LocalDispatch.prototype.getRenderProxy = function getRenderProxy () {
    return this._renderProxy;
};

LocalDispatch.prototype.registerTargetedEvent = function registerTargetedEvent (event, cb) {
    this._node._globalDispatch.targetedOn(this.getRenderPath(), event, cb);
    return this;
};

LocalDispatch.prototype.registerGlobalEvent = function registerGlobalEvent (event, cb) {
    this._node._globalDispatch.globalOn(this.getRenderPath(), event, cb);
    return this;
};

LocalDispatch.prototype.deregisterGlobalEvent = function deregisterGlobalEvent (event, cb) {
    this._node._globalDispatch.globalOff(this.getRenderPath(), event, cb);
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
    this._context.update(parentNode ? parentNode.getDispatch()._context : void 0);
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

LocalDispatch.prototype.update = function update (parent) {
    this.cleanComponents()
        .cleanRenderContext(parent)
        .cleanRenderables();
    return this;
};

module.exports = LocalDispatch;
