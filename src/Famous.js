'use strict';

var Clock = require('./Clock');
var GlobalDispatch = require('./GlobalDispatch');
var Context = require('./Context');

var isWorker = self.window !== self;

function Famous() {
    this._globalDispatch = new GlobalDispatch();
    this._clock = new Clock();

    this._contexts = [];

    var _this = this;

    if (isWorker) {
        self.addEventListener('message', function(ev) {
            _this.postMessage(ev.data);
        });
    }
}

Famous.prototype.step = function step (time) {
    this._clock.step(time);

    var messages = this._globalDispatch.getMessages();
    if (messages.length) {
        if (isWorker) self.postMessage(messages);
        else this.onmessage(messages);
    }
    messages.length = 0;
};

Famous.prototype.postMessage = function postMessage (message) {
    if (typeof message === 'number') {
        this.step(message);
    }
    else {
        this._globalDispatch.receiveCommands(message);
    }
};

Famous.prototype.onmessage = function onmessage () {};

/**
 * @deprecated
 */
Famous.prototype.receiveCommands = function receiveCommands (commands) {
    this._globalDispatch.receiveCommands(commands);
    return this;
};

// Use this when deprecation of `new Context` is complete
// Famous.prototype.createContext = function createContext (selector) {
//     var context = new Context(selector, this._globalDispatch);
//     this._contexts.push(context);
//     this._clock.update(context);
//     return context;
// };

Famous.prototype.getClock = function getClock () {
    return this._clock;
};

Famous.prototype.getGlobalDispatch = function getGlobalDispatch () {
    return this._globalDispatch;
};

module.exports = new Famous();
