'use strict';

var Force = require('./Force');
var Vec3 = require('famous-math').Vec3;

var TORQUE_REGISTER = new Vec3();

/**
 * A behavior that slows angular velocity by applying torque.
 *
 * @class RotationalDrag
 * @extends Force
 * @param {Object} options options to set on drag
 */
function RotationalDrag(targets, options) {
    if (targets) {
        if (targets instanceof Array) this.targets = targets;
        else this.targets = [targets];
    }
    else this.targets = [];
    Force.call(this, options);
}

RotationalDrag.prototype = Object.create(Force.prototype);
RotationalDrag.prototype.constructor = RotationalDrag;

/**
 * Used to scale angular velocity in the computation of the drag torque.
 *
 * @attribute QUADRATIC
 * @type Function
 * @param {Vec3} omega
 * @return {Number}
 */
RotationalDrag.QUADRATIC = function QUADRATIC(omega) {
    return omega.length();
};

/**
 * Used to scale angular velocity in the computation of the drag torque.
 *
 * @attribute LINEAR
 * @type Function
 * @param {Vec3} omega
 * @return {Number}
 */
RotationalDrag.LINEAR = function LINEAR(omega) {
    return 1;
};

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method init
 * @param {Object} options The options hash.
 */
RotationalDrag.prototype.init = function init(options) {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || RotationalDrag.LINEAR;
};

/**
 * Adds a rotational drag force to a physics body's torque accumulator.
 *
 * @method update
 * @param {Number} time
 * @param {Number} dt
 */
RotationalDrag.prototype.update = function update(time, dt) {
    var targets = this.targets;
    var type = this.type;

    var torque = TORQUE_REGISTER;

    var max = this.max;
    var strength = this.strength;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var omega = target.angularVelocity;
        var magnitude = -strength * type(omega);
        Vec3.scale(omega, magnitude < -max ? -max : magnitude, torque);
        torque.applyMatrix(target.inertia);
        target.applyTorque(torque);
    }
};

function clamp(value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

module.exports = RotationalDrag;
