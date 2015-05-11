'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

/**
 * Component to handle general events.
 *
 * @class EventHandler
 * @param {Node} node The node on which this component is registered.
 */
function EventHandler (node) {
    this.node = node;
    this.id = node.addComponent(this);
    this._events = new CallbackStore();
}

/**
 * Returns the name of EventHandler as a string.
 *
 * @method toString
 * @static
 * @return {String} 'EventHandler'
 */
EventHandler.toString = function toString() {
    return 'EventHandler';
};

/**
 * Register a callback to be invoked on an event.
 *
 * @method on
 * @param {String} ev The event name.
 * @param {Function} cb The callback.
 */
EventHandler.prototype.on = function on (ev, cb) {
    this._events.on(ev, cb);
};

/**
 * Deregister a callback from an event.
 *
 * @method on
 * @param {String} ev The event name.
 * @param {Function} cb The callback.
 */
EventHandler.prototype.off = function off (ev, cb) {
    this._events.off(ev, cb);
};

/**
 * Trigger the callback associated with an event, passing in a payload.
 *
 * @method trigger
 * @param {String} ev The event name.
 * @param {Object} payload The event payload.
 */
EventHandler.prototype.trigger = function trigger (ev, payload) {
    this._events.trigger(ev, payload);
};

EventHandler.prototype.onReceive = EventHandler.prototype.trigger;

module.exports = EventHandler;
