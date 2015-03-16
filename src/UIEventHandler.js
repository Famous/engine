'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

function UIEventHandler (dispatch, events) {
    this._events = new CallbackStore();
    var renderables = dispatch.getRenderables();
    for (var i = 0, len = renderables.length; i < len; i++)
        for (var j = 0, len2 = events.length; j < len2; j++) {
            var eventName = events[j].event;
            var methods = events[j].methods;
            var properties = events[j].properties;
            var callback = events[j].callback;
            this._events.on(eventName, callback);
            if (renderables[i].on) renderables[i].on(eventName, methods, properties);
            dispatch.registerTargetedEvent(eventName, this.trigger.bind(this, eventName));
        }
}

UIEventHandler.toString = function toString() {
    return 'UIEventHandler';
};

UIEventHandler.prototype.trigger = function trigger (ev, payload) {
    this._events.trigger(ev, payload);
};

module.exports = UIEventHandler;
