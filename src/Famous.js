'use strict';

/* global self, console */

var Clock = require('./Clock');
var GlobalDispatch = require('./GlobalDispatch');
var MessageQueue = require('./MessageQueue');
var ProxyRegistry = require('./ProxyRegistry');
var Context = require('./Context');

var isWorker = self.window !== self;

/**
 * Famous is the toplevel object being exposed as a singleton inside the Web
 * Worker. It holds a reference to a Clock, MessageQueue and triggers events
 * on the GlobalDispatch. Incoming messages being sent from the Main Thread
 * are defined by the following production rules (EBNF):
 *
 * message = { commmand }
 * command = frame_command | with_command
 * frame_command = "FRAME", unix_timestamp
 * with_command = selector, { action }
 * action = "TRIGGER", event_type, event_object
 * 
 * @class  Famous
 * @constructor
 * @private
 */
function Famous() {
    this._globalDispatch = new GlobalDispatch();
    this._clock = new Clock();
    this._messageQueue = new MessageQueue();
    this._proxyRegistry = new ProxyRegistry(this._messageQueue);
    this._contexts = [];

    var _this = this;
    if (isWorker) {
        self.addEventListener('message', function(ev) {
            _this.postMessage(ev.data);
        });
    }
}

/**
 * Updates the internal Clock and flushes (clears and sends) the MessageQueue
 * to the Main Thread. step(time) is being called every time the Worker
 * receives a FRAME command.
 *
 * @method  step
 * @chainable
 * @private
 * 
 * @param  {Number} time Unix timestamp
 * @return {Famous}      this
 */
Famous.prototype.step = function step (time) {
    this._clock.step(time);

    var messages = this._messageQueue.getAll();
    if (messages.length) {
        if (isWorker) self.postMessage(messages);
        else this.onmessage(messages);
    }
    this._messageQueue.clear();
    return this;
};

/**
 * postMessage(message) is being called every time the Worker Thread receives a
 * message from the Main Thread. `postMessage` is being used as a method name
 * to expose the same API as an actual Worker would. This drastically reduces
 * the complexity of maintaining a workerless build.
 *
 * @method  postMessage
 * @chainable
 * @public
 * 
 * @param  {Array} message  incoming message containing commands
 * @return {Famous}         this
 */
Famous.prototype.postMessage = function postMessage (message) {
    while (message.length > 0) {
        var command = message.shift();
        switch (command) {
            case 'WITH':
                this.handleWith(message);
                break;
            case 'FRAME':
                this.handleFrame(message);
                break;
            case 'INVOKE':
                this.handleInvoke(message);
                break;
            default:
                console.error('Unknown command ' + command);
                break;
        }
    }
    return this;
};

/**
 * Handles the FRAME command by removing FRAME and the unix timstamp from the
 * incoming message.
 *
 * @method handleFrame
 * @chainable
 * @private
 * 
 * @param  {Array} message  message as received as a Worker message
 * @return {Famous}         this
 */
Famous.prototype.handleFrame = function handleFrame (message) {
    this.step(message.shift());
    return this;
};

Famous.prototype.handleInvoke = function handleInvoke (message) {
    var id = message.shift();
    var args = message.shift();
    this._proxyRegistry.invokeCallback(id, args);
    return this;
};

/**
 * Handles the WITH (and TRIGGER) command. Triggers the respective targeted
 * callbacks of the internal GlobalDispatch.
 *
 * @method  handleWith
 * @chainable
 * @private
 * 
 * @param  {Array} message  message as received as a Worker message
 * @return {Famous}         this
 */
Famous.prototype.handleWith = function handleWith (message) {
    var path = message.shift();
    var command = message.shift();

    switch (command) {
        case 'TRIGGER':
            var type = message.shift();
            var ev = message.shift();
            this._globalDispatch.targetedTrigger(path, type, ev);
            break;
        default:
            console.error('Unknown command ' + command);
            break;
    }
    return this;
};

/**
 * Intended to be overridden by the ThreadManager to maintain compatibility
 * with the Web Worker API.
 * 
 * @method onmessage
 * @override
 * @public
 */
Famous.prototype.onmessage = function onmessage (message) {};

// Use this when deprecation of `new Context` pattern is complete
Famous.prototype.createContext = function createContext (selector) {
    var context = new Context(selector, this._messageQueue, this._globalDispatch, this._clock);
    this._contexts.push(context);
    return context;
};

/**
 * Returns the internal Clock, which can be used to schedule updates on a
 * frame-by-frame basis.
 * 
 * @method getClock
 * @public
 * 
 * @return {Clock} internal Clock
 */
Famous.prototype.getClock = function getClock () {
    return this._clock;
};

/**
 * Returns the internal MessageQueue, which can be used to schedule messages
 * to be sent on the next tick.
 *
 * @method  getMessageQueue
 * @public
 * 
 * @return {MessageQueue} internal MessageQueue
 */
Famous.prototype.getMessageQueue = function getMessageQueue () {
    return this._messageQueue;
};

/**
 * Returns the interal GlobalDispatch, which can be used to register event
 * listeners for global (same depth) or targeted (same path) events.
 *
 * @method  getGlobalDispatch
 * @public
 * 
 * @return {GlobalDispatch} internal GlobalDispatch
 */
Famous.prototype.getGlobalDispatch = function getGlobalDispatch () {
    return this._globalDispatch;
};

Famous.prototype.proxy = function proxy (target) {
    return this._proxyRegistry.getInstance(target);
};

module.exports = new Famous();
