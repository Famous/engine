'use strict';

/* global self, console */

var Clock = require('./Clock');
var GlobalDispatch = require('./GlobalDispatch');

var isWorker = self.window !== self;

function Famous() {
    this._globalDispatch = new GlobalDispatch();
    this._clock = new Clock();

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
    return this;
};

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
            default:
                console.error('Unknown command ' + command);
                break;
        }
    }
    return this;
};

Famous.prototype.handleFrame = function handleFrame (message) {
    this.step(message.shift());
    return this;
};

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

Famous.prototype.onmessage = function onmessage () {};

// Use this when deprecation of `new Context` pattern is complete
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
