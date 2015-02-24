'use strict';

var Vec3 = require('famous-math').Vec3;
var Quaternion = require('famous-math').Quaternion;
var Matrix = require('famous-math').Mat33;

var ZERO_VECTOR = new Vec3();

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

    this.inertia = new Matrix([0,0,0,0,0,0,0,0,0]);
    this.inverseInertia = new Matrix([0,0,0,0,0,0,0,0,0]);

    this.size = options.size || [0, 0, 0];

    var v = options.velocity;
    var w = options.angularVelocity;
    if (v) this.setVelocity(v.x, v.y, v.z);
    if (w) this.setAngularVelocity(w.x, w.y, w.z);

    this.restrictions = 0;
    this.setRestrictions.apply(this, options.restrictions || []);

    this.collisionMask = options.collisionMask || 1;
    this.collisionGroup = options.collisionGroup || 1;

    this.type = 1 << 0;
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
    this.setInertia();
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
 * Infers the inertia tensor. Will also compute and set the inverse inertia.
 *
 * @method setInertia
 * @param {Mat33} matrix
 */
Particle.prototype.setInertia = function setInertia() {
    this.inertia = new Matrix([0,0,0,0,0,0,0,0,0]);
    this.inverseInertia = new Matrix([0,0,0,0,0,0,0,0,0]);
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
    this.inertia.vectorMultiply(this.angularVelocity, this.angularMomentum);
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
    this.momentum.add(impulse)
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
 * Used in collision detection. The support function should take in a Vec3 direction
 * and return the point on the body's shape furthest in that direction.
 *
 * @method support
 * @param {Vec3} direction
 * @return {Vec3}
 */
Particle.prototype.support = function support(direction) {
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
