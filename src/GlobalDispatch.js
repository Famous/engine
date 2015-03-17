'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

/**
 * GlobalDispatch is being used in order to manage scene graph events. It
 * routes and manages events being registered on specific nodes, but also
 * provides the possibility to globally register event listeners on the
 * whole scene graph.
 *
 * @class  GlobalDispatch
 * @constructor
 */
function GlobalDispatch () {
    this._targetedCallbacks = {};
    this._globalCallbacks = [];
}

/**
 * Triggers the `event` defined by `key` (type of event) on a Node in the
 * scene graph hierarchy defined as a series of RenderProxy id's composing the
 * path exactly that Node.
 *
 * @method targetedTrigger
 * @chainable
 * 
 * @param  {String} path    path to the respective Node in the scene graph
 *                          defined as series of RenderProxy ids.
 * @param  {String} key     arbitrary event type (e.g. "click", "move")
 * @param  {Object} ev      event object
 * @return {GlobalDispatch} this    
 */
GlobalDispatch.prototype.targetedTrigger = function targetedTrigger(path, key, ev) {
    if (this._targetedCallbacks[path]) this._targetedCallbacks[path].trigger(key, ev);
    return this;
};

/**
 * Registers an event listener for an event being emitted on a specific node in
 * the scene graph hierarchy.
 *
 * @method targetedOn
 * @chainable
 * 
 * @param  {String} path    path to the respective Node in the scene graph
 *                          defined as series of RenderProxy ids.
 * @param  {String} key     arbitrary event type (e.g. "click", "move")
 * @param  {Function} cb    callback function to be invoked whenever the event
 *                          defined by `path` and `key` is being triggered.
 * @return {GlobalDispatch} this
 */
GlobalDispatch.prototype.targetedOn = function targetedOn (path, key, cb) {
    if (!this._targetedCallbacks[path]) this._targetedCallbacks[path] = new CallbackStore();
    this._targetedCallbacks[path].on(key, cb);
    return this;
};

/**
 * Removes a previously via `targetedOn` registered event listener,
 *
 * @method targetedOff
 * @chainable
 * 
 * @param  {String} path    path to the respective Node in the scene graph
 *                          defined as series of RenderProxy ids.
 * @param  {String} key     arbitrary event type (e.g. "click", "move")
 * @param  {Function} cb    previously via `targetedOn` registered callback function
 * @return {GlobalDispatch} this
 */
GlobalDispatch.prototype.targetedOff = function targetedOff (path, key, cb) {
    if (!this._targetedCallbacks[path]) this._targetedCallbacks[path].off(key, cb);
    return this;
};

/**
 * Globally registers an event listener. Listeners registerd using this method
 * can not be triggered by their path, but only globally by the event they
 * have been registered on.
 *
 * @method  globalOn
 * @chainable
 * 
 * @param  {String} path    path to the respective Node in the scene graph
 *                          defined as series of RenderProxy ids. This will
 *                          only be used in order to extract `depth` of this
 *                          Node in the scene graph.
 * @param  {String}   key   arbitrary event type (e.g. "click", "move")
 * @param  {Function} cb    callback function to be called whenever an event
 *                          in the SceneGraph 
 * @return {GlobalDispatch} this
 */
GlobalDispatch.prototype.globalOn = function globalOn (path, key, cb) {
    var depth = path.split('/').length;
    if (!this._globalCallbacks[depth]) this._globalCallbacks[depth] = new CallbackStore();
    this._globalCallbacks[depth].on(key, cb);
    return this;
};

// TODO @dan Do we need this?
// FIXME different path, same depth, same callback -> would deregister cb

/**
 * Removed an event listener that has previously been registered using
 * `globalOn`.
 *
 *
 * @method  globalOn
 * @chainable
 * 
 * @param  {String}   path  path to the respective node the listener has been
 *                          registered on. Used inly to extract the `depth`
 *                          from it.
 * @param  {String}   key   event type used for registering the event listener
 * @param  {Function} cb    registered callback function
 * @return {GlobalDispatch} this
 */
GlobalDispatch.prototype.globalOff = function globalOff (path, key, cb) {
    var depth = path.split('/').length;
    if (this._globalCallbacks[depth]) this._globalCallbacks[depth].off(key, cb);
    return this;
}

/**
 * Triggers all global event listeners registered on the specified type.
 *
 * @method  emit
 * @chainable
 * 
 * @param  {String} key     event type
 * @param  {Object} ev      event object
 * @return {GlobalDispatch} this
 */
GlobalDispatch.prototype.emit = function emit (key, ev) {
    for (var i = 0, len = this._globalCallbacks.length ; i < len ; i++)
        if (this._globalCallbacks[i])
            this._globalCallbacks[i].trigger(key, ev);
    return this;
};

module.exports = GlobalDispatch;
