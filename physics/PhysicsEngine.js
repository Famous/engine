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

var Particle = require('./bodies/Particle');
var Constraint = require('./constraints/Constraint');
var Force = require('./forces/Force');

var CallbackStore = require('../utilities/CallbackStore');

var Vec3 = require('../math/Vec3');
var Quaternion = require('../math/Quaternion');

var VEC_REGISTER = new Vec3();
var QUAT_REGISTER = new Quaternion();
var DELTA_REGISTER = new Vec3();

/**
 * Singleton PhysicsEngine object.
 * Manages bodies, forces, constraints.
 *
 * @class PhysicsEngine
 * @param {Object} options A hash of configurable options.
 */
function PhysicsEngine(options) {
    this.events = new CallbackStore();

    options = options || {};
    /** @prop bodies The bodies currently active in the engine. */
    this.bodies = [];
    /** @prop forces The forces currently active in the engine. */
    this.forces = [];
    /** @prop constraints The constraints currently active in the engine. */
    this.constraints = [];

    /** @prop step The time between frames in the engine. */
    this.step = options.step || 1000/60;
    /** @prop iterations The number of times each constraint is solved per frame. */
    this.iterations = options.iterations || 10;
    /** @prop _indexPool Pools of indicies to track holes in the arrays. */
    this._indexPools = {
        bodies: [],
        forces: [],
        constraints: []
    };

    this._entityMaps = {
        bodies: {},
        forces: {},
        constraints: {}
    };

    this.speed = options.speed || 1.0;
    this.time = 0;
    this.delta = 0;

    this.origin = options.origin || new Vec3();
    this.orientation = options.orientation ? options.orientation.normalize() :  new Quaternion();

    this.frameDependent = options.frameDependent || false;

    this.transformBuffers = {
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1]
    };
}

/**
 * Listen for a specific event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Function} callback Callback to register for the event.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.on = function on(key, callback) {
    this.events.on(key, callback);
    return this;
};

/**
 * Stop listening for a specific event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Function} callback Callback to deregister for the event.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.off = function off(key, callback) {
    this.events.off(key, callback);
    return this;
};

/**
 * Trigger an event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Object} payload Payload to pass to the event listeners.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.trigger = function trigger(key, payload) {
    this.events.trigger(key, payload);
    return this;
};

/**
 * Set the origin of the world.
 *
 * @method
 * @chainable
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.setOrigin = function setOrigin(x, y, z) {
    this.origin.set(x, y, z);
    return this;
};

/**
 * Set the orientation of the world.
 *
 * @method
 * @chainable
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.setOrientation = function setOrientation(w, x, y, z) {
    this.orientation.set(w, x, y, z).normalize();
    return this;
};

/**
 * Private helper method to store an element in a library array.
 *
 * @method
 * @private
 * @param {Object} context Object in possesion of the element arrays.
 * @param {Object} element The body, force, or constraint to add.
 * @param {String} key Where to store the element.
 * @return {undefined} undefined
 */
function _addElement(context, element, key) {
    var map = context._entityMaps[key];
    if (map[element._ID] == null) {
        var library = context[key];
        var indexPool = context._indexPools[key];
        if (indexPool.length) map[element._ID] = indexPool.pop();
        else map[element._ID] = library.length;
        library[map[element._ID]] = element;
    }
}

/**
 * Private helper method to remove an element from a library array.
 *
 * @method
 * @private
 * @param {Object} context Object in possesion of the element arrays.
 * @param {Object} element The body, force, or constraint to remove.
 * @param {String} key Where to store the element.
 * @return {undefined} undefined
 */
function _removeElement(context, element, key) {
    var map = context._entityMaps[key];
    var index = map[element._ID];
    if (index != null) {
        context._indexPools[key].push(index);
        context[key][index] = null;
        map[element._ID] = null;
    }
}

