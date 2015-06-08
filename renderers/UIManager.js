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

var Commands = require('../core/Commands');

/**
 * The UIManager is being updated by an Engine by consecutively calling its
 * `update` method. It can either manage a real Web-Worker or the global
 * FamousEngine core singleton.
 *
 * @example
 * var compositor = new Compositor();
 * var engine = new Engine();
 *
 * // Using a Web Worker
 * var worker = new Worker('worker.bundle.js');
 * var threadmanger = new UIManager(worker, compositor, engine);
 *
 * // Without using a Web Worker
 * var threadmanger = new UIManager(Famous, compositor, engine);
 *
 * @class  UIManager
 * @constructor
 *
 * @param {Famous|Worker} thread The thread being used to receive messages
 * from and post messages to. Expected to expose a WebWorker-like API, which
 * means providing a way to listen for updates by setting its `onmessage`
 * property and sending updates using `postMessage`.
 * @param {Compositor} compositor an instance of Compositor used to extract
 * enqueued draw commands from to be sent to the thread.
 * @param {RenderLoop} [renderLoop] an instance of RenderLoop used for updating
 * the UIManager when not running in container mode. Target for the ENGINE
 * commands. Optional when running exclusively in container mode.
 */
function UIManager (thread, compositor, renderLoop) {
    var _this = this;

    this._thread = thread;
    this._compositor = compositor;
    this._renderLoop = renderLoop;

    if (renderLoop) {
        this._renderLoop.update(this);
    }

    this._thread.onmessage = function (ev) {
        var message = ev.data ? ev.data : ev;
        if (message[0] === Commands.ENGINE) {
            if (!_this._renderLoop) {
                console.error(
                    'Can not process ENGINE commands since no render loop' +
                    'is available.'
                );
                return;
            }
            switch (message[1]) {
                case Commands.START:
                    _this._engine.start();
                    break;
                case Commands.STOP:
                    _this._engine.stop();
                    break;
                default:
                    console.error(
                        'Unknown ENGINE command "' + message[1] + '"'
                    );
                    break;
            }
        }
        else {
            _this._compositor.receiveCommands(message);
        }
    };
    this._thread.onerror = function (error) {
        console.error(error);
    };

    this._containerMode = false;
    window.addEventListener('message', function (message) {
        _this._handleWindowMessage(message);
    });
}

/**
 * Returns the thread being used by the UIManager.
 * This could either be an an actual web worker or a `FamousEngine` singleton.
 *
 * @method
 *
 * @return {Worker|FamousEngine} Either a web worker or a `FamousEngine` singleton.
 */
UIManager.prototype.getThread = function getThread() {
    return this._thread;
};

/**
 * Returns the compositor being used by this UIManager.
 *
 * @method
 *
 * @return {Compositor} The compositor used by the UIManager.
 */
UIManager.prototype.getCompositor = function getCompositor() {
    return this._compositor;
};

/**
 * Returns the engine being used by this UIManager.
 *
 * @method
 * @deprecated Use {@link UIManager#getRenderLoop instead!}
 *
 * @return {Engine} The engine used by the UIManager.
 */
UIManager.prototype.getEngine = function getEngine() {
    return this._renderLoop;
};


/**
 * Returns the render loop currently being used by the UIManager.
 *
 * @method
 *
 * @return {RenderLoop}  The registered render loop used for updating the
 * UIManager.
 */
UIManager.prototype.getRenderLoop = function getRenderLoop() {
    return this._renderLoop;
};

/**
 * Update method being invoked by the Engine on every `requestAnimationFrame`.
 * Used for updating the notion of time within the managed thread by sending
 * a FRAME command and sending messages to
 *
 * @method
 *
 * @param  {Number} time unix timestamp to be passed down to the worker as a
 * FRAME command
 * @return {undefined} undefined
 */
UIManager.prototype.update = function update (time) {
    this._thread.postMessage([Commands.FRAME, time]);
    this._sendDrawCommands();
};


/**
 * Method used for sending the compositor's draw commands to the managed thread
 * (Worker or Channel). Clears the compositor.
 *
 * @method  _sendDrawCommands
 * @private
 *
 * @return {undefined}      undefined
 */
UIManager.prototype._sendDrawCommands = function _sendDrawCommands () {
    var threadMessages = this._compositor.drawCommands();
    this._thread.postMessage(threadMessages);
    this._compositor.clearCommands();
};


/**
 * Container mode will automatically be entered after receving the initial
 * window commands from the container manager.
 *
 * Entering container mode results into the currently active render loop to be
 * stopped, assuming it is available.
 *
 * @method
 * @return {undefined}          undefined
 */
UIManager.prototype.enterContainerMode = function enterContainerMode () {
    if (!this._containerMode) {
        this._containerMode = true;
        if (this._renderLoop) this._renderLoop.stop();
    }
};


/**
 * Exits from container mode. Starts the render loop if possible, but won't
 * prevent the UIManager from receiveing further messages.
 *
 * @method
 * @return {undefined}          undefined
 */
UIManager.prototype.exitContainerMode = function exitContainerMode () {
    if (!this._containerMode) {
        this._containerMode = false;
        if (this._renderLoop) this._renderLoop.start();
    }
};


/**
 * Listener function used for receiveing window messages.
 *
 * @method
 * @private
 *
 * @param  {Object} message     Received window message.
 * @return {undefined}          undefined
 */
UIManager.prototype._handleWindowMessage = function _handleWindowMessage (message) {
    var windowCommands = message.data;
    if (windowCommands && windowCommands.constructor === Array && windowCommands[0] === Commands.FAMOUS) {
        this.enterContainerMode();

        // Remove FAMOUS prefix command
        windowCommands.shift();

        this._thread.postMessage(windowCommands);
        this._sendDrawCommands();
    }
};


/**
 * Method used for determining whether the UIManger is currently running in
 * container mode.
 *
 * @method
 *
 * @return {Boolean}    Boolean value indicating whether the UIManager is
 * currently running in container mode.
 */
UIManager.prototype.isContainerMode = function isContainerMode () {
    return this._containerMode;
};

module.exports = UIManager;
