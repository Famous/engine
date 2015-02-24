'use strict';

var after = require('./after');

/**
 * Transition meta-method to support transitioning multiple
 *   values with scalar-only methods.
 *
 *
 * @class MultipleTransition
 * @constructor
 *
 * @param {Transitionable} Transionable class to multiplex
 */
function MultipleTransition(method) {
    this.method = method;
    this._instances = [];
    this.state = [];
}

MultipleTransition.SUPPORTS_MULTIPLE = true;

/**
 * Get the state of each transition.
 *
 * @method get
 *
 * @param {number=} Evaluate the curve at a normalized version of this
 *    time. If omitted, use current time. (Unix epoch time)
 *
 * @return state {Array} state array
 */
MultipleTransition.prototype.get = function get(timestamp) {
    for (var i = 0; i < this._instances.length; i++) {
        this.state[i] = this._instances[i].get(timestamp);
    }
    return this.state;
};

/**
 * Set the end states with a shared transition, with optional callback.
 *
 * @method set
 *
 * @param {Array} endState Final State. Use a multi-element argument
 *    for multiple transitions.
 * @param {Object} transition Transition definition, shared among all instances
 * @param {Function} callback called when all endStates have been reached.
 */
MultipleTransition.prototype.set = function set(endState, transition, callback) {
    var finalCallback;
    if (callback) finalCallback = after(endState.length, callback);
    for (var i = 0; i < endState.length; i++) {
        if (!this._instances[i]) this._instances[i] = new (this.method)();
        this._instances[i].set(endState[i], transition, finalCallback);
    }
    return this;
};

/**
 * Pause all transitions.
 *
 * @method pause
 *
 * @return {MultipleTransition} this
 */
MultipleTransition.prototype.pause = function pause() {
    for (var i = 0; i < this._instances.length; i++) {
        this._instances[i].pause();
    }
    return this;
};

/**
 * Resume all transitions.
 *
 * @method resume
 *
 * @return {MultipleTransition} this
 */
MultipleTransition.prototype.resume = function resume() {
    for (var i = 0; i < this._instances.length; i++) {
        this._instances[i].resume();
    }
    return this;
};

/**
 * Check if all muliplexed Transitionable instances have been paused.
 *
 * @method isPaused
 * 
 * @return {Boolean} if every Transitionable instance has been paused
 */
MultipleTransition.prototype.isPaused = function isPaused(){
    for (var i = 0; i < this._instances.length; i++) {
        if (!this._instances[i].isPaused()) return false;
    }
    return true;
};

/**
 * Reset all transitions to start state.
 *
 * @method reset
 *
 * @param {Array} startState Start state
 */
MultipleTransition.prototype.reset = function reset(startState) {
    for (var i = 0; i < startState.length; i++) {
        if (!this._instances[i]) this._instances[i] = new (this.method)();
        this._instances[i].reset(startState[i]);
    }
    this._instances.splice(startState.length, this._instances.length);
    this.state.splice(startState.length, this.state.length);
    return this;
};

module.exports = MultipleTransition;
