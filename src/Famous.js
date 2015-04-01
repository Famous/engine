'use strict';

var isWorker = self.window !== self;

function Famous (config) {

    this._config = config ? config : Famous.DEFAULT_CONFIG;

    this._nextUpdateQueue = [];
    this._updateQueue = [];

    this._contexts = {};

    this._messages = [];

    this._inUpdate = false;

    this._time = 0;
    this._initializationTime = 0;
    this._frame = 0;

    var _this = this;
    if (isWorker)
        self.addEventListener('message', function (ev) {
            _this.postMessage(ev.data);
        });
}

Famous.DEFAULT_CONFIG = {};

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

var prevFrame = 0;
var prevLocation = 0;

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

    switch (command) {
        case 'TRIGGER':
            var type = messages.shift();
            var ev = messages.shift();
            if (type === 'resize') this.getContext(path)._receiveContextSize(ev);
            // this._globalDispatch.targetedTrigger(path, type, ev);
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
    if (!this._initializationTime) this._initializationTime = time;
    this._time = time;
    this._frame++;

    this._update(time);

    if (this._messages.length) {
        if (isWorker) self.postMessage(this._messages);
        else this.onmessage(this._messages);
    }
    
    this._messages.length = 0;

    return this;
};

Famous.prototype.registerContext = function registerContext (selector, context) {
    if (this._contexts[selector]) this._contexts[selector].onDismount();
    this._contexts[selector] = context;
    return this;
};

Famous.prototype.getContext = function getContext (selector) {
    return this._contexts[selector];
};

Famous.prototype.getTime = function getTime () {
    return this._time - this._initializationTime;
};

Famous.prototype.now = function now () {
    return this._time;
};

Famous.prototype.getFrame = function getFrame () {
    return this._frame;
};

Famous.prototype.message = function message (messages) {
    this._messages.push(messages);
    return this;
};

module.exports = new Famous();

