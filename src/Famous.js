'use strict';

var isWorker = typeof self !== 'undefined' && self.window !== self;

var Clock = require('./Clock');
var Context = require('./Context');

function Famous (config) {
    this._nextUpdateQueue = [];
    this._updateQueue = [];

    this._contexts = {};

    this._messages = [];

    this._inUpdate = false;

    this._clock = new Clock();

    var _this = this;
    if (isWorker)
        self.addEventListener('message', function (ev) {
            _this.postMessage(ev.data);
        });
}

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
    if (this._inUpdate) this.requestUpdateOnNextTick(requester);
    else this._updateQueue.push(requester);
};

Famous.prototype.requestUpdateOnNextTick = function requestUpdateOnNextTick (requester) {
    this._nextUpdateQueue.push(requester);
};

Famous.prototype.postMessage = function postMessage (messages) {
    while (messages.length > 0) {
        var command = messages.shift();
        switch (command) {
            case 'WITH':
                this.handleWith(messages);
                break;
            case 'FRAME':
                this.handleFrame(messages);
                break;
            default:
                console.error('Unknown command ' + command);
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
            console.error('Unknown command ' + command);
            break;
    }
    return this;
};

Famous.prototype.handleFrame = function handleFrame (messages) {
    this.step(messages.shift());
    return this;
};

Famous.prototype.step = function step (time) {
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
    return this._contexts[selector.split('/')[0]];
};

Famous.prototype.getClock = function getClock () {
    return this._clock;
};

Famous.prototype.message = function message (messages) {
    this._messages.push(messages);
    return this;
};

Famous.prototype.createContext = function createContext (selector) {
    if (this._contexts[selector]) this._contexts[selector].onDismount();
    this._contexts[selector] = new Context(selector, this);
    return this._contexts[selector];
};

module.exports = new Famous();
