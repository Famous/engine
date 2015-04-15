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

Famous.prototype.requestUpdate = function requestUpdate (requester) {
    if (!requester)
        throw new Error(
            'requestUpdate must be called with a class to be updated'
        );

    if (this._inUpdate) this.requestUpdateOnNextTick(requester);
    else this._updateQueue.push(requester);
};

Famous.prototype.requestUpdateOnNextTick = function requestUpdateOnNextTick (requester) {
    this._nextUpdateQueue.push(requester);
};

Famous.prototype.postMessage = function postMessage (messages) {
    if (!messages)
        throw new Error(
            'postMessage must be called with an array of messages'
        );

    while (messages.length > 0) {
        var command = messages.shift();
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

Famous.prototype.handleWith = function handleWith (messages) {
    var path = messages.shift();
    var command = messages.shift();
    var i;
    var len;

    switch (command) {
        case 'TRIGGER':
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

Famous.prototype.handleFrame = function handleFrame (messages) {
    if (!messages) throw new Error('handleFrame must be called with an array of messages');
    if (!messages.length) throw new Error('FRAME must be sent with a time');

    this.step(messages.shift());
    return this;
};

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

Famous.prototype.getContext = function getContext (selector) {
    if (!selector) throw new Error('getContext must be called with a selector');

    return this._contexts[selector.split('/')[0]];
};

Famous.prototype.getClock = function getClock () {
    return this._clock;
};

Famous.prototype.message = function message (command) {
    this._messages.push(command);
    return this;
};

Famous.prototype.createContext = function createContext (selector) {
    selector = selector || 'body';

    if (this._contexts[selector]) this._contexts[selector].dismount();
    this._contexts[selector] = new Context(selector, this);
    return this._contexts[selector];
};

module.exports = new Famous();

