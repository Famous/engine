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
 * Use drag to oppose momentum of a moving object
 *
 * @class Drag
 * @extends Force
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options The options hash.
 */
function Drag(targets, options) {
    Force.call(this, targets, options);
}

Drag.prototype = Object.create(Force.prototype);
Drag.prototype.constructor = Drag;

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @property {Function} QUADRATIC
 * @param {Number} v The speed.
 * @return {Number} The scale by which to multiply.
 */
Drag.QUADRATIC = function QUADRATIC(v) {
    return v*v;
};

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @property {Function} LINEAR
 * @param {Number} v The speed.
 * @return {Number} The scale by which to multiply.
 */
Drag.LINEAR = function LINEAR(v) {
    return v;
};

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Drag.prototype.init = function() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || Drag.LINEAR;
};

/**
 * Apply the force.
 *
 * @method
 * @return {undefined} undefined
 */
Drag.prototype.update = function update() {
    var targets = this.targets;
    var type = this.type;

    var force = FORCE_REGISTER;

    var max = this.max;
    var strength = this.strength;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var velocity = target.velocity;
        var v = velocity.length();
        var invV = v ? 1 / v : 0;
        var magnitude = -strength * type(v);
        Vec3.scale(velocity, (magnitude < -max ? -max : magnitude) * invV, force);
        target.applyForce(force);
    }
};

module.exports = Drag;
