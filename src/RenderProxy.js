'use strict';

var index = 0;
var SLASH = '/';

/**
 * RenderProxy recursively delegates commands to its parent in order to queue
 * messages to be sent on the next FRAME and uniquely identifies the node it is
 * being managed by in the scene graph by exposing a global `path` describing
 * its location.
 * 
 * @class  RenderProxy
 * @constructor
 * 
 * @param {RenderProxy|Context} parent parent used for recursively obtaining
 *                                     the path to the corresponding node
 */
function RenderProxy (parent) {
    this._parent = parent;
    this._id = SLASH + index++;
}

/**
 * Retrieves the renderpath
 * 
 * @return {String} render path
 */
RenderProxy.prototype.getRenderPath = function getRenderPath () {
    return this._parent.getRenderPath() + this._id;
};

/**
 * Appends a command to the MessageQueue by recursively passing it up to its
 * parent until the top-level Context is being reached.
 *
 * @method  receive
 * @chainable
 * 
 * @param  {Object} command command to be appended to the MessageQueue.
 *                          Usually a string literal, but can be any object
 *                          that can be cloned by the by the structured clone
 *                          algorithm used to serialize messages to be sent to
 *                          the main thread. This includes object literals
 *                          containing circular references.
 * @return {RenderProxy}    this
 */
RenderProxy.prototype.receive = function receive (command) {
    this._parent.receive(command);
    return this;
};


// @dan This is never being used. Can we remove it?

RenderProxy.prototype.send = function send () {
    this._parent.send();
    return this;
};

module.exports = RenderProxy;
