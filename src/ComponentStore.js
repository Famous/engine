'use strict';

var Layer = require('./Layer');

/**
 * ComponentStore manages `components` and `renderables`. It also keeps track
 * of the size shared by all renderables managed by this ComponentStore.
 *
 * Every LocalDispatch has its own ComponentStore.
 *
 * @class ComponentStore
 * @constructor
 * @private
 */
function ComponentStore () {
    this._components = new Layer();
    this._renderables = new Layer();
    this._currentRenderableSize = [0, 0, 0];
}

/**
 * Clears all components by delegating to the layer they are being managed on.
 *
 * @method clearComponents
 * @chainable
 * 
 * @return {ComponentStore} this
 */
ComponentStore.prototype.clearComponents = function clearComponents () {
    this._components.clear();
    return this;
};

/**
 * Clears all renderables by delegating to the layer they are being managed on.
 *
 * @method clearRenderables
 * @chainable
 * 
 * @return {ComponentStore} this
 */
ComponentStore.prototype.clearRenderables = function clearRenderables () {
    this._renderables.clear();
    return this;
};

/**
 * Clears all components and renderables managed by this ComponentStore by
 * delegating to the respective layers.
 *
 * @method clear
 * @chainable
 * 
 * @return {ComponentStore} this
 */
ComponentStore.prototype.clear = function clear () {
    return this.clearComponents().clearRenderables();
};

/**
 * @alias ComponentStore.prototype.clear
 */
ComponentStore.prototype.kill = ComponentStore.prototype.clear;

/**
 * Cleans the underlying layer responsible for maintaining components.
 *
 * @method cleanComponents
 * @chainable
 * 
 * @return {ComponentStore} this
 */
ComponentStore.prototype.cleanComponents = function cleanComponents () {
    this._components.clean();
    return this;
};

/**
 * Cleans the underlying layer responsible for maintaining renderables.
 *
 * @method cleanRenderables
 * @chainable
 * 
 * @return {ComponentStore} this
 */
ComponentStore.prototype.cleanRenderables = function cleanRenderables () {
    this._renderables.clean();
    return this;
};

/**
 * Cleans the renderables and components managed by this ComponentStore.
 *
 * @method clean
 * @chainable
 * 
 * @return {ComponentStore} this
 */
ComponentStore.prototype.clean = function clean () {
    return this.cleanComponents().cleanRenderables();
};

/**
 * Returns a new component id that can be used in order to register a new
 * component on the ComponentStore using `registerComponentAt`.
 *
 * @method requestComponentId
 * 
 * @return {Number} id that can be used to register a new component using
 *                     `registerComponentAt`
 */
ComponentStore.prototype.requestComponentId = function requestComponentId () {
    return this._components.requestId();
};

/**
 * Returns a new renderable id that can be used in order to register a new
 * renderable on the ComponentStore using `registerRenderableAt`.
 *
 * @method requestComponentId
 * 
 * @return {Number} id that can be used to register a new renderable using
 *                     `registerRenderableAt`
 */
ComponentStore.prototype.requestRenderableId = function requestRenderableId () {
    return this._renderables.requestId();
};

/**
 * Registers the passed in component on the ComponentStore at the specified id.
 *
 * @method  registerComponentAt
 * @chainable
 * 
 * @param  {Number} id              unique id, preferably previously retrieved using
 *                                  `requestComponentId`
 * @param  {Component} component    component to be registered
 * @return {ComponentStore}         this
 */
ComponentStore.prototype.registerComponentAt = function registerComponentAt (id, component) {
    this._components.registerAt(id, component);
    return this;
};

/**
 * Registers the passed in renderable on the ComponentStore at the specified
 * id.
 *
 * @method  registerRenderableAt
 * @chainable
 * 
 * @param  {Number} id              unique id, preferably previously retrieved using
 *                                  `requestRenderableId`
 * @param  {Component} component    renderable to be registered
 * @return {ComponentStore}         this
 */
ComponentStore.prototype.registerRenderableAt = function registerRenderableAt (id, renderable) {
    this._renderables.registerAt(id, renderable);
    return this;
};

/**
 * Dirties the component registered at the specified id.
 *
 * @method makeComponentDirtyAt
 * @chainable
 * 
 * @param  {Component} id   id at which the component has previously been
 *                          registered using `registerComponentAt`
 * @return {ComponentStore} this
 */
ComponentStore.prototype.makeComponentDirtyAt = function makeComponentDirtyAt (id) {
    this._components.dirtyAt(id);
    return this;
};

/**
 * Dirties the renderable registered at the specified id.
 *
 * @method makeRenderableDirtyAt
 * @chainable
 * 
 * @param  {Component} id   id at which the renderable has previously been
 *                          registered using `registerComponentAt`
 * @return {ComponentStore} this
 */
ComponentStore.prototype.makeRenderableDirtyAt = function makeRenderableDirtyAt (id) {
    this._renderables.dirtyAt(id);
    return this;
};

/**
 * Cleans the component registered at the specified id.
 *
 * @method  cleanComponentAt
 * @chainable
 * 
 * @param  {Component} id   id at which the component has previously been
 *                          registered using `registerComponentAt`
 * @return {ComponentStore} this
 */
ComponentStore.prototype.cleanComponentAt = function cleanComponentAt (id) {
    this._components.cleanAt(id);
    return this;
};

/**
 * Cleans the renderable registered at the specified id.
 *
 * @method  cleanRenderableAt
 * @chainable
 * 
 * @param  {Renderable} id  id at which the renderable has previously been
 *                          registered using `registerRenderableAt`
 * @return {ComponentStore} this
 */
ComponentStore.prototype.cleanRenderableAt = function cleanRenderableAt (id) {
    this._renderables.cleanAt(id);
    return this;
};

/**
 * Retrieves the component registered at the specified id.
 *
 * @method  getComponentAt
 * @chainable
 * 
 * @param  {Component} id   id at which the component has previously been
 *                          registered using `registerComponentAt`
 * @return {ComponentStore} this
 */
ComponentStore.prototype.getComponentAt = function getComponentAt (id) {
    return this._components.getAt(id);
};

/**
 * Retrieves the renderable registered at the specified id.
 *
 * @method  getRenderableAt
 * @chainable
 * 
 * @param  {Renderable} id  id at which the renderable has previously been
 *                          registered using `registerRenderableAt`
 * @return {ComponentStore} this
 */
ComponentStore.prototype.getRenderableAt = function getRenderableAt (id) {
    return this._renderables.getAt(id);
};

/**
 * Retrieves all components registered on this ComponentStore.
 *
 * @method getComponents
 * 
 * @return {Components[]} set of all components that have previously been
 *                        registered on this ComponentStore
 */
ComponentStore.prototype.getComponents = function getComponents () {
    return this._components.get();
};

/**
 * Retrieves all renderables registered on this ComponentStore.
 *
 * @method getRenderable
 * 
 * @return {Renderables[]}  set of all renderables that have previously
 *                          been registered on this ComponentStore
 */
ComponentStore.prototype.getRenderables = function getRenderables () {
    return this._renderables.get();
};

/**
 * Determines and returns the absolute, three dimensional **pixel** size
 * allocated to renderables on this ComponentStore.
 *
 * @chainable
 * @method getRenderableSize
 * 
 * @return {Number[]} three dimensional **pixel** size in the format
 *                    `[width, height, depth]`
 */
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
