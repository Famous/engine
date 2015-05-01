'use strict';

/**
 * The ThreadManager is being updated by an Engine by consecutively calling its
 * `update` method. It can either manage a real Web-Worker or the global
 * Famous core singleton.
 *
 * @example
 * var compositor = new Compositor();
 * var engine = new Engine();
 * 
 * // Using a Web Worker
 * var worker = new Worker('worker.bundle.js');
 * var threadmanger = new ThreadManager(worker, compositor, engine);
 * 
 * // Without using a Web Worker
 * var threadmanger = new ThreadManager(Famous, compositor, engine);
 * 
 * @class  ThreadManager
 * @constructor
 * 
 * @param {Famous|Worker} thread        The thread being used to receive
 *                                      messages from and post messages to.
 *                                      Expected to expose a WebWorker-like
 *                                      API, which means providing a way to
 *                                      listen for updates by setting its
 *                                      `onmessage` property and sending
 *                                      updates using `postMessage`.
 * @param {Compositor} compositor       an instance of Compositor used to
 *                                      extract enqueued draw commands from to
 *                                      be sent to the thread.
 * @param {Engine} engine               an instance of Engine used for
 *                                      executing the `ENGINE` commands on.
 */
function ThreadManager (thread, compositor, engine) {
    this._thread = thread;
    this._compositor = compositor;
    this._engine = engine;

    if (engine) {
        this._engine.update(this);
    } else {
        console.warn(
            'Not passing in the engine into the ThreadManager is ' +
            'deprecated!\n Use `new ThreadManager(thread, compositor, engine)`'
        );
    }

    var _this = this;
    this._thread.onmessage = function (ev) {
        var message = ev.data ? ev.data : ev;
        if (message[0] === 'ENGINE') {
            switch (message[1]) {
                case 'START':
                    _this._engine.start();
                    break;
                case 'STOP':
                    _this._engine.stop();
                    break;
                default:
                    console.error(
                        'Unknown ENGINE command "' + message[1] + '"'
                    );
                    break;
            }
        } else {
            _this._compositor.receiveCommands(message);
        }
    };
    this._thread.onerror = function (error) {
        console.error(error);
    };
}

/**
 * Returns the thread being used by the ThreadManager.
 * This could either be an an actual web worker or a `Famous` singleton.
 *
 * @method getThread
 * 
 * @return {Worker|Famous}  Either a web worker or a `Famous` singleton.
 */
ThreadManager.prototype.getThread = function getThread() {
    return this._thread;
};

/**
 * Returns the compositor being used by this ThreadManager.
 *
 * @method getCompositor
 * 
 * @return {Compositor}     The compositor used by the ThreadManager.
 */
ThreadManager.prototype.getCompositor = function getCompositor() {
    return this._compositor;
};

/**
 * Returns the engine being used by this ThreadManager.
 *
 * @method getEngine
 * 
 * @return {Engine}     The engine used by the ThreadManager.
 */
ThreadManager.prototype.getEngine = function getEngine() {
    return this._engine;
};

/**
 * Update method being invoked by the Engine on every `requestAnimationFrame`.
 * Used for updating the notion of time within the managed thread by sending
 * a FRAME command and sending messages to 
 * 
 * @method update
 * 
 * @param  {Number} time unix timestamp to be passed down to the worker as a
 *                       FRAME command
 */
ThreadManager.prototype.update = function update (time) {
    this._thread.postMessage(['FRAME', time]);
    var threadMessages = this._compositor.drawCommands();
    this._thread.postMessage(threadMessages);
    this._compositor.clearCommands();
};

module.exports = ThreadManager;
