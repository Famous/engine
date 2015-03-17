'use strict';

/**
 * @class EventEmitter
 * @constructor
 * @component
 * @param {LocalDispatch} dispatch  LocalDispatch to be retrieved from corresponding 
 * Render Node of the EventEmitter component
 */
function EventEmitter(dispatch) {
    this.dispatch = dispatch;
}

/**
*
* stringifies EventEmitter
*
* @method
* @return {String} the name of the Component Class: 'EventEmitter'
*/
EventEmitter.toString = function toString() {
    return 'EventEmitter';
};

/**
*
* EventEmitter relays event and payload to Global Dispatch through Local Dispatch of the corresponding Render Node
*
* @method
* @param {String} event event name
* @param {Object} payload see 'UIEventHandler' component for further information
* @chainable
*/
EventEmitter.prototype.emit = function emit(event, payload) {
    this.dispatch.emit(event, payload);
    return this;
};

module.exports = EventEmitter;
