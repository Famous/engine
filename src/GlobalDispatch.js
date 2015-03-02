'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

var WITH = 'WITH';
var FRAME = 'FRAME';
var TRIGGER = 'TRIGGER';

var WORKER = (typeof window === 'undefined');

function GlobalDispatch () {
    this.events = [];
    this.targetedCallbacks = {};
    this.globalCallbacks = [];

    if (WORKER) {
        var _this = this;
        self.onmessage = function(ev) {
            _this.receiveCommands(ev.data);
        };
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
                this.targetedCallbacks.engine.trigger(FRAME, commands.shift());
                break;
        }
    }
};

GlobalDispatch.prototype.handleMessage = function handleMessage (commands) {
    var path = commands.shift();
    var type = commands.shift();
    switch (type) {
        case TRIGGER:
            if (this.targetedCallbacks[path]) this.targetedCallbacks[path].trigger(commands.shift(), commands.shift());
            break;
    }
};

GlobalDispatch.prototype.targetedOn = function targetedOn (path, key, cb) {
    if (!this.targetedCallbacks[path]) this.targetedCallbacks[path] = new CallbackStore();
    this.targetedCallbacks[path].on(key, cb);
    return this;
};

GlobalDispatch.prototype.globalOn = function globalOn (path, key, cb) {
    var depth = path.split('/').length;
    if (!this.globalCallbacks[depth]) this.globalCallbacks[depth] = new CallbackStore();
    this.globalCallbacks[depth].on(key, cb);
    return this;
};

GlobalDispatch.prototype.emit = function emit (event, cb) {
    for (var i = 0, len = this.globalCallbacks.length ; i < len ; i++)
        if (this.globalCallbacks[i])
            this.globalCallbacks[i].trigger(event, cb);
    return this;
};

GlobalDispatch.prototype.message = function message (mess) {
    this.events.push(mess);
    return this;
};

GlobalDispatch.prototype.flush = function flush () {
    var events = this.events;

    if (events.length && WORKER) self.postMessage(events);

    for (var i = 0, len = this.events.length; i < len ; i++)
        this.events.pop();

    return this;
};

module.exports = GlobalDispatch;
