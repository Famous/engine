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

var now = require('./now');

/**
 * Loop class used for updating objects on a frame-by-frame. Synchronizes the
 * `update` method invocations to the refresh rate of the screen.
 * Does not normalize the high resolution timestamp when being consecutively
 * started and stopped.
 * 
 * @class ContainerLoop
 */
function ContainerLoop() {
    this._updates = [];
    this._stoppedAt = now();
    this._sleep = 0;

    this.start();

    var _this = this;
    window.addEventListener('message', function(ev) {
        _this._onWindowMessage(ev);
    });
}

/**
 * When there is a `FRAME` message passed into the window
 *
 * @method
 * @private
 *
 * @param {Object} ev event payload from the window
 * 
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype._onWindowMessage = function _onWindowMessage(ev) {
    if (
        this._running &&
        ev.data.constructor === Array &&
        ev.data[0] === 'FRAME'
    ) {
        this.step(ev.data[1] - this._sleep);
    }
};

/**
 * Starts the ContainerLoop.
 *
 * @method
 * 
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.start = function start() {
    this._running = true;
    this._sleep += now() - this._stoppedAt;
    return this;
};

/**
 * Stops the ContainerLoop.
 *
 * @method
 * 
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.stop = function stop() {
    this._running = false;
    this._stoppedAt = now();
    return this;
};

/**
 * Determines whether the ContainerLoop is currently running or not.
 *
 * @method
 * 
 * @return {Boolean} boolean value indicating whether the ContainerLoop is currently running or not
 */
ContainerLoop.prototype.isRunning = function isRunning() {
    return this._running;
};

/**
 * Updates all registered objects.
 *
 * @method
 * 
 * @param {Number} time high resolution timstamp used for invoking the `update` method on all registered objects
 *
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.step = function step (time) {
    for (var i = 0, len = this._updates.length ; i < len ; i++) {
        this._updates[i].update(time);
    }
    return this;
};

/**
 * Registeres an updateable object which `update` method should be invoked on
 * every paint, starting on the next paint (assuming the ContainerLoop is running).
 *
 * @method
 * 
 * @param {Object} updateable object to be updated
 * @param {Function} updateable.update update function to be called on the registered object
 *
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.update = function update(updateable) {
    if (this._updates.indexOf(updateable) === -1) {
        this._updates.push(updateable);
    }
    return this;
};

/**
 * Deregisters an updateable object previously registered using `update` to be
 * no longer updated.
 *
 * @method
 * 
 * @param {Object} updateable updateable object previously registered using `update`
 *
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.noLongerUpdate = function noLongerUpdate(updateable) {
    var index = this._updates.indexOf(updateable);
    if (index > -1) {
        this._updates.splice(index, 1);
    }
    return this;
};

module.exports = ContainerLoop;
