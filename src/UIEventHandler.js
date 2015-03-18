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