/**
 * Add a group of bodies, force, or constraints to the engine.
 *
 * @method
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.add = function add() {
    for (var j = 0, lenj = arguments.length; j < lenj; j++) {
        var entity = arguments[j];
        if (entity instanceof Array) {
            for (var i = 0, len = entity.length; i < len; i++) {
                var e = entity[i];
                this.add(e);
            }
        }
        else {
            if (entity instanceof Particle) this.addBody(entity);
            else if (entity instanceof Constraint) this.addConstraint(entity);
            else if (entity instanceof Force) this.addForce(entity);
        }
    }
    return this;
};

/**
 * Remove a group of bodies, force, or constraints from the engine.
 *
 * @method
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.remove = function remove() {
    for (var j = 0, lenj = arguments.length; j < lenj; j++) {
        var entity = arguments[j];
        if (entity instanceof Array) {
            for (var i = 0, len = entity.length; i < len; i++) {
                var e = entity[i];
                this.add(e);
            }
        }
        else {
            if (entity instanceof Particle) this.removeBody(entity);
            else if (entity instanceof Constraint) this.removeConstraint(entity);
            else if (entity instanceof Force) this.removeForce(entity);
        }
    }
    return this;
};

/**
 * Begin tracking a body.
 *
 * @method
 * @param {Particle} body The body to track.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.addBody = function addBody(body) {
    _addElement(this, body, 'bodies');
};

/**
 * Begin tracking a force.
 *
 * @method
 * @param {Force} force The force to track.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.addForce = function addForce(force) {
    _addElement(this, force, 'forces');
};

/**
 * Begin tracking a constraint.
 *
 * @method
 * @param {Constraint} constraint The constraint to track.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.addConstraint = function addConstraint(constraint) {
    _addElement(this, constraint, 'constraints');
};

/**
 * Stop tracking a body.
 *
 * @method
 * @param {Particle} body The body to stop tracking.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.removeBody = function removeBody(body) {
    _removeElement(this, body, 'bodies');
};

/**
 * Stop tracking a force.
 *
 * @method
 * @param {Force} force The force to stop tracking.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.removeForce = function removeForce(force) {
    _removeElement(this, force, 'forces');
};

/**
 * Stop tracking a constraint.
 *
 * @method
 * @param {Constraint} constraint The constraint to stop tracking.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.removeConstraint = function removeConstraint(constraint) {
    _removeElement(this, constraint, 'constraints');
};

/**
 * Update the physics system to reflect the changes since the last frame. Steps forward in increments of
 * PhysicsEngine.step.
 *
 * @method
 * @param {Number} time The time to which to update.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.update = function update(time) {
    if (this.time === 0) this.time = time;

    var bodies = this.bodies;
    var forces = this.forces;
    var constraints = this.constraints;

    var frameDependent = this.frameDependent;
    var step = this.step;
    var dt = step * 0.001;
    var speed = this.speed;

    var delta = this.delta;
    delta += (time - this.time) * speed;
    this.time = time;

    var i, len;
    var force, body, constraint;

    while(delta > step) {
        this.events.trigger('prestep', time);

        // Update Forces on particles
        for (i = 0, len = forces.length; i < len; i++) {
            force = forces[i];
            if (force === null) continue;
            force.update(time, dt);
        }

        // Tentatively update velocities
        for (i = 0, len = bodies.length; i < len; i++) {
            body = bodies[i];
            if (body === null) continue;
            _integrateVelocity(body, dt);
        }

        // Prep constraints for solver
        for (i = 0, len = constraints.length; i < len; i++) {
            constraint = constraints[i];
            if (constraint === null) continue;
            constraint.update(time, dt);
        }

        // Iteratively resolve constraints
        for (var j = 0, numIterations = this.iterations; j < numIterations; j++) {
            for (i = 0, len = constraints.length; i < len; i++) {
                constraint = constraints[i];
                if (constraint === null) continue;
                constraint.resolve(time, dt);
            }
        }

        // Increment positions and orientations
        for (i = 0, len = bodies.length; i < len; i++) {
            body = bodies[i];
            if (body === null) continue;
            _integratePose(body, dt);
        }

        this.events.trigger('poststep', time);

        if (frameDependent) delta = 0;
        else delta -= step;
    }

    this.delta = delta;
};

/**
 * Transform the body position and rotation to world coordinates.
 *
 * @method
 * @param {Particle} body The body to retrieve the transform of.
 * @return {Object} Position and rotation of the body, taking into account
 * the origin and orientation of the world.
 */
PhysicsEngine.prototype.getTransform = function getTransform(body) {
    var o = this.origin;
    var oq = this.orientation;
    var transform = this.transformBuffers;

    var p = body.position;
    var q = body.orientation;
    var rot = q;
    var loc = p;

    if (oq.w !== 1) {
        rot = Quaternion.multiply(q, oq, QUAT_REGISTER);
        loc = oq.rotateVector(p, VEC_REGISTER);
    }

    transform.position[0] = o.x+loc.x;
    transform.position[1] = o.y+loc.y;
    transform.position[2] = o.z+loc.z;

    transform.rotation[0] = rot.x;
    transform.rotation[1] = rot.y;
    transform.rotation[2] = rot.z;
    transform.rotation[3] = rot.w;

    return transform;
};

/**
 * Update the Particle momenta based off of current incident force and torque.
 *
 * @method
 * @private
 * @param {Particle} body The body to update.
 * @param {Number} dt Delta time.
 * @return {undefined} undefined
 */
function _integrateVelocity(body, dt) {
    body.momentum.add(Vec3.scale(body.force, dt, DELTA_REGISTER));
    body.angularMomentum.add(Vec3.scale(body.torque, dt, DELTA_REGISTER));
    Vec3.scale(body.momentum, body.inverseMass, body.velocity);
    body.inverseInertia.vectorMultiply(body.angularMomentum, body.angularVelocity);
    body.force.clear();
    body.torque.clear();
}

/**
 * Update the Particle position and orientation based off current translational and angular velocities.
 *
 * @method
 * @private
 * @param {Particle} body The body to update.
 * @param {Number} dt Delta time.
 * @return {undefined} undefined
 */
function _integratePose(body, dt) {
    if (body.restrictions !== 0) {
        var restrictions = body.restrictions;
        var x = null;
        var y = null;
        var z = null;
        var ax = null;
        var ay = null;
        var az = null;

        if (restrictions & 32) x = 0;
        if (restrictions & 16) y = 0;
        if (restrictions & 8) z = 0;
        if (restrictions & 4) ax = 0;
        if (restrictions & 2) ay = 0;
        if (restrictions & 1) az = 0;

        if (x !== null || y !== null || z !== null) body.setVelocity(x,y,z);
        if (ax !== null || ay !== null || az !== null) body.setAngularVelocity(ax, ay, az);
    }

    body.position.add(Vec3.scale(body.velocity, dt, DELTA_REGISTER));

    var w = body.angularVelocity;
    var q = body.orientation;
    var wx = w.x;
    var wy = w.y;
    var wz = w.z;

    var qw = q.w;
    var qx = q.x;
    var qy = q.y;
    var qz = q.z;

    var hdt = dt * 0.5;
    q.w += (-wx * qx - wy * qy - wz * qz) * hdt;
    q.x += (wx * qw + wy * qz - wz * qy) * hdt;
    q.y += (wy * qw + wz * qx - wx * qz) * hdt;
    q.z += (wz * qw + wx * qy - wy * qx) * hdt;

    q.normalize();

    body.updateInertia();
}

module.exports = PhysicsEngine;
