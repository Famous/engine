'use strict';

/**
 * Channels are being used for interacting with the UI Thread when running in
 * a Web Worker or with the ThreadManager/ Compostior when running in single
 * threaded mode (no Web Worker).
 *
 * @class Channel
 * @constructor
 */
function Channel() {
    this._workerMode = typeof self !== 'undefined' && self.window !== self;
    if (this._workerMode) {
        var _this = this;
        self.addEventListener('message', function onmessage(ev) {
            _this.onMessage(ev.data);
        });
    }
}

/**
 * Meant to be overriden by `Famous`.
 *
 * @type {Function} Assigned method will be invoked for every received message.
 */
Channel.prototype.onMessage = null;

/**
 * Sends a message to the ThreadManager.
 *
 * @method message
 * 
 * @param  {Any}    message Arbitrary message object.
 */
Channel.prototype.message = function message (message) {
    if (this._workerMode) {
        self.postMessage(message);
    } else {
        this.onmessage(message);
    }
};

/**
 * Meant to be overriden by the ThreadManager when running in the UI Thread.
 * Used for preserving API compatibility with Web Workers.
 * When running in Web Worker mode, this property won't be mutated.
 *
 * @private
 * @type {Function}     Assigned method will be invoked for every message
 *                      posted by `famous-core`
 */
Channel.prototype.onmessage = null;

/**
 * Sends a message to the manager of this channel (the `Famous` singleton) by
 * invoking `onMessage`.
 * Used for preserving API compatibility with Web Workers.
 *
 * @private
 * @alias onMessage
 */
Channel.prototype.postMessage = function postMessage(message) {
    return this.onMessage(message);
};

module.exports = Channel;
