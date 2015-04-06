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
    this._time = 0;
    this._frame = 0;
    this._timerQueue = [];
    this._updatingIndex = 0;
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
    this._frame++;
    this._time = time;
    for (var i = 0; i < this._timerQueue.length; i += 5) {
        if (this._time > this._timerQueue[i+1] + this._timerQueue[i+2]) {
            this._timerQueue[i].apply(this, this._timerQueue[i+3]);
            if (!this._timerQueue[i+4]) {
                this._timerQueue.splice(i, i+5);
            } else {
                this._timerQueue[i+1] = this._time;
            }
        }
    }
    return this;
};

/**
 * Returns the internal clock time.
 *
 * @method  getTime
 * @deprecated Use #now instead
 * 
 * @param  {Number} time high resolution timstamp used for invoking the
 *                       `update` method on all registered objects
 */
Clock.prototype.getTime = function getTime() {
    return this._time;
};

/**
 * Returns the internal clock time.
 *
 * @method  now
 * 
 * @param  {Number} time high resolution timstamp used for invoking the
 *                       `update` method on all registered objects
 */
Clock.prototype.now = function now () {
    return this._time;
};

/**
 * Returns the number of frames elapsed so far.
 *
 * @method getFrame
 * 
 * @return {Number} frames
 */
Clock.prototype.getFrame = function getFrame () {
    return this._frame;
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
    return this._timerQueue.push(callback, this._time, delay, params, false);
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
    return this._timerQueue.push(callback, this._time, delay, params, true);
};

/**
 * Removes previously via `Clock#setInterval` registered callback function.
 *
 * @method clearInterval
 * @chainable
 * 
 * @param  {Number} intervalID  by `Clock#setInterval` returned intervalID
 * @return {Clock}              this
 */
Clock.prototype.clearInterval = function clearInterval(intervalID) {
    if (this._timerQueue[intervalID-1] === true) {
        this._timerQueue.splice(intervalID-5, intervalID);
    }
};

/**
 * Removes previously via `Clock#setTimeout` registered callback function.
 *
 * @method clearTimeout
 * @chainable
 * 
 * @param  {Number} timeoutID   by `Clock#setTimeout` returned timeoutID
 * @return {Clock}              this
 */
Clock.prototype.clearTimeout = function clearTimeout(timeoutID) {
    if (this._timerQueue[timeoutID-1] === false) {
        this._timerQueue.splice(timeoutID-5, timeoutID);
    }
    return this;
};

module.exports = Clock;
