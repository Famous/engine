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

var Vec3 = require('../../math/Vec3');
var Quaternion = require('../../math/Quaternion');
var Mat33 = require('../../math/Mat33');

var CallbackStore = require('../../utilities/CallbackStore');

var ZERO_VECTOR = new Vec3();

var MAT1_REGISTER = new Mat33();

var _ID = 0;
/**
 * Fundamental physical body. Maintains translational and angular momentum, position and orientation, and other properties
 * such as size and coefficients of restitution and friction used in collision response.
 *
 * @class Particle
 * @extends Particle
 * @param {Object} options sets the initial state of the Particle
 * @constructor
 */
function Particle(options) {
    options = options || {};

    this.events = new CallbackStore();

    this.position = options.position || new Vec3();
    this.orientation = options.orientation || new Quaternion();

    this.velocity = new Vec3();
    this.momentum = new Vec3();
    this.angularVelocity = new Vec3();
    this.angularMomentum = new Vec3();

    this.mass = options.mass || 1;
    this.inverseMass = 1 / this.mass;

    this.force = new Vec3();
    this.torque = new Vec3();

    this.restitution = options.restitution != null ? options.restitution : 0.4;
    this.friction = options.friction != null ? options.friction : 0.2;

    this.inverseInertia = new Mat33([0,0,0,0,0,0,0,0,0]);

    this.localInertia = new Mat33([0,0,0,0,0,0,0,0,0]);
    this.localInverseInertia = new Mat33([0,0,0,0,0,0,0,0,0]);

    this.size = options.size || [0, 0, 0];

    var v = options.velocity;
    if (v) this.setVelocity(v.x, v.y, v.z);

    this.restrictions = 0;
    this.setRestrictions.apply(this, options.restrictions || []);

    this.collisionMask = options.collisionMask || 1;
    this.collisionGroup = options.collisionGroup || 1;

    this.type = 1 << 0;

    this._ID = _ID++;
}

/**
 * Getter for the restriction bitmask. Converts the restrictions to their string representation.
 *
 * @method getRestrictions
 * @return {String[]} restrictions
 */
Particle.prototype.getRestrictions = function getRestrictions() {
    var linear = '';
    var angular = '';
    var restrictions = this.restrictions;
    if (restrictions & 32) linear += 'x';
    if (restrictions & 16) linear += 'y';
    if (restrictions & 8) linear += 'z';
    if (restrictions & 4) angular += 'x';
    if (restrictions & 2) angular += 'y';
    if (restrictions & 1) angular += 'z';

    return [linear, angular];
};

/**
 * Setter for the particle restriction bitmask.
 *
 * @method setRestrictions
 * @param {String} transRestrictions
 * @param {String} rotRestrictions
 * @chainable
 */
Particle.prototype.setRestrictions = function setRestrictions(transRestrictions, rotRestrictions) {
    transRestrictions = transRestrictions || '';
    rotRestrictions = rotRestrictions || '';
    this.restrictions = 0;
    if (transRestrictions.indexOf('x') > -1) this.restrictions |= 32;
    if (transRestrictions.indexOf('y') > -1) this.restrictions |= 16;
    if (transRestrictions.indexOf('z') > -1) this.restrictions |= 8;
    if (rotRestrictions.indexOf('x') > -1) this.restrictions |= 4;
    if (rotRestrictions.indexOf('y') > -1) this.restrictions |= 2;
    if (rotRestrictions.indexOf('z') > -1) this.restrictions |= 1;
    return this;
};

/**
 * Getter for mass
 *
 * @method getMass
 * @return {Number} mass
 */
Particle.prototype.getMass = function getMass() {
    return this.mass;
};

/**
 * Set the mass of the Particle.  Can be used to change the mass several times
 *
 * @method setMass
 * @param {Number} mass
 * @chainable
 */
Particle.prototype.setMass = function setMass(mass) {
    this.mass = mass;
    this.inverseMass = 1 / mass;
    return this;
};

/**
 * Getter for inverse mass
 *
 * @method getInverseMass
 * @return {Number} inverse mass
 */
Particle.prototype.getInverseMass = function() {
    return this.inverseMass;
};

/**
 * Resets the inertia tensor and its inverse to reflect the current shape.
 *
 * @method updateLocalInertia
 * @chainable
 * @param {Mat33} Mat33
 */
Particle.prototype.updateLocalInertia = function updateLocalInertia() {
    this.localInertia.set([0,0,0,0,0,0,0,0,0]);
    this.localInverseInertia.set([0,0,0,0,0,0,0,0,0]);
    return this;
};

/**
 * Updates the world inverse inertia tensor.
 *
 * @method updateInertia
 * @chainable
 */
Particle.prototype.updateInertia = function updateInertia() {
    var localInvI = this.localInverseInertia;
    var q = this.orientation;
    if (localInvI[0] === localInvI[4] && localInvI[4] === localInvI[8]) return;
    if (q.w === 1) return;
    var R = q.toMatrix(MAT1_REGISTER);
    Mat33.multiply(R, this.inverseInertia, this.inverseInertia);
    Mat33.multiply(this.localInverseInertia, R.transpose(), this.inverseInertia);
    return this;
};

/**
 * Getter for position
 *
 * @method getPosition
 * @return {Vec3} position
 */
Particle.prototype.getPosition = function getPosition() {
    return this.position;
};

/**
 * Setter for position
 *
 * @method setPosition
 * @param {Number} x the x coordinate for position
 * @param {Number} y the y coordinate for position
 * @param {Number} z the z coordinate for position
 * @return {Particle} this
 * @chainable
 */
Particle.prototype.setPosition = function setPosition(x, y, z) {
    this.position.set(x, y, z);
    return this;
};

