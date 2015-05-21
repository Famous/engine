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

var Particle = require('./Particle');
var Vec3 = require('../../math/Vec3');

var SUPPORT_REGISTER = new Vec3();

/**
 * Spherical Rigid body
 *
 * @class Sphere
 * @extends Particle
 * @param {Object} options The initial state of the body.
 */
function Sphere(options) {
    Particle.call(this, options);
    var r  = options.radius || 1;
    this.radius = r;
    this.size = [2*r, 2*r, 2*r];
    this.updateLocalInertia();
    this.inverseInertia.copy(this.localInverseInertia);

    var w = options.angularVelocity;
    if (w) this.setAngularVelocity(w.x, w.y, w.z);

    this.type = 1 << 2;
}

Sphere.prototype = Object.create(Particle.prototype);
Sphere.prototype.constructor = Sphere;

/**
 * Getter for radius.
 *
 * @method
 * @return {Number} radius
 */
Sphere.prototype.getRadius = function getRadius() {
    return this.radius;
};

/**
 * Setter for radius.
 *
 * @method
 * @param {Number} radius The intended radius of the sphere.
 * @return {Sphere} this
 */
Sphere.prototype.setRadius = function setRadius(radius) {
    this.radius = radius;
    this.size = [2*this.radius, 2*this.radius, 2*this.radius];
    return this;
};

/**
 * Infers the inertia tensor.
 *
 * @override
 * @method
 * @return {undefined} undefined
 */
Sphere.prototype.updateLocalInertia = function updateInertia() {
    var m = this.mass;
    var r = this.radius;

    var mrr = m * r * r;

    this.localInertia.set([
        0.4 * mrr, 0, 0,
        0, 0.4 * mrr, 0,
        0, 0, 0.4 * mrr
    ]);

    this.localInverseInertia.set([
        2.5 / mrr, 0, 0,
        0, 2.5 / mrr, 0,
        0, 0, 2.5 / mrr
    ]);
};

/**
 * Returns the point on the sphere furthest in a given direction.
 *
 * @method
 * @param {Vec3} direction The direction in which to search.
 * @return {Vec3} The support point.
 */
Sphere.prototype.support = function support(direction) {
    return Vec3.scale(direction, this.radius, SUPPORT_REGISTER);
};

/**
 * @exports Sphere
 * @module Sphere
 */
module.exports = Sphere;
