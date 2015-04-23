'use strict';

// Check to see if we're in a worker
var isWorker = typeof self !== 'undefined' && self.window !== self;

var Clock = require('./Clock');
var Context = require('./Context');

/**
 * Famous has two responsibilities, one to act as the highest level
 * updater and another to send messages over to the renderers. It is
 * a singleton.
 */
function Famous () {
    this._updateQueue = []; // The updateQueue is a place where nodes
                            // can place themselves in order to be
                            // updated on the frame.
    
    this._nextUpdateQueue = []; // the nextUpdateQueue is used to queue
                                // updates for the next tick.
                                // this prevents infinite loops where during
                                // an update a node continuously puts itself
                                // back in the update queue.

    this._contexts = {}; // a hash of all of the context's that this famous
                         // is responsible for.

    this._messages = []; // a queue of all of the draw commands to send to the
                         // the renderers this frame.

    this._inUpdate = false; // when the famous is updating this is true.
                            // all requests for updates will get put in the
                            // nextUpdateQueue

    this._clock = new Clock(); // a clock to keep track of time for the scene
                               // graph.

    // if famous is in a worker we wire the event listener here.
    // otherwise the thread manager will postMessage directly to
    // famous
    var _this = this;
    if (isWorker)
        self.addEventListener('message', function (ev) {
            _this.postMessage(ev.data);
        });
}

/**
 * _update is the body of the update loop. The frame consists of
 * pulling in appending the nextUpdateQueue to the currentUpdate queue
 * then moving through the updateQueue and calling onUpdate with the current
 * time on all nodes. While _update is called _inUpdate is set to true and 
 * all requests to be placed in the update queue will be forwarded to the 
 * nextUpdateQueue.
 *
 * @param {Number} The current time
 */
Famous.prototype._update = function _update (time) {
    this._inUpdate = true;
    var nextQueue = this._nextUpdateQueue;
    var queue = this._updateQueue;
    var item;

    while (nextQueue.length) queue.unshift(nextQueue.pop());

    while (queue.length) {
        item = queue.shift();
        if (item && item.onUpdate) item.onUpdate(time);
    }

    this._inUpdate = false;
};

/**
 * requestUpdates takes a class that has an onUpdate method and puts it
 * into the updateQueue to be updated at the next frame.
 * If Famous is currently in an update, requestUpdate
 * passes its argument to requestUpdateOnNextTick.
 *
 * @param {Object} an object with an onUpdate method
 */
Famous.prototype.requestUpdate = function requestUpdate (requester) {
    if (!requester)
        throw new Error(
            'requestUpdate must be called with a class to be updated'
        );

    if (this._inUpdate) this.requestUpdateOnNextTick(requester);
    else this._updateQueue.push(requester);
};

/**
 * requestUpdateOnNextTick is requests an update on the next frame.
 * If Famous is not currently in an update than it is functionally equivalent
 * to requestUpdate. This method should be used to prevent infinite loops where
 * a class is updated on the frame but needs to be updated again next frame.
 *
 * @param {Object} an object with an onUpdate method
 */
Famous.prototype.requestUpdateOnNextTick = function requestUpdateOnNextTick (requester) {
    this._nextUpdateQueue.push(requester);
};

/**
 * postMessage sends a message queue into Famous to be processed.
 * These messages will be interpreted and sent into the scene graph
 * as events if necessary.
 *
 * @param {Array} an array of commands.
 * @chainable
 * 
 * @return {Famous} this
 */
Famous.prototype.postMessage = function postMessage (messages) {
    if (!messages)
        throw new Error(
            'postMessage must be called with an array of messages'
        );

    var command;

    while (messages.length > 0) {
        command = messages.shift();
        switch (command) {
            case 'WITH':
                this.handleWith(messages);
                break;
            case 'FRAME':
                this.handleFrame(messages);
                break;
            case 'INVOKE':
                this.handleInvoke(message);
                break;
            default:
                throw new Error('received unknown command: ' + command);
                break;
        }
    }
    return this;
};

/**
 * handleWith is a method that takes an array of messages following the
 * WITH command. It'll then issue the next commands to the path specified
 * by the WITH command.
 *
 * @param {Array} array of messages.
 * @chainable
 *
 * @return {Famous} this
 */
Famous.prototype.handleWith = function handleWith (messages) {
    var path = messages.shift();
    var command = messages.shift();
    var i;
    var len;

    switch (command) {
        case 'TRIGGER': // the TRIGGER command sends a UIEvent to the specified path
            var type = messages.shift();
            var ev = messages.shift();
            
            this.getContext(path).getDispatch().dispatchUIEvent(path, type, ev);
            break;
        default:
            throw new Error('received unknown command: ' + command);
            break;
    }
    return this;
};

/**
 * handleFrame is called when the renderers issue a FRAME command to 
 * Famous. Famous will then step updating the scene graph to the current time.
 *
 * @param {Array} array of messages.
 * @chainable
 *
 * @return {Famous} this
 */
Famous.prototype.handleFrame = function handleFrame (messages) {
    if (!messages) throw new Error('handleFrame must be called with an array of messages');
    if (!messages.length) throw new Error('FRAME must be sent with a time');

    this.step(messages.shift());
    return this;
};

/**
 * step updates the clock and the scene graph and then sends the draw commands
 * that accumulated in the update to the renderers.
 *
 * @param {Number} current engine time
 * @chainable
 *
 * @return {Famous} this
 */
Famous.prototype.step = function step (time) {
    if (time == null) throw new Error('step must be called with a time');

    this._clock.step(time);

    this._update(time);

    if (this._messages.length) {
        if (isWorker) self.postMessage(this._messages);
        else this.onmessage(this._messages);
    }
    
    this._messages.length = 0;

    return this;
};

/**
 * returns the context of a particular path. The context is looked up by the selector
 * portion of the path and is listed from the start of the string to the first
 * '/'.
 *
 * @param {String} the path to look up the context for.
 *
 * @return {Context | Undefined} the context if found, else undefined.
 */
Famous.prototype.getContext = function getContext (selector) {
    if (!selector) throw new Error('getContext must be called with a selector');
    
    var index = selector.indexOf('/');
    selector = index === -1 ? selector : selector.substring(0, index);

    return this._contexts[selector];
};

/**
 * returns the instance of clock within famous.
 *
 * @return {Clock} Famous's clock
 */
Famous.prototype.getClock = function getClock () {
    return this._clock;
};

/**
 * queues a message to be transfered to the renderers.
 *
 * @param {Any} Draw Command
 * @chainable
 *
 * @return {Famous} this
 */
Famous.prototype.message = function message (command) {
    this._messages.push(command);
    return this;
};

/**
 * Creates a context under which a scene graph could be built.
 *
 * @param {String} a dom selector for where the context should be placed
 *
 * @return {Context} a new instance of Context.
 */
Famous.prototype.createContext = function createContext (selector) {
    selector = selector || 'body';

    if (this._contexts[selector]) this._contexts[selector].dismount();
    this._contexts[selector] = new Context(selector, this);
    return this._contexts[selector];
};

module.exports = new Famous();

