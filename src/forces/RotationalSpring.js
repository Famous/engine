'use strict';

var Force = require('./Force');
var Quaternion = require('famous-math').Quaternion;
var Vec3 = require('famous-math').Vec3;
var Mat33 = require('famous-math').Mat33;

var Q_REGISTER = new Quaternion();
var DAMPING_REGISTER = new Vec3();
var XYZ_REGISTER = new Vec3();
var MAT_REGISTER = new Mat33();

/** @const ZERO_MAT */
var ZERO_MAT = new Mat33([0,0,0,0,0,0,0,0,0]);
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
    if (targets) {
        if (targets instanceof Array) this.targets = targets;
        else this.targets = [targets];
    }
    else this.targets = [];
    Force.call(this, options);
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
    if (options.stiffness) {
        this.damping = this.damping || 0;
        this.period = null;
        this.dampingRatio = null;
    }
    else if (options.period) {
        this.stiffness = 2 * PI / this.period;
        this.stiffness *= this.stiffness;

        this.dampingRatio = this.dampingRatio || 0;
        this.damping = 4 * PI * this.dampingRatio / this.period;
    }
    else {
        this.period = 300;
        this.dampingRatio = 0;

        this.stiffness = 2 * PI / this.period, 2;
        this.stiffness *= this.stiffness;
        this.damping = 4 * PI * this.dampingRatio / this.period;
    }
};

/**
 * Adds a torque force to a physics body's torque accumulator.
 *
 * @method update
 * @param {Number} time
 * @param {Number} dt
 */
RotationalSpring.prototype.update = function update(time, dt) {
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
    var invSourceInertia = this.anchor ? ZERO_MAT : source.inverseInertia;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var q = target.orientation;
        Quaternion.conjugate(q, deltaQ);
        deltaQ.leftMultiply(anchor);

        var halftheta = deltaQ.w > 1 ? 0 : Math.acos(deltaQ.w);
        var length = Math.sqrt(1-deltaQ.w*deltaQ.w);
        if (Math.abs(length) < 1e-6) continue;

        var deltaOmega = XYZ.copy(deltaQ).scale(2*halftheta/length);

        deltaOmega.scale(stiffness);

        Mat33.add(invSourceInertia, target.inverseInertia, effInertia).inverse();

        if (damping) {
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
