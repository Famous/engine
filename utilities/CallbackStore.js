'use strict';

/**
 * A lightweight, featureless EventEmitter.
 * 
 * @class CallbackStore
 * @constructor
 */
function CallbackStore () {
    this._events = {};
}

/**
 * Adds a listener for the specified event (= key).
 *
 * @method on
 * @chainable
 * 
 * @param  {String}   key
 * @param  {Function} callback
 * @return {Function} A function to call if you want to remove the callback
 */
CallbackStore.prototype.on = function on (key, callback) {
    if (!this._events[key]) this._events[key] = [];
    var callbackList = this._events[key];
    callbackList.push(callback);
    return function () {
        callbackList.splice(callbackList.indexOf(callback), 1);
    }
};

/**
 * Removes a previously added event listener.
 *
 * @method off
 * @chainable
 * 
 * @param  {String}          key
 * @param  {Function}        callback
 * @return {CallbackStore}   this
 */
CallbackStore.prototype.off = function off (key, callback) {
    var events = this._events[key];
    if (events) events.splice(events.indexOf(callback), 1);
    return this;
};

/**
 * Invokes all the previously for this key registered callbacks.
 *
 * @method trigger
 * @chainable
 * 
 * @param  {String}        key
 * @param  {Object}        payload
 * @return {CallbackStore} this
 */
CallbackStore.prototype.trigger = function trigger (key, payload) {
    var events = this._events[key];
    if (events) {
        var i = 0;
        var len = events.length;
        for (; i < len ; i++) events[i](payload);
    }
    return this;
};

module.exports = CallbackStore;
