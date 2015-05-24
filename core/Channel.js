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

/**
 * Channels are being used for interacting with the UI Thread when running in
 * a Web Worker or with the UIManager/ Compositor when running in single
 * threaded mode (no Web Worker).
 *
 * @class Channel
 * @constructor
 */
function Channel() {
    if (typeof self !== 'undefined' && self.window !== self) {
        this._enterWorkerMode();
    }
}


/**
 * Called during construction. Subscribes for `message` event and routes all
 * future `sendMessage` messages to the Main Thread ("UI Thread").
 *
 * Primarily used for testing.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Channel.prototype._enterWorkerMode = function _enterWorkerMode() {
    this._workerMode = true;
    var _this = this;
    self.addEventListener('message', function onmessage(ev) {
        _this.onMessage(ev.data);
    });
};

/**
 * Meant to be overridden by `Famous`.
 * Assigned method will be invoked for every received message.
 *
 * @type {Function}
 * @override
 *
 * @return {undefined} undefined
 */
Channel.prototype.onMessage = null;

/**
 * Sends a message to the UIManager.
 *
 * @param  {Any}    message Arbitrary message object.
 *
 * @return {undefined} undefined
 */
Channel.prototype.sendMessage = function sendMessage (message) {
    if (this._workerMode) {
        self.postMessage(message);
    }
    else {
        this.onmessage(message);
    }
};

/**
 * Meant to be overriden by the UIManager when running in the UI Thread.
 * Used for preserving API compatibility with Web Workers.
 * When running in Web Worker mode, this property won't be mutated.
 *
 * Assigned method will be invoked for every message posted by `famous-core`.
 *
 * @type {Function}
 * @override
 */
Channel.prototype.onmessage = null;

/**
 * Sends a message to the manager of this channel (the `Famous` singleton) by
 * invoking `onMessage`.
 * Used for preserving API compatibility with Web Workers.
 *
 * @private
 * @alias onMessage
 *
 * @param {Any} message a message to send over the channel
 *
 * @return {undefined} undefined
 */
Channel.prototype.postMessage = function postMessage(message) {
    return this.onMessage(message);
};

module.exports = Channel;
