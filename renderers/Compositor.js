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

'use strict';

var Context = require('./Context');
var injectCSS = require('./inject-css');

/**
 * Instantiates a new Compositor, used for routing commands received from the
 * the global FamousEngine core singleton or WebWorker to the WebGL and DOM renderer.
 *
 * @class Compositor
 * @constructor
 * @return {undefined} undefined
 */
function Compositor() {
    injectCSS();

    this._contexts = {};
    this._outCommands = [];
    this._inCommands = [];
    this._time = null;

    this._resized = false;

    var _this = this;
    window.addEventListener('resize', function() {
        _this._resized = true;
    });
}

/**
 * Retrieves the time being used by the internal clock managed by
 * `FamousEngine`.
 *
 * @method
 *
 * @return {Number}     Clock time.
 */
Compositor.prototype.getTime = function getTime() {
    return this._time;
};

/**
 * Schedules an event to be sent the next time the out command
 * queue is being flushed.
 *
 * @method
 * @private
 *
 * @param  {String} path    render path to the node the event should be
 *                          triggered on (*targeted event*)
 * @param  {String} ev      event type
 * @param  {Object} payload event object (serializable using structured
 *                          cloning algorithm)
 * @return {undefined} undefined
 */
Compositor.prototype.sendEvent = function sendEvent(path, ev, payload) {
    this._outCommands.push('WITH', path, 'TRIGGER', ev, payload);
};

/**
 * Internal helper method used for notifying externally
 * resized contexts (e.g. by resizing the browser window).
 *
 * @method
 * @private
 *
 * @param  {String} selector    render path to the node (context) that should
 *                              be resized
 * @param  {Array} size         new context size
 * @return {undefined} undefined
 */
Compositor.prototype.sendResize = function sendResize (selector, size) {
    this.sendEvent(selector, 'CONTEXT_RESIZE', size);
};

/**
 * Internal helper method used by `drawCommands`.
 *
 * @method
 * @private
 *
 * @param  {Number} iterator    position index within the commands queue
 * @param  {Array}  commands    remaining message queue received,
 *                              used to shift single messages from
 */
Compositor.prototype.handleWith = function handleWith (iterator, commands) {
    var path = commands[iterator];
    var pathArr = path.split('/');
    var context = this.getOrSetContext(pathArr.shift());
    return context.receive(path, commands, iterator);
};

/**
 * Retrieves the top-level Context associated with the passed in document
 * query selector. If no such Context exists, a new one will be instantiated.
 *
 * @method
 * @private
 *
 * @param  {String} selector            document query selector used for
 *                                      retrieving the DOM node the
 *                                      VirtualElement should be attached to
 * @return {Object} result
 * @return {Context}                    final VirtualElement
 */
Compositor.prototype.getOrSetContext = function getOrSetContext(selector) {
    if (this._contexts[selector]) return this._contexts[selector];
    else return (this._contexts[selector] = new Context(selector, this));
};

/**
 * Internal helper method used by `drawCommands`.
 *
 * @method
 * @private
 *
 * @param  {Number} iterator    position index within the commands queue
 * @param  {Array} commands     remaining message queue received,
 *                              used to shift single messages
 * @return {undefined} undefined
 */
Compositor.prototype.giveSizeFor = function giveSizeFor(iterator, commands) {
    var selector = commands[iterator];
    var size = this.getOrSetContext(selector).getRootSize();
    this.sendResize(selector, size);
};

/**
 * Processes the previously via `receiveCommands` updated incoming "in"
 * command queue.
 * Called by ThreadManager.
 *
 * @method
 *
 * @return {Array} outCommands  set of commands to be sent back
 */
Compositor.prototype.drawCommands = function drawCommands() {
    var commands = this._inCommands;
    var localIterator = 0;
    var command = commands[localIterator];
    while (command) {
        switch (command) {
            case 'TIME':
                this._time = commands[++localIterator];
                break;
            case 'WITH':
                localIterator = this.handleWith(++localIterator, commands);
                break;
            case 'NEED_SIZE_FOR':
                this.giveSizeFor(++localIterator, commands);
                break;
        }
        command = commands[++localIterator];
    }

    // TODO: Switch to associative arrays here...

    for (var key in this._contexts) {
        this._contexts[key].draw();
    }

    if (this._resized && this._contexts.body) {
        this.sendResize('body', this._contexts.body.getRootSize());
    }

    return this._outCommands;
};

/**
 * Used by ThreadManager to update the interal queue of incoming commands.
 * Receiving commands does not immediately start the rederning process.
 *
 * @param  {Array} commands     command queue to be processed by the
 *                              compositor's `drawCommands` method
 * @return {undefined} undefined
 */
Compositor.prototype.receiveCommands = function receiveCommands(commands) {
    var len = commands.length;
    for (var i = 0; i < len; i++) {
        this._inCommands.push(commands[i]);
    }
};

/**
 * Flushes the queue of outgoing "out" commands.
 * Called by ThreadManager.
 *
 * @method
 * @return {undefined} undefined
 */
Compositor.prototype.clearCommands = function clearCommands() {
    this._inCommands.length = 0;
    this._outCommands.length = 0;
    this._resized = null;
};

module.exports = Compositor;
