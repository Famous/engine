'use strict';

var now = require('./now');

/**
 * Engine class used for updating objects on a frame-by-frame. Synchronizes the
 * `update` method invocations to the refresh rate of the screen.
 * Does not normalize the high resolution timestamp when being consecutively
 * started and stopped.
 * 
 * @class ContainerEngine
 * @constructor
 */
function ContainerEngine() {
    this._updates = [];
    this.start();

    var _this = this;
    window.addEventListener('message', function(ev) {
        _this._onWindowMessage(ev);
    });
}

ContainerEngine.prototype._onWindowMessage = function _onWindowMessage(ev) {
    if (
        this._running &&
        ev.data.constructor === Array &&
        ev.data[0] === 'FAMOUS' &&
        ev.data[1] === 'FRAME'
    ) {
        this.step(ev.data[2]);
    }
};

/**
 * Starts the ContainerEngine.
 *
 * @method start
 * @chainable
 * 
 * @return {ContainerEngine} this
 */
ContainerEngine.prototype.start = function start() {
    this._running = true;
    return this;
};

/**
 * Stops the ContainerEngine.
 *
 * @method stop
 * @chainable
 * 
 * @return {ContainerEngine} this
 */
ContainerEngine.prototype.stop = function stop() {
    this._running = false;
    return this;
};

/**
 * Determines whether the ContainerEngine is currently running or not.
 *
 * @method isRunning
 * 
 * @return {Boolean}    boolean value indicating whether the ContainerEngine is
 *                      currently running or not
 */
ContainerEngine.prototype.isRunning = function isRunning() {
    return this._running;
};

/**
 * Updates all registered objects.
 *
 * @method step
 * @chainable
 * 
 * @param  {Number} time high resolution timstamp used for invoking the
 *                       `update` method on all registered objects
 * @return {ContainerEngine}      this
 */
ContainerEngine.prototype.step = function step (time) {
    for (var i = 0, len = this._updates.length ; i < len ; i++) {
        this._updates[i].update(time);
    }
    return this;
};

/**
 * Registeres an updateable object which `update` method should be invoked on
 * every paint, starting on the next paint (assuming the ContainerEngine is running).
 *
 * @method update
 * @chainable
 * 
 * @param  {Object} updateable          object to be updated
 * @param  {Function} updateable.update update function to be called on the
 *                                      registered object
 * @return {ContainerEngine}                     this
 */
ContainerEngine.prototype.update = function update(updateable) {
    if (this._updates.indexOf(updateable) === -1) {
        this._updates.push(updateable);
    }
    return this;
};

/**
 * Deregisters an updateable object previously registered using `update` to be
 * no longer updated.
 *
 * @method noLongerUpdate
 * @chainable
 * 
 * @param  {Object} updateable          updateable object previously
 *                                      registered using `update`
 * @return {ContainerEngine}                     this
 */
ContainerEngine.prototype.noLongerUpdate = function noLongerUpdate(updateable) {
    var index = this._updates.indexOf(updateable);
    if (index > -1) {
        this._updates.splice(index, 1);
    }
    return this;
};

module.exports = ContainerEngine;
