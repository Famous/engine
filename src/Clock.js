'use strict';

/**
 * Equivalent of an Engine in the Worker Thread. Used to synchronize and manage
 * time across different Threads.
 *
 * @class  Clock
 * @constructor
 * @private
 */
function Clock () {
    this._updates = [];
    this._nextStepUpdates = [];
    this._time = 0;
}

/**
 * Updates the internal clock time.
 *
 * @method  step
 * @chainable
 * 
 * @param  {Number} time high resolution timstamp used for invoking the
 *                       `update` method on all registered objects
 * @return {Clock}       this
 */
Clock.prototype.step = function step (time) {
    this._time = time;

    for (var i = 0, len = this._updates.length; i < len; i++) {
        this._updates[i].update(time);
    }

    while (this._nextStepUpdates.length > 0) {
        this._nextStepUpdates.shift().update(time);
    }

    return this;
};

/**
 * Registers an object to be updated on every frame.
 *
 * @method  update
 * @chainable
 * 
 * @param {Object}      updateable          Object having an `update` method
 * @param {Function}    updateable.update   update method to be called on every
 *                                          step
 * @return {Clock}                          this
 */
Clock.prototype.update = function update (updateable) {
    if (this._updates.indexOf(updateable) === -1) {
        this._updates.push(updateable);
    }
    return this;
};

/**
 * Deregisters a previously using `update` registered object to be no longer
 * updated on every frame.
 *
 * @method  noLongerUpdate
 * @chainable
 * 
 * @param  {Object} updateable  Object previously registered using the `update`
 *                              method
 * @return {Clock}              this
 */
Clock.prototype.noLongerUpdate = function noLongerUpdate(updateable) {
    var index = this._updates.indexOf(updateable);
    if (index > -1) {
        this._updates.splice(index, 1);
    }
    return this;
};

/**
 * Returns the internal clock time.
 *
 * @method  getTime
 * 
 * @param  {Number} time high resolution timstamp used for invoking the
 *                       `update` method on all registered objects
 */
Clock.prototype.getTime = function getTime() {
    return this._time;
};

/**
 * Registers object to be updated **once** on the next step. Registered
 * updateables are not guaranteed to be unique, therefore multiple updates per
 * step per object are possible.
 *
 * @method nextStep
 * @chainable
 * 
 * @param {Object}      updateable          Object having an `update` method
 * @param {Function}    updateable.update   update method to be called on the
 *                                          next step
 * @return {Clock}                          this
 */
Clock.prototype.nextStep = function nextStep(updateable) {
    this._nextStepUpdates.push(updateable);
    return this;
};

/**
 * Wraps a function to be invoked after a certain amount of time.
 * After a set duration has passed, it executes the function and
 * removes it as a listener to 'prerender'.
 *
 * @method setTimeout
 *
 * @param {Function} callback function to be run after a specified duration
 * @param {Number} delay milliseconds from now to execute the function
 *
 * @return {Function} decorated passed in callback function
 */
Clock.prototype.setTimeout = function (callback, delay) {
    var params = Array.prototype.slice.call(arguments, 2);

    // problem this._time might be null
    var startedAt = this._time;
    var _this = this;
    var looper = {
        update: function update (time) {
            if (time - startedAt >= delay) {
                callback.apply(this, params);
                _this.noLongerUpdate(looper);
            }
        }
    };
    callback.__looper = looper
    this.update(looper);
    return callback;
};

/**
 * Removes previously via `Clock#setTimeout` or `Clock#setInterval`
 * registered callback function
 *
 * @method clearTimer
 * @chainable
 * 
 * @param  {Function} callback  previously via `Clock#setTimeout` or
 *                              `Clock#setInterval` registered callback function
 * @return {Clock}              this
 */
Clock.prototype.clearTimer = function (callback) {
    this.noLongerUpdate(callback.__looper);
    return this;
};

/**
 * Wraps a function to be invoked after a certain amount of time.
 *  After a set duration has passed, it executes the function and
 *  resets the execution time.
 *
 * @method setInterval
 *
 * @param {Function} callback function to be run after a specified duration
 * @param {Number} duration interval to execute function in milliseconds
 *
 * @return {Function} decorated passed in callback function
 */
Clock.prototype.setInterval = function setInterval(callback, delay) {
    var params = Array.prototype.slice.call(arguments, 2);
    var startedAt = this._time;

    var looper = {
        update: function update (time) {
            if (time - startedAt >= delay) {
                callback.apply(this, params);
                startedAt = time;
            }
        }
    };
    callback.__looper = looper;
    this.update(looper);
    return callback;
};


module.exports = Clock;
