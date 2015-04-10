'use strict';

var Force = require('./Force');
var Vec3 = require('famous-math').Vec3;

var FORCE_REGISTER = new Vec3();

/**
 * An inverse square force dependent on the masses of the source and targets.
 *
 * @class Gravity3D
 * @extends Force
 * @param {Object} options
 */
function Gravity3D(source, targets, options) {
    this.source = source || null;
    Force.call(this, targets, options);
}

Gravity3D.prototype = Object.create(Force.prototype);
Gravity3D.prototype.constructor = Gravity3D;

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method init
 */
Gravity3D.prototype.init = function() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 200;
};

/**
 * Apply the force.
 *
 * @method update
 */
Gravity3D.prototype.update = function() {
    var source = this.source;
    var targets = this.targets;

    var force = FORCE_REGISTER;

    var strength = this.strength;
    var max = this.max;
    var anchor = this.anchor || source.position;
    var sourceMass = this.anchor ? 1 : source.mass;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        Vec3.subtract(anchor, target.position, force);
        var dist = force.length();
        var invDistance = dist ? 1 / dist : 0;
        var magnitude = strength * sourceMass * target.mass * invDistance * invDistance;
        if (magnitude < 0) {
            magnitude = magnitude < -max ? -max : magnitude;
        } else {
            magnitude = magnitude > max ? max : magnitude;
        }
        force.scale(magnitude * invDistance);
        target.applyForce(force);
        if (source) source.applyForce(force.invert());
    }
};

module.exports = Gravity3D;
