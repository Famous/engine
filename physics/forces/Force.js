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

var _ID = 0;
/**
 * Abstract force manager to apply forces to targets.
 *
 * @class Force
 * @virtual
 * @param {Particle[]} targets The targets of the force.
 * @param {Object} options The options hash.
 */
function Force(targets, options) {
    if (targets) {
        if (targets instanceof Array) this.targets = targets;
        else this.targets = [targets];
    }
    else this.targets = [];

    options = options || {};
    this.setOptions(options);

    this._ID = _ID++;
}

/**
 * Decorates the Force with the options object.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Force.prototype.setOptions = function setOptions(options) {
    for (var key in options) this[key] = options[key];
    this.init(options);
};

/**
 * Add a target or targets to the Force.
 *
 * @method
 * @param {Particle} target The body to begin targetting.
 * @return {undefined} undefined
 */
Force.prototype.addTarget = function addTarget(target) {
    this.targets.push(target);
};

/**
 * Remove a target or targets from the Force.
 *
 * @method
 * @param {Particle} target The body to stop targetting.
 * @return {undefined} undefined
 */
Force.prototype.removeTarget = function removeTarget(target) {
    var index = this.targets.indexOf(target);
    if (index < 0) return;
    this.targets.splice(index, 1);
};

/**
 * Method invoked upon instantiation and the setting of options.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Force.prototype.init = function init(options) {};

/**
 * Apply forces on each target.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Force.prototype.update = function update(time, dt) {};

module.exports = Force;
