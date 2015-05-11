/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var CallbackStore = require('../utilities/CallbackStore');

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
