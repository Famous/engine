'use strict';

/**
 * @class EventEmitter
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch  LocalDispatch to be retrieved from corresponding Render Node of the EventEmitter component
 */
function EventEmitter(dispatch) {
    this.dispatch = dispatch;
}

/**
* @method
* Return the definition of the Component Class: 'EventEmitter'
*/
EventEmitter.toString = function toString() {
    return 'EventEmitter';
};

/**
* @method
* @chainable
* @param {string} event event name
* @param {object} payload see 'UIEventHandler' component for further information
* EventEmitter relays event and payload to Global Dispatch through Local Dispatch of the corresponding Render Node
*/
EventEmitter.prototype.emit = function emit(event, payload) {
    this.dispatch.emit(event, payload);
    return this;
};

module.exports = EventEmitter;
