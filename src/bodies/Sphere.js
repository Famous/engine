'use strict';

var Particle = require('./Particle');
var Mat33 = require('famous-math').Mat33;
var Vec3 = require('famous-math').Vec3;

var SUPPORT_REGISTER = new Vec3();

/**
 * Spherical Rigid body
 *
 * @class Sphere
 * @extends Particle
 * @param {Object} options
 */
function Sphere(options) {
    Particle.call(this, options);
    var r  = options.radius || 1;
    this.radius = r;
    this.size = [2*r, 2*r, 2*r];
    this.updateInertia();

    this.type = 1 << 2;
}

Sphere.prototype = Object.create(Particle.prototype);
Sphere.prototype.constructor = Sphere;

/**
 * Getter for radius.
 *
 * @method getRadius
 * @return {Number} radius
 */
Sphere.prototype.getRadius = function getRadius() {
    return this.radius;
};

/**
 * Setter for radius.
 *
 * @method setRadius
 * @param {Number} radius The intended radius of the sphere.
 * @chainable
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
 * @method updateInertia
 */
Sphere.prototype.updateInertia = function updateInertia() {
    var m = this.mass;
    var r = this.radius;

    var mrr = m * r * r;

    this.inertia.set([
        0.4 * mrr, 0, 0,
        0, 0.4 * mrr, 0,
        0, 0, 0.4 * mrr
    ]);

    this.inverseInertia.set([
        2.5 / mrr, 0, 0,
        0, 2.5 / mrr, 0,
        0, 0, 2.5 / mrr
    ]);
};

/**
 * Returns the point on the sphere furthest in a given direction.
 *
 * @method support
 * @param {Vec3} direction
 * @param {Vec3}
 */
Sphere.prototype.support = function support(direction) {
    return Vec3.scale(direction, this.radius, SUPPORT_REGISTER);
};

/**
 * @exports Sphere
 * @module Sphere
 */
module.exports = Sphere;
