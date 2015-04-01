'use strict';

/**
 * Layers manage a set of components or renderables.
 * Components are expected to expose a `kill` method. Optionally they can
 * expose a clean method which will be called as soon as the layer they are
 * registered on is being cleaned and they are being dirty.
 *
 * @class  Layer
 * @constructor
 * @private
 */
function Layer () {
    this._components = [];
    this._componentIsDirty = [];
}


/**
 * Clears all components by `kill`ing all components having `kill` set to a
 * truthy value and removing them from the Layer.
 * 
 * @method clear
 * @chainable
 * 
 * @return {Layer} this
 */
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

/**
 * Returns an id which can be used in order to register a new component using
 * `registerAt`.
 *
 * @method  requestId
 * @chainable
 * 
 * @return {Number} new id
 */
Layer.prototype.requestId = function requestId () {
    return this._components.length;
};

/**
 * Registers the passed in component on the specified id. Does not dirty the
 * component.
 *
 * @method  registerAt
 * @chainable
 * 
 * @param  {Number} id              id to register component ad
 * @param  {Renderable|Component}   component or renderable to be registered
 * @return {Layer}                  this
 */
Layer.prototype.registerAt = function registerAt (id, component) {
    this._components[id] = component;
    this._componentIsDirty[id] = false;
    return this;
};

/**
 * Dirties the component regsitered at the specified id.
 *
 * @method  dirtyAt
 * @chainable
 * 
 * @param  {Number} id internal id of the component to be dirtied
 * @return {Layer}     this
 */
Layer.prototype.dirtyAt = function dirtyAt (id) {
    this._componentIsDirty[id] = true;
    return this;
};

/**
 * Cleans the component registered at the specified id.
 *
 * @method  cleanAt
 * @chainable
 * 
 * @param  {Number} id  internal id of the component to be cleaned
 * @return {Layer}      this
 */
Layer.prototype.cleanAt = function cleanAt (id) {
    this._componentIsDirty[id] = this._components[id].clean ? this._components[id].clean() : true;
    return this;
};

/**
 * Cleans all previously dirtied components.
 *
 * @method  clean
 * @chainable
 * 
 * @return {Layer} this
 */
Layer.prototype.clean = function clean () {
    var i = 0;
    var len = this._components.length;
    for (; i < len ; i++) if (this._componentIsDirty[i]) this.cleanAt(i);
    return this;
};

/**
 * Returns the component registered at the specified id.
 *
 * @method  getAt
 * @chainable
 * 
 * @param  {Number} id                          internal id of the requested component
 * @return {Renderable|Component|undefined}     registered component (if any)
 */
Layer.prototype.getAt = function getAt (id) {
    return this._components[id];
};

/**
 * Returns set of all registered components.
 *
 * @method  get
 * 
 * @return {Array} array of previously registered components
 */
Layer.prototype.get = function get () {
    return this._components;
};

module.exports = Layer;
