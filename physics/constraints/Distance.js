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

var Constraint = require('./Constraint');
var Vec3 = require('../../math/Vec3');

var NORMAL_REGISTER = new Vec3();
var IMPULSE_REGISTER = new Vec3();
var V_REGISTER = new Vec3();
var P_REGISTER = new Vec3();

/** @const */
var PI = Math.PI;

/**
 * A constraint that keeps two bodies within a certain distance.
 *
 * @class Distance
 * @extends Constraint
 * @param {Particle} a One of the bodies.
 * @param {Particle} b The other body.
 * @param {Object} options An object of configurable options.
 */
function Distance(a, b, options) {
    this.a = a;
    this.b = b;

    Constraint.call(this, options);

    this.impulse = 0;
    this.distance = 0;
    this.normal = new Vec3();
    this.velocityBias = 0;
    this.divisor = 0;
}

Distance.prototype = Object.create(Constraint.prototype);
Distance.prototype.constructor = Distance;

/**
 * Initialize the Distance. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
Distance.prototype.init = function() {
    this.length = this.length || Vec3.subtract(this.b.position, this.a.position, P_REGISTER).length();
    this.minLength = this.minLength || 0;
    this.period = this.period || 0.2;
    this.dampingRatio = this.dampingRatio || 0.5;

    this.stiffness = 4 * PI * PI / (this.period * this.period);
    this.damping = 4 * PI * this.dampingRatio / this.period;
};

/**
 * Detect violations of the constraint. Warm start the constraint, if possible.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Distance.prototype.update = function(time, dt) {
    var a = this.a;
    var b = this.b;

    var n = NORMAL_REGISTER;
    var diffP = P_REGISTER;
    var impulse = IMPULSE_REGISTER;

    var length = this.length;

    var p1 = a.position;
    var w1 = a.inverseMass;

    var p2 = b.position;
    var w2 = b.inverseMass;

    Vec3.subtract(p2, p1, diffP);

    var separation = diffP.length();

    Vec3.scale(diffP, 1 / separation, n);

    var dist = separation - length;

    var invEffectiveMass = w1 + w2;
    var effectiveMass = 1 / invEffectiveMass;
    var gamma;
    var beta;

    if (this.period === 0) {
        gamma = 0;
        beta  = 1;
    }
    else {
        var c = this.damping * effectiveMass;
        var k = this.stiffness * effectiveMass;

        gamma = 1 / (dt*(c + dt*k));
        beta  = dt*k / (c + dt*k);
    }

    var baumgarte = beta * dist / dt;
    var divisor = gamma + invEffectiveMass;

    var lambda = this.impulse;
    Vec3.scale(n, lambda, impulse);
    b.applyImpulse(impulse);
    a.applyImpulse(impulse.invert());

    this.normal.copy(n);
    this.distance = dist;
    this.velocityBias = baumgarte;
    this.divisor = divisor;
    this.impulse = 0;
};

/**
 * Apply impulses to resolve the constraint.
 *
 * @method
 * @return {undefined} undefined
 */
Distance.prototype.resolve = function resolve() {
    var a = this.a;
    var b = this.b;

    var impulse = IMPULSE_REGISTER;
    var diffV = V_REGISTER;

    var minLength = this.minLength;

    var dist = this.distance;
    if (Math.abs(dist) < minLength) return;

    var v1 = a.getVelocity();
    var v2 = b.getVelocity();

    var n = this.normal;

    Vec3.subtract(v2, v1, diffV);
    var lambda = -(Vec3.dot(n, diffV) + this.velocityBias) / this.divisor;
    Vec3.scale(n, lambda, impulse);
    b.applyImpulse(impulse);
    a.applyImpulse(impulse.invert());

    this.impulse += lambda;
};

module.exports = Distance;
