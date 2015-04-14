'use strict';

var VirtualElement = require('famous-dom-renderers').VirtualElement;
var strip = require('famous-utilities').strip;
var flatClone = require('famous-utilities').flatClone;

var Context = require('./Context');

/**
 * Instantiates a new Compositor, used for routing commands received from the
 * WebWorker to the WebGL and DOM renderer.
 *
 * @class Compositor
 * @constructor
 */
function Compositor() {
    this._contexts = {};
    this._outCommands = [];
    this._inCommands = [];

    this.clearCommands();
}

/**
 * Schedules an event to be sent to the WebWorker the next time the out command
 * queue is being flushed.
 *
 * @method sendEvent
 * @private
 *
 * @param  {String} path    render path to the node the event should be
 *                          triggered on (*targeted event*)
 * @param  {String} ev      event type
 * @param  {Object} payload event object (serializable using structured
 *                          cloning algorithm)
 */
Compositor.prototype.sendEvent = function sendEvent(path, ev, payload) {
    this._outCommands.push('WITH', path, 'TRIGGER', ev, payload);
};

/**
 * Internal helper method used by `drawCommands`.
 *
 * @method handleWith
 * @private
 *
 * @param  {Array} commands     remaining message queue received from the
 *                              WebWorker, used to shift single messages from
 */
Compositor.prototype.handleWith = function handleWith (iterator, commands) {
    var path = commands[iterator];
    var pathArr = path.split('/');
    var context = this.getOrSetContext(pathArr.shift());
    return context.receive(pathArr, path, commands, iterator);
};

/**
 * Retrieves the top-level VirtualElement attached to the passed in document
 * selector.
 * If no such element exists, one will be instantiated, therefore representing
 * the equivalent of a Context in the Main Thread.
 *
 * @method getOrSetContext
 * @private
 *
 * @param  {String} selector            document query selector used for
 *                                      retrieving the DOM node the
 *                                      VirtualElement should be attached to
 * @return {Object} result
 * @return {VirtualElement} result.DOM  final VirtualElement
 */
Compositor.prototype.getOrSetContext = function getOrSetContext(selector) {
    if (this._contexts[selector]) return this._contexts[selector];
    else return (this._contexts[selector] = new Context(selector, this));
};

/**
 * Internal helper method used by `drawCommands`.
 *
 * @method giveSizeFor
 * @private
 *
 * @param  {Array} commands     remaining message queue received from the
 *                              WebWorker, used to shift single messages from
 */
Compositor.prototype.giveSizeFor = function giveSizeFor(iterator, commands) {
    var selector = commands[iterator];
    var size = this.getOrSetContext(selector).getRootSize();
    this.sendResize(selector, size);
    var _this = this;
    if (selector === 'body')
        window.addEventListener('resize', function() {
            if (!_this._sentResize) {
                _this.sendResize(selector, _this.getOrSetContext(selector).getRootSize());
            }
        });
};

/**
 * Internal helper method used for notifying the WebWorker about externally
 * resized contexts (e.g. by resizing the browser window).
 *
 * @method sendResize
 * @private
 *
 * @param  {String} selector    render path to the node (context) that should
 *                              be resized
 * @param  {Array} size         new context size
 */
Compositor.prototype.sendResize = function sendResize (selector, size) {
    this._outCommands.push('WITH', selector, 'TRIGGER', 'CONTEXT_RESIZE', size);
    this._sentResize = true;
};

Compositor.prototype._wrapProxyFunction = function _wrapProxyFunction(id) {
    var _this = this;
    return function() {
        var i;

        for (i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'object') {
                arguments[i] = strip(flatClone(arguments[i]));
            }
        }
        _this._outCommands.push('INVOKE', id, Array.prototype.slice.call(arguments));
    };
};

Compositor.prototype.invoke = function invoke (target, methodName, args, functionArgs) {
    var targetObject = window[target];

    for (var i = 0; i < args.length; i++) {
        if (functionArgs[i] != null) {
            args[i] = this._wrapProxyFunction(functionArgs[i]);
        }
    }

    targetObject[methodName].apply(targetObject, args);
};

/**
 * Processes the previously via `receiveCommands` updated incoming "in"
 * command queue.
 * Called by ThreadManager.
 *
 * @method drawCommands
 *
 * @return {Array} outCommands  set of commands to be sent back to the
 *                              WebWorker
 */
Compositor.prototype.drawCommands = function drawCommands() {
    var commands = this._inCommands;
    var localIterator = 0;
    var command = commands[localIterator];
    while (command) {
        switch (command) {
            case 'WITH':
                localIterator = this.handleWith(++localIterator, commands);
                break;

            case 'INVOKE':
                this.invoke(
                    commands[++localIterator],
                    commands[++localIterator],
                    commands[++localIterator],
                    commands[++localIterator]
                );
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

    return this._outCommands;
};

/**
 * Used by ThreadManager to update the interal queue of incoming commands.
 * Receiving commands does not immediately start the rederning process.
 *
 * @param  {Array} commands     command queue to be processed by the
 *                              compositor's `drawCommands` method
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
 * @method clearCommands
 */
Compositor.prototype.clearCommands = function clearCommands() {
    this._inCommands.length = 0;
    this._outCommands.length = 0;
    this._sentResize = false;
};

module.exports = Compositor;
