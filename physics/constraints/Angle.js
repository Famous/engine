'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('famous-math').Vec3;
var Mat33 = require('famous-math').Mat33;

var DELTA_REGISTER = new Vec3();

/**
 *  A constraint that keeps a physics body a given direction away from a given
 *  anchor, or another attached body.
 *
 *  @class Angle
 *  @extends Constraint
 *  @param {Particle} a One of the bodies.
 *  @param {Particle} b The other body.
 *  @param {Object} options An object of configurable options.
 */
function Angle(a, b, options) {
    this.a = a;
    this.b = b;

    Constraint.call(this, options);

    this.effectiveInertia = new Mat33();
    this.angularImpulse = new Vec3();
    this.error = 0;
}

Angle.prototype = Object.create(Constraint.prototype);
Angle.prototype.constructor = Angle;

/**
 * Initialize the Angle. Sets defaults if a property was not already set.
 *
 * @method init
 * @param {Object} options The options hash.
 */
Angle.prototype.init = function() {
    this.cosAngle = this.cosAngle || this.a.orientation.dot(this.b.orientation);
};

/**
 * Warmstart the constraint and prepare calculations used in .resolve.
 *
 * @method update
 */
Angle.prototype.update = function update() {
    var a = this.a;
    var b = this.b;

    var q1 = a.orientation;
    var q2 = b.orientation;

    var cosTheta = q1.dot(q2);
    var diff = 2*(cosTheta - this.cosAngle);

    this.error = diff;

    var angularImpulse = this.angularImpulse;
    b.applyAngularImpulse(angularImpulse);
    a.applyAngularImpulse(angularImpulse.invert());

    Mat33.add(a.inverseInertia, b.inverseInertia, this.effectiveInertia);
    this.effectiveInertia.inverse();

    angularImpulse.clear();
};

/**
 * Adds an angular impulse to a physics body's angular velocity.
 *
 * @method resolve
 */
Angle.prototype.resolve = function update() {
    var a = this.a;
    var b = this.b;

    var diffW = DELTA_REGISTER;

    var w1 = a.angularVelocity;
    var w2 = b.angularVelocity;

    Vec3.subtract(w1, w2, diffW);
    diffW.scale(1 + this.error);

    var angularImpulse = diffW.applyMatrix(this.effectiveInertia);

    b.applyAngularImpulse(angularImpulse);
    a.applyAngularImpulse(angularImpulse.invert());
    angularImpulse.invert();
    this.angularImpulse.add(angularImpulse);
};

module.exports = Angle;
