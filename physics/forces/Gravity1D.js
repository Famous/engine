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

var Force = require('./Force');
var Vec3 = require('../../math/Vec3');

var FORCE_REGISTER = new Vec3();

/**
 * Force that pulls all objects in a direction with constant acceleration
 *
 * @class Gravity1D
 * @extends Force
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options The options hash.
 */
function Gravity1D(targets, options) {
    Force.call(this, targets, options);
}

Gravity1D.prototype = Object.create(Force.prototype);
Gravity1D.prototype.constructor = Gravity1D;

/**
 * @enum directions
 */
Gravity1D.DOWN     = 0;
Gravity1D.UP       = 1;
Gravity1D.LEFT     = 2;
Gravity1D.RIGHT    = 3;
Gravity1D.FORWARD  = 4;
Gravity1D.BACKWARD = 5;

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Gravity1D.prototype.init = function(options) {
    this.max = this.max || Infinity;
    if (options.acceleration) {
        this.strength = this.acceleration.length();
        this.direction = -1;
        return;
    }
    var acceleration = this.acceleration = new Vec3();
    var direction = this.direction = this.direction || Gravity1D.DOWN;
    var magnitude = this.strength = this.strength || 200;
    switch (direction) {
        case Gravity1D.DOWN:
            acceleration.set(0, magnitude, 0);
            break;
        case Gravity1D.UP:
            acceleration.set(0, -1 * magnitude, 0);
            break;
        case Gravity1D.LEFT:
            acceleration.set(-1 * magnitude, 0, 0);
            break;
        case Gravity1D.RIGHT:
            acceleration.set(magnitude, 0, 0);
            break;
        case Gravity1D.FORWARD:
            acceleration.set(0, 0, -1 * magnitude);
            break;
        case Gravity1D.BACKWARD:
            acceleration.set(0, 0, magnitude);
            break;
        default:
            break;
    }
};

/**
 * Apply the force.
 *
 * @method
 * @return {undefined} undefined
 */
Gravity1D.prototype.update = function() {
    var targets = this.targets;

    var force = FORCE_REGISTER;

    var max = this.max;
    var acceleration = this.acceleration;
    var a = acceleration.length();
    var invA = a ? 1 / a : 0;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var magnitude = a * target.mass;
        Vec3.scale(acceleration, (magnitude > max ? max : magnitude) * invA, force);
        target.applyForce(force);
    }
};

module.exports = Gravity1D;
