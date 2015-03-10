'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

var WITH = 'WITH';
var FRAME = 'FRAME';
var TRIGGER = 'TRIGGER';

function GlobalDispatch () {
    this._messages = [];
    this._targetedCallbacks = {};
    this._globalCallbacks = [];
}

GlobalDispatch.prototype.receiveCommands = function receiveCommands (commands) {
    var command;
    while (commands.length) {
        command = commands.shift();
        switch (command) {
            case WITH:
                this.handleMessage(commands);
                break;
            case FRAME:
                this._targetedCallbacks.engine.trigger(FRAME, commands.shift());
                break;
        }
    }
};

GlobalDispatch.prototype.handleMessage = function handleMessage (commands) {
    var path = commands.shift();
    var type = commands.shift();
    switch (type) {
        case TRIGGER:
            var ev = commands.shift();
            switch (ev) {
                case 'resize':
                    if (this._targetedCallbacks[path]) this._targetedCallbacks[path].trigger('resize', [commands.shift(), commands.shift()]);
                    break;
                default:
                    if (this._targetedCallbacks[path]) this._targetedCallbacks[path].trigger(ev, commands.shift());
                    break;
            }
            break;
    }
};

GlobalDispatch.prototype.targetedOn = function targetedOn (path, key, cb) {
    if (!this._targetedCallbacks[path]) this._targetedCallbacks[path] = new CallbackStore();
    this._targetedCallbacks[path].on(key, cb);
    return this;
};

GlobalDispatch.prototype.globalOn = function globalOn (path, key, cb) {
    var depth = path.split('/').length;
    if (!this._globalCallbacks[depth]) this._globalCallbacks[depth] = new CallbackStore();
    this._globalCallbacks[depth].on(key, cb);
    return this;
};

GlobalDispatch.prototype.globalOff = function globalOff (path, key, cb) {
    var depth = path.split('/').length;
    if (this._globalCallbacks[depth]) this._globalCallbacks[depth].off(key, cb);
    return this;
}

GlobalDispatch.prototype.emit = function emit (ev, cb) {
    for (var i = 0, len = this._globalCallbacks.length ; i < len ; i++)
        if (this._globalCallbacks[i])
            this._globalCallbacks[i].trigger(ev, cb);
    return this;
};

GlobalDispatch.prototype.message = function message (mess) {
    this._messages.push(mess);
    return this;
};

GlobalDispatch.prototype.getMessages = function getMessages() {
    return this._messages;
};

module.exports = GlobalDispatch;
