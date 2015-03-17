'use strict';

/**
 * Component to manage general event emission.
 *
 * @class EventEmitter
 * @param {LocalDispatch} dispatch The dispatch with which to register the handler.
 */
function EventEmitter(dispatch) {
    this.dispatch = dispatch;
}

/**
 * Returns the name of EventEmitter as a string.
 *
 * @method toString
 * @static
 * @return {String} 'EventEmitter'
 */
EventEmitter.toString = function toString() {
    return 'EventEmitter';
};

/**
 * Emit an event with a payload.
 *
 * @method emit
 * @param {Object} event The event name.
 * @param {Object} payload The event payload.
 */
EventEmitter.prototype.emit = function emit(event, payload) {
    this.dispatch.emit(event, payload);
    return this;
};

module.exports = EventEmitter;