/**
 * Getter for velocity
 *
 * @method getVelocity
 * @return {Vec3} velocity
 */
Particle.prototype.getVelocity = function getVelocity() {
    return this.velocity;
};

/**
 * Setter for velocity
 *
 * @method setvelocity
 * @param {Number} x the x coordinate for velocity
 * @param {Number} y the y coordinate for velocity
 * @param {Number} z the z coordinate for velocity
 * @chainable
 */
Particle.prototype.setVelocity = function setVelocity(x, y, z) {
    this.velocity.set(x, y, z);
    Vec3.scale(this.velocity, this.mass, this.momentum);
    return this;
};

/**
 * Getter for momenutm
 *
 * @method getMomentum
 * @return {Vec3} momentum
 */
Particle.prototype.getMomentum = function getMomentum() {
    return this.momentum;
};

/**
 * Setter for momentum
 *
 * @method setMomentum
 * @param {Number} x the x coordinate for momentum
 * @param {Number} y the y coordinate for momentum
 * @param {Number} z the z coordinate for momentum
 * @chainable
 */
Particle.prototype.setMomentum = function setMomentum(x, y, z) {
    this.momentum.set(x, y, z);
    Vec3.scale(this.momentum, this.inverseMass, this.velocity);
    return this;
};

/**
 * Getter for orientation
 *
 * @method getOrientation
 * @return {Quaternion} orientation
 */
Particle.prototype.getOrientation = function getOrientation() {
    return this.orientation;
};

/**
 * Setter for orientation
 *
 * @method setOrientation
 * @param {Number} w
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @chainable
 */
Particle.prototype.setOrientation = function setOrientation(w,x,y,z) {
    this.orientation.set(w,x,y,z).normalize();
    this.updateInertia();
    return this;
};

/**
 * Getter for angular velocity
 *
 * @method getAngularVelocity
 * @return {Vec3} angularVelocity
 */
Particle.prototype.getAngularVelocity = function getAngularVelocity() {
    return this.angularVelocity;
};

/**
 * Setter for angular velocity
 *
 * @method setAngularVelocity
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
Particle.prototype.setAngularVelocity = function setAngularVelocity(x,y,z) {
    this.angularVelocity.set(x,y,z);
    var I = Mat33.inverse(this.inverseInertia, MAT1_REGISTER);
    if (I) I.vectorMultiply(this.angularVelocity, this.angularMomentum);
    else this.angularMomentum.clear();
    return this;
};

/**
 * Getter for angular momentum
 *
 * @method getAngularMomentum
 * @return {Vec3} angular momentum
 */
Particle.prototype.getAngularMomentum = function getAngularMomentum() {
    return this.angularMomentum;
};

/**
 * Setter for angular momentum
 *
 * @method setAngularMomentum
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
Particle.prototype.setAngularMomentum = function setAngularMomentum(x,y,z) {
    this.angularMomentum.set(x,y,z);
    this.inverseInertia.vectorMultiply(this.angularMomentum, this.angularVelocity);
    return this;
};

/**
 * Getter for the force on the Particle
 *
 * @method getForce
 * @return {Vec3} force
 */
Particle.prototype.getForce = function getForce() {
    return this.force;
};

/**
 * Setter for the force on the Particle
 *
 * @method setForce
 * @param {Vec3} v the new Force
 * @chainable
 */
Particle.prototype.setForce = function setForce(x, y, z) {
    this.force.set(x, y, z);
    return this;
};

/**
 * Getter for torque.
 *
 * @method getTorque
 */
Particle.prototype.getTorque = function getTorque() {
    return this.torque;
};

/**
 * Setter for torque.
 *
 * @method setTorque
 * @param {Vec3} v
 * @chainable
 */
Particle.prototype.setTorque = function setTorque(x, y, z) {
    this.torque.set(x, y, z);
    return this;
};

/**
 * Extends Particle.applyForce with an optional argument
 * to apply the force at an off-centered location, resulting in a torque.
 *
 * @method applyForce
 * @param force {Vec3} force
 * @param {Vec3} location off-center location on the Particle (optional)
 */
Particle.prototype.applyForce = function applyForce(force) {
    this.force.add(force);
    return this;
};

/**
 * Applied a torque force to a Particle, inducing a rotation.
 *
 * @method applyTorque
 * @param torque {Vec3} torque
 */
Particle.prototype.applyTorque = function applyTorque(torque) {
    this.torque.add(torque);
    return this;
};

/**
 * Applies an impulse to momentum and updates velocity.
 *
 * @method applyImpulse
 * @param {Vec3} impulse
 */
Particle.prototype.applyImpulse = function applyImpulse(impulse) {
    this.momentum.add(impulse);
    Vec3.scale(this.momentum, this.inverseMass, this.velocity);
    return this;
};

/**
 * Applies an angular impulse to angular momentum and updates angular velocity.
 *
 * @method applyAngularImpulse
 * @param {Vec3} angularImpulse
 */
Particle.prototype.applyAngularImpulse = function applyAngularImpulse(angularImpulse) {
    this.angularMomentum.add(angularImpulse);
    this.inverseInertia.vectorMultiply(this.angularMomentum, this.angularVelocity);
    return this;
};

/**
 * Used in collision detection. The support function should accept a Vec3 direction
 * and return the point on the body's shape furthest in that direction. For point particles,
 * this returns the zero vector.
 *
 * @method support
 * @return {Vec3}
 */
Particle.prototype.support = function support() {
    return ZERO_VECTOR;
};

/**
 * Update the body's shape to reflect current orientation. Called in _integratePose.
 * Noop for point particles.
 *
 * @method updateShape
 */
Particle.prototype.updateShape = function updateShape() {};

module.exports = Particle;
