'use strict';

var Compositor = require('./Compositor');


/**
 * The UIManager is being updated by an Engine by consecutively calling its
 * `update` method. It can either manage a real Web-Worker or the global
 * Famous core singleton.
 *
 * @example
 * var compositor = new Compositor();
 * 
 * // Using a Web Worker
 * var worker = new Worker('worker.bundle.js');
 * var threadmanger = new UIManager(worker, compositor);
 * 
 * // Without using a Web Worker
 * var threadmanger = new UIManager(Famous, compositor);
 * 
 * @class  UIManager
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
 *                                      be sent to the thread
 */
function UIManager(options) {
    require('famous-stylesheets');

    this._sceneManager = options.sceneManager;
    this._compositor = options.compositor || new Compositor();

    var _this = this;
    this._sceneManager.onmessage = function (ev) {
        _this._compositor.receiveCommands(ev.data ? ev.data : ev);
    };
    this._sceneManager.onerror = function (error) {
        console.error(error);
    };
}

/**
 * Returns the thread being used by the UIManager.
 * This could either be an an actual web worker or a `Famous` singleton.
 *
 * @method getThread
 * 
 * @return {Worker|Famous}  Either a web worker or a `Famous` singleton.
 */
UIManager.prototype.getSceneManager = function getThread() {
    return this._sceneManager;
};

/**
 * Returns the compositor being used by this UIManager.
 *
 * @method getCompositor
 * 
 * @return {Compositor}     The compositor used by the UIManager.
 */
UIManager.prototype.getCompositor = function getCompositor() {
    return this._compositor;
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
UIManager.prototype.update = function update (time) {
    this._sceneManager.postMessage(['FRAME', time]);
    var threadMessages = this._compositor.drawCommands();
    this._sceneManager.postMessage(threadMessages);
    this._compositor.clearCommands();
};

module.exports = UIManager;
