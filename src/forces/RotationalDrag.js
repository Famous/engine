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
    Force.call(this, targets, options);
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
 * @return {Number}
 */
RotationalDrag.LINEAR = function LINEAR() {
    return 1;
};

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method init
 */
RotationalDrag.prototype.init = function init() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || RotationalDrag.LINEAR;
};

/**
 * Adds a rotational drag force to a physics body's torque accumulator.
 *
 * @method update
 */
RotationalDrag.prototype.update = function update() {
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
        target.applyTorque(torque);
    }
};

module.exports = RotationalDrag;
