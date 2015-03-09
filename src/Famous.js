'use strict';

var Clock = require('./Clock');
var GlobalDispatch = require('./GlobalDispatch');
var Context = require('./Context');

function Famous() {
    this._globalDispatch = new GlobalDispatch();
    this._clock = new Clock();

    this._contexts = [];

    var _this = this;

    self.addEventListener('message', function(ev) {
        _this._globalDispatch.receiveCommands(ev.data);
    });

    this._globalDispatch.targetedOn('engine', 'FRAME', function (time) {
        _this._clock.step(time);

        var messages = _this._globalDispatch.getMessages();
        if (messages.length) self.postMessage(messages);
        messages.length = 0;
    });
}

Famous.prototype.receiveCommands = function receiveCommands (commands) {
    this._globalDispatch.receiveCommands(commands);
    return this;
};

Famous.prototype.createContext = function createContext (selector) {
    var context = new Context(selector, this._globalDispatch);
    this._contexts.push(context);
    this._clock.update(context);
    return context;
};

Famous.prototype.getClock = function getClock () {
    return this._clock;
};

Famous.prototype.getGlobalDispatch = function getGlobalDispatch () {
    return this._globalDispatch;
};

module.exports = new Famous();
