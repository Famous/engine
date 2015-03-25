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
    this._time = null;
}

/**
 * Updates the internal clock time.
 *
 * @method  step
 * @chainable
 * 
 * @param  {Number} time unix timstamp
 * @return {Clock}       this
 */
Clock.prototype.step = function step (time) {
    this._time = time;

    for (var i = 0, len = this._updates.length ; i < len ; i++)
        this._updates[i].update(time);

    while (this._nextStepUpdates.length > 0) {
        this._nextStepUpdates.shift().update(time);
    }

    return this;
};

/**
 * Registers an object to be updated on every frame.
 * targets are expected to implement the `Updateable` interface, which means
 * they need an update method, which will be called with the new internal time.
 *
 * @method  update
 * @chainable
 * 
 * @param  {Object} target  Object having an `update` method
 * @return {Clock}          this
 */
Clock.prototype.update = function update (target) {
    this._updates.push(target);
    return this;
};

/**
 * Deregisters a previously using `update` registered object to be no longer
 * updated on every frame.
 *
 * @method  noLongerUpdate
 * @chainable
 * 
 * @param  {Object} target Object previously registerd using the `update` method
 * @return {Clock}         this
 */
Clock.prototype.noLongerUpdate = function noLongerUpdate(target) {
    var index = this._updates.indexOf(target);
    if (index > -1)
        this._updates.splice(index, 1);
    return this;
};

/**
 * Returns the internal clock time.
 *
 * @method  getTime
 * 
 * @return {Number} Unix timestamp
 */
Clock.prototype.getTime = function getTime () {
    return this._time;
};

/**
 * Registers object to be updated **once** on the next step. Regsitered
 * targets are not guaranteed to be unique, therefore multiple updates per
 * frame per object are possible.
 *
 * @method nextStep
 * @chainable
 * 
 * @param  {Object} target  Object having an `update` method.
 * @return {Clock}          this
 */
Clock.prototype.nextStep = function nextStep (target) {
    this._nextStepUpdates.push(target);
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
