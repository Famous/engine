'use strict';

var Dispatch = require('./Dispatch');
var Node = require('./Node');
var Size = require('./Size');

/**
 * Context is the bottom of the scene graph. It is it's own
 * parent and provides the global updater to the scene graph.
 *
 * @class Context
 * @constructor
 *
 * @param {String} selector a string which is a dom selector
 *                 signifying which dom element the context
 *                 should be set upon
 * @param {Famous} a class which conforms to Famous' interface
 *                 it needs to be able to send methods to
 *                 the renderers and update nodes in the scene graph
 */
function Context (selector, updater) {
    if (!selector) throw new Error('Context needs to be created with a DOM selector');
    if (!updater) throw new Error('Context needs to be created with a class like Famous');

    Node.call(this);         // Context inherits from node

    this._updater = updater; // The updater that will both
                             // send messages to the renderers
                             // and update dirty nodes 

    this._dispatch = new Dispatch(this); // instantiates a dispatcher
                                         // to send events to the scene
                                         // graph below this context
    
    this._selector = selector; // reference to the DOM selector
                               // that represents the elemnent
                               // in the dom that this context
                               // inhabits

    this.onMount(this, selector); // Mount the context to itself
                                  // (it is its own parent)
    
    this._updater                  // message a request for the dom
        .message('NEED_SIZE_FOR')  // size of the context so that
        .message(selector);        // the scene graph has a total size

    this.show(); // the context begins shown (it's already present in the dom)

}

// Context inherits from node
Context.prototype = Object.create(Node.prototype);
Context.prototype.constructor = Context;

/**
 * Context getUpdater function returns the passed in updater
 *
 * @return {Famous} the updater for this Context
 */
Context.prototype.getUpdater = function getUpdater () {
    return this._updater;
};

/**
 * Returns the selector that the context was instantiated with
 *
 * @return {String} dom selector
 */
Context.prototype.getSelector = function getSelector () {
    return this._selector;
};

/**
 * Returns the dispatcher of the context. Used to send events
 * to the nodes in the scene graph.
 *
 * @return {Dispatch} the Context's Dispatch
 */
Context.prototype.getDispatch = function getDispatch () {
    return this._dispatch;
};

/**
 * Receives an event. If the event is 'CONTEXT_RESIZE' it sets the size of the scene
 * graph to the payload, which must be an array of numbers of at least
 * length three representing the pixel size in 3 dimensions.
 *
 * @param {String} event
 * @param {*} payload
 */
Context.prototype.onReceive = function onReceive (event, payload) {
    // TODO: In the future the dom element that the context is attached to
    // should have a representation as a component. It would be render sized
    // and the context would receive its size the same way that any render size
    // component receives its size.
    if (event === 'CONTEXT_RESIZE') {
        
        if (payload.length < 2) 
            throw new Error(
                    'CONTEXT_RESIZE\'s payload needs to be at least a pair' +
                    ' of pixel sizes'
            );

        this.setSizeMode(Size.ABSOLUTE, Size.ABSOLUTE, Size.ABSOLUTE);
        this.setAbsoluteSize(payload[0],
                             payload[1],
                             payload[2] ? payload[2] : 0);

    }
};

module.exports = Context;

