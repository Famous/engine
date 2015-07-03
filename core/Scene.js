/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jshint -W079 */

'use strict';

var Node = require('./Node');
var Dispatch = require('./Dispatch');
var Commands = require('./Commands');
var TransformSystem = require('./TransformSystem');
var SizeSystem = require('./SizeSystem');

/**
 * Scene is the bottom of the scene graph. It is its own
 * parent and provides the global updater to the scene graph.
 *
 * @class Scene
 * @constructor
 *
 * @param {String} selector a string which is a dom selector
 *                 signifying which dom element the context
 *                 should be set upon
 * @param {Famous} updater a class which conforms to Famous' interface
 *                 it needs to be able to send methods to
 *                 the renderers and update nodes in the scene graph
 */
function Scene (selector, updater) {
    if (!selector) throw new Error('Scene needs to be created with a DOM selector');
    if (!updater) throw new Error('Scene needs to be created with a class like Famous');

    Node.call(this);         // Scene inherits from node

    this._globalUpdater = updater; // The updater that will both
                                   // send messages to the renderers
                                   // and update dirty nodes

    this._selector = selector; // reference to the DOM selector
                               // that represents the element
                               // in the dom that this context
                               // inhabits

    this.mount(selector); // Mount the context to itself
                          // (it is its own parent)

    this._globalUpdater                  // message a request for the dom
        .message(Commands.NEED_SIZE_FOR)  // size of the context so that
        .message(selector);               // the scene graph has a total size

    this.show(); // the context begins shown (it's already present in the dom)
}

// Scene inherits from node
Scene.prototype = Object.create(Node.prototype);
Scene.prototype.constructor = Scene;
Scene.NO_DEFAULT_COMPONENTS = true;

/**
 * Scene getUpdater function returns the passed in updater
 *
 * @return {Famous} the updater for this Scene
 */
Scene.prototype.getUpdater = function getUpdater () {
    return this._updater;
};

/**
 * Returns the selector that the context was instantiated with
 *
 * @return {String} dom selector
 */
Scene.prototype.getSelector = function getSelector () {
    return this._selector;
};

/**
 * Returns the dispatcher of the context. Used to send events
 * to the nodes in the scene graph.
 *
 * @return {Dispatch} the Scene's Dispatch
 * @deprecated
 */
Scene.prototype.getDispatch = function getDispatch () {
    console.warn('Scene#getDispatch is deprecated, require the dispatch directly');
    return Dispatch;
};

/**
 * Receives an event. If the event is 'CONTEXT_RESIZE' it sets the size of the scene
 * graph to the payload, which must be an array of numbers of at least
 * length three representing the pixel size in 3 dimensions.
 *
 * @param {String} event the name of the event being received
 * @param {*} payload the object being sent
 *
 * @return {undefined} undefined
 */
Scene.prototype.onReceive = function onReceive (event, payload) {
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

        this.setSizeMode('absolute', 'absolute', 'absolute');
        this.setAbsoluteSize(payload[0],
                             payload[1],
                             payload[2] ? payload[2] : 0);

        this._updater.message(Commands.WITH).message(this._selector).message(Commands.READY);
    }
};


Scene.prototype.mount = function mount (path) {
    if (this.isMounted())
        throw new Error('Scene is already mounted at: ' + this.getLocation());
    Dispatch.mount(path, this);
    this._id = path;
    this._mounted = true;
    this._parent = this;
    TransformSystem.registerTransformAtPath(path);
    SizeSystem.registerSizeAtPath(path);
};

module.exports = Scene;
