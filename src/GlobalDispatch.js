'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

var WITH = 'WITH';
var FRAME = 'FRAME';
var TRIGGER = 'TRIGGER';

var WORKER = (typeof window === 'undefined');

function GlobalDispatch () {
    this._messages = [];
    this._targetedCallbacks = {};
    this._globalCallbacks = [];

    if (WORKER) {
        var _this = this;
        self.addEventListener('message', function(ev) {
            _this.receiveCommands(ev.data);
        });
    }

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
            if (this._targetedCallbacks[path]) this._targetedCallbacks[path].trigger(commands.shift(), commands.shift());
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

GlobalDispatch.prototype.flush = function flush () {
    var message = this._messages;

    if (message.length && WORKER) self.postMessage(message);

    for (var i = 0, len = this._messages.length; i < len ; i++)
        this._messages.pop();

    return this;
};

module.exports = GlobalDispatch;
