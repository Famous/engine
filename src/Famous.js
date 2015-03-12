'use strict';

/* global self, console */

var Clock = require('./Clock');
var GlobalDispatch = require('./GlobalDispatch');
var MessageQueue = require('./MessageQueue');

var isWorker = self.window !== self;

function Famous() {
    this._globalDispatch = new GlobalDispatch();
    this._clock = new Clock();
    this._messageQueue = new MessageQueue();

    var _this = this;
    if (isWorker) {
        self.addEventListener('message', function(ev) {
            _this.postMessage(ev.data);
        });
    }
}

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

Famous.prototype.getMessageQueue = function getMessageQueue () {
    return this._messageQueue;
};

Famous.prototype.getGlobalDispatch = function getGlobalDispatch () {
    return this._globalDispatch;
};

Famous.prototype.proxyOn = function proxyOn(target, type, callback) {
    this._globalDispatch.targetedOn(target, type, callback);

    this._globalDispatch.message('PROXY');
    this._globalDispatch.message(target);
    this._globalDispatch.message(type);
};

module.exports = new Famous();
