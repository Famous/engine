'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

function EventHandler (dispatch, events) {
    this.dispatch = dispatch;
    this._events = new CallbackStore();
    for (var i = 0, len = events.length; i < len; i++) {
        var eventName = events[i].event;
        var callback = events[i].callback;
        this._events.on(eventName, callback);
        dispatch.registerGlobalEvent(eventName, this.trigger.bind(this, eventName));
    }
}

EventHandler.toString = function toString() {
    return 'EventHandler';
};

EventHandler.prototype.on = function on (ev, cb) {
    this._events.on(ev, cb);
    this.dispatch.registerGlobalEvent(ev, this.trigger.bind(this, eventName));
};

EventHandler.prototype.off = function off (ev, cb) {
    this._events.off(ev, cb);
    this.dispatch.deregisterGlobalEvent(ev, this.trigger.bind(this, eventName))
};


EventHandler.prototype.trigger = function trigger (ev, payload) {
    this._events.trigger(ev, payload);
};

module.exports = EventHandler;
