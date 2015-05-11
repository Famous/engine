'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

/**
 * Component to manage DOM events. When registering an event, the user may specify .methods and
 * .properties to preprocess the event object.
 *
 * @class UIEventHandler
 * @param {LocalDispatch} dispatch The dispatch with which to register the handler.
 * @param {Object[]} events An array of event objects specifying .event and .callback properties.
 */
function UIEventHandler (dispatch, events) {
    this.dispatch = dispatch;
    this._events = new CallbackStore();

    if (events) {
        for (var i = 0, len = events.length; i < len; i++) {
            this.on(events[i], events[i].callback);
        }
    }
}

/**
 * Returns the name of UIEventHandler as a string.
 *
 * @method toString
 * @static
 * @return {String} 'UIEventHandler'
 */
UIEventHandler.toString = function toString() {
    return 'UIEventHandler';
};

/**
 * Register a callback to be invoked on an event.
 *
 * @method on
 * @param {Object|String} ev The event object or event name.
 * @param {Function} cb The callback.
 */
UIEventHandler.prototype.on = function on(ev, cb) {
    var renderables = this.dispatch.getRenderables();
    var eventName = ev.event || ev;
    var methods = ev.methods;
    var properties = ev.properties;
    for (var i = 0, len = renderables.length; i < len; i++) {
        if (renderables[i].on) renderables[i].on(eventName, methods, properties);
    }
    this._events.on(eventName, cb);
    this.dispatch.registerTargetedEvent(eventName, this.trigger.bind(this, eventName));
};

/**
 * Deregister a callback from an event.
 *
 * @method on
 * @param {String} ev The event name.
 * @param {Function} cb The callback.
 */
UIEventHandler.prototype.off = function off(ev, cb) {
    this._events.off(ev, cb);
    this.dispatch.deregisterGlobalEvent(ev, this.trigger.bind(this, ev));
};

/**
 * Trigger the callback associated with an event, passing in a payload.
 *
 * @method trigger
 * @param {String} ev The event name.
 * @param {Object} payload The event payload.
 */
UIEventHandler.prototype.trigger = function trigger (ev, payload) {
    this._events.trigger(ev, payload);
};

module.exports = UIEventHandler;
