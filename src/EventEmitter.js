'use strict';

/**
 * Component to manage general event emission.
 *
 * @class EventEmitter
 * @param {Node} node The node to send events through.
 */
function EventEmitter(node) {
    this.node = node;
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
    this.node.emit(event, payload);
    return this;
};

module.exports = EventEmitter;
