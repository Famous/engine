'use strict';

var CallbackStore = require('famous-utilities').CallbackStore;

/**
 * @class EventHandler
 * @constructor
 * @component
 * @param {LocalDispatch}  Local Dispatch to be retrieved from corresponding Render Node of the EventHandler component
 * @param {Array} events array of event objects, each of which will have a listener registered on the corresponding Render Node of the Event Handler.  
 * Objects should be of the form {event: "eventname", callback: function}
 */
function EventHandler (dispatch, events) {
    this.dispatch = dispatch;
    this._events = new CallbackStore();

    if (events) {
        for (var i = 0, len = events.length; i < len; i++) {
            var eventName = events[i].event;
            var callback = events[i].callback;
            this._events.on(eventName, callback);
            dispatch.registerGlobalEvent(eventName, this.trigger.bind(this, eventName));
        }
    }
}

/** 
*
* stringifies EventHandler
*
* @method
* @return {String} the name of the Component Class: 'EventHandler'
*/

EventHandler.toString = function toString() {
    return 'EventHandler';
};

/** 
*
* Registers event using LocalDispatch of corresponding Render Node
*
* @method
* @param {String} ev Value of a single 'event' key in events argument of constructor
* @param {Function} callback value of 'callback' key in events argument of constructor
*/
EventHandler.prototype.on = function on (ev, cb) {
    this._events.on(ev, cb);
    this.dispatch.registerGlobalEvent(ev, this.trigger.bind(this, ev));
};

/** 
*
* Deregisters event using LocalDispatch of corresponding Render Node
*
* @method
* @param {String} ev Value of a single 'event' key in events argument of constructor
* @param {Function} callback value of 'callback' key in events argument of constructor
*/
EventHandler.prototype.off = function off (ev, cb) {
    this._events.off(ev, cb);
    this.dispatch.deregisterGlobalEvent(ev, this.trigger.bind(this, ev))
};

/** 
*
* Triggers event
*
* @method
* @param {String} ev event name
* @param {Object} payload event response
*/
EventHandler.prototype.trigger = function trigger (ev, payload) {
    this._events.trigger(ev, payload);
};

module.exports = EventHandler;
