'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

function GlobalDispatch () {
    this._messages = [];
    this._targetedCallbacks = {};
    this._globalCallbacks = [];
}

GlobalDispatch.prototype.targetedTrigger = function targetedTrigger(path, key, ev) {
    if (this._targetedCallbacks[path]) this._targetedCallbacks[path].trigger(key, ev);
    return this;
};

GlobalDispatch.prototype.targetedOn = function targetedOn (path, key, cb) {
    if (!this._targetedCallbacks[path]) this._targetedCallbacks[path] = new CallbackStore();
    this._targetedCallbacks[path].on(key, cb);
    return this;
};

GlobalDispatch.prototype.targetedOff = function targetedOff (path, key, cb) {
    if (!this._targetedCallbacks[path]) this._targetedCallbacks[path].off(key, cb);
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
