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

module.exports = Clock;
