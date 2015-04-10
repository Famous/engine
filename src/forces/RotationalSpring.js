'use strict';

var Force = require('./Force');
var Quaternion = require('famous-math').Quaternion;
var Vec3 = require('famous-math').Vec3;
var Mat33 = require('famous-math').Mat33;

var Q_REGISTER = new Quaternion();
var DAMPING_REGISTER = new Vec3();
var XYZ_REGISTER = new Vec3();
var MAT_REGISTER = new Mat33();

/** @const PI */
var PI = Math.PI;

/**
 * A spring-like behavior that attempts to enforce a specfic orientation by applying torque.
 *
 * @class RotationalSpring
 * @extends Force
 * @param {Object} options
 */
function RotationalSpring(source, targets, options) {
    this.source = source || null;
    Force.call(this, targets, options);
}

RotationalSpring.prototype = Object.create(Force.prototype);
RotationalSpring.prototype.constructor = RotationalSpring;

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method init
 * @param {Object} options The options hash.
 */
RotationalSpring.prototype.init = function init(options) {
    if (!this.source) this.anchor = this.anchor ? this.anchor.normalize() : new Quaternion(1,0,0,0);
    if (options.stiffness || options.damping) {
        this.stiffness = this.stiffness || 100;
        this.damping = this.damping || 0;
        this.period = null;
        this.dampingRatio = null;
    }
    else if (options.period || options.dampingRatio) {
        this.period = this.period || 1;
        this.dampingRatio = this.dampingRatio || 0;

        this.stiffness = 2 * PI / this.period;
        this.stiffness *= this.stiffness;
        this.damping = 4 * PI * this.dampingRatio / this.period;
    }
};

/**
 * Adds a torque force to a physics body's torque accumulator.
 *
 * @method update
 */
RotationalSpring.prototype.update = function update() {
    var source = this.source;
    var targets = this.targets;

    var deltaQ = Q_REGISTER;
    var dampingTorque = DAMPING_REGISTER;
    var XYZ = XYZ_REGISTER;
    var effInertia = MAT_REGISTER;

    var max = this.max;
    var stiffness = this.stiffness;
    var damping = this.damping;
    var anchor = this.anchor || source.orientation;
    var invSourceInertia = this.anchor ? null : source.inverseInertia;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var q = target.orientation;
        Quaternion.conjugate(q, deltaQ);
        deltaQ.multiply(anchor);

        if (deltaQ.w >= 1) continue;
        var halftheta = Math.acos(deltaQ.w);
        var length = Math.sqrt(1 - deltaQ.w * deltaQ.w);

        var deltaOmega = XYZ.copy(deltaQ).scale(2 * halftheta / length);

        deltaOmega.scale(stiffness);

        if (invSourceInertia !== null) {
            Mat33.add(invSourceInertia, target.inverseInertia, effInertia).inverse();
        } else {
            Mat33.inverse(target.inverseInertia, effInertia);
        }

        if (damping !== 0) {
            if (source) {
                deltaOmega.add(Vec3.subtract(target.angularVelocity, source.angularVelocity, dampingTorque).scale(-damping));
            }
            else {
                deltaOmega.add(Vec3.scale(target.angularVelocity, -damping, dampingTorque));
            }
        }

        var torque = deltaOmega.applyMatrix(effInertia);
        var magnitude = torque.length();

        if (magnitude > max) torque.scale(max/magnitude);

        target.applyTorque(torque);
        if (source) source.applyTorque(torque.invert());
    }
};

module.exports = RotationalSpring;
