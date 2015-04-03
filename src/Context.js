'use strict';

var Node = require('./Node');
var RenderProxy = require('./RenderProxy');

/**
 * Context is the top-level node in the scene graph (= tree node).
 * As such, it populates the internal MessageQueue with commands received by
 * subsequent child-nodes. The Context is being updated by the Clock on every
 * FRAME and therefore recursively updates the scene grpah.
 *
 * @class  Context
 * @constructor
 * 
 * @param {String} [selector=body]  query selector used as container for
 *                                  context
 */
function Context (selector, messageQueue, globalDispatch, clock) {
    this._messageQueue = messageQueue;
    this._globalDispatch = globalDispatch;
    this._clock = clock;

    this._clock.update(this);

    this.proxy = new RenderProxy(this);
    this.node = new Node(this.proxy, this._globalDispatch);
    this.selector = selector || 'body';
    this.dirty = true;
    this.dirtyQueue = [];

    this._messageQueue.enqueue('NEED_SIZE_FOR').enqueue(this.selector);
    this._globalDispatch.targetedOn(this.selector, 'resize', this._receiveContextSize.bind(this));
}

/**
 * Adds a child to the internal list of child-nodes.
 *
 * @method addChild
 * @chainable
 *
 * @return {Context}    this
 */
Context.prototype.addChild = function addChild () {
    return this.node.addChild();
};

/**
 * Removes a node returned by `addChild` from the Context's immediate children.
 *
 * @method  removeChild
 * @chainable
 * 
 * @param  {Node} node   node to be removed
 * @return {Context}     this
 */
Context.prototype.removeChild = function removeChild (node) {
    this.node.removeChild(node);
    return this;
};

/**
 * Recursively updates all children.
 *
 * @method  update
 * @chainable
 * 
 * @return {Context}    this
 */
Context.prototype.update = function update () {
    this.node.update();
    return this;
};

/**
 * Returns the selector the Context is attached to. Terminates recursive
 * `getRenderPath` scheduled by `RenderProxy`.
 *
 * @method  getRenderPath
 * @private
 * 
 * @return {String} selector
 */
Context.prototype.getRenderPath = function getRenderPath () {
    return this.selector;
};

/**
 * Appends the passed in command to the internal MessageQueue, thus scheduling
 * it to be sent to the Main Thread on the next FRAME.
 *
 * @method  receive
 * @chainable
 * 
 * @param  {Object} command command to be enqueued
 * @return {Context}        Context
 */
Context.prototype.receive = function receive (command) {
    if (this.dirty) this.dirtyQueue.push(command);
    else this._messageQueue.enqueue(command);
    return this;
};

/**
 * Method being executed whenever the context size changes.
 *
 * @method  _receiveContextSize
 * @chainable
 * @private
 * 
 * @param  {Array} size  new context size in the format `[width, height]`
 * @return {Context}     this
 */
Context.prototype._receiveContextSize = function _receiveContextSize (size) {
    this.node
        .getDispatch()
        .getContext()
        .setAbsolute(size[0], size[1], 0);

    if (this.dirty) {
        this.dirty = false;
        for (var i = 0, len = this.dirtyQueue.length ; i < len ; i++) this.receive(this.dirtyQueue.shift());
    }

    return this;
};

module.exports = Context;