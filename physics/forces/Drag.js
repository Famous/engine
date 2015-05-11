'use strict';

var Force = require('./Force');
var Vec3 = require('famous-math').Vec3;

var FORCE_REGISTER = new Vec3();

/**
 * Use drag to oppose momentum of a moving object
 *
 * @class Drag
 * @extends Force
 * @param {Object} options
 */
function Drag(targets, options) {
    Force.call(this, targets, options);
}

Drag.prototype = Object.create(Force.prototype);
Drag.prototype.constructor = Drag;

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @attribute QUADRATIC
 * @type Function
 * @param {Number} v
 * @return {Number} used to square the magnitude of the velocity
 */
Drag.QUADRATIC = function QUADRATIC(v) {
    return v*v;
};

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @attribute LINEAR
 * @type Function
 * @param {Number} v
 * @return {Number} strength 1, will not scale the velocity
 */
Drag.LINEAR = function LINEAR(v) {
    return v;
};

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method init
 * @param {Object} options The options hash.
 */
Drag.prototype.init = function() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || Drag.LINEAR;
};

/**
 * Apply the force.
 *
 * @method update
 */
Drag.prototype.update = function update() {
    var targets = this.targets;
    var type = this.type;

    var force = FORCE_REGISTER;

    var max = this.max;
    var strength = this.strength;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var velocity = target.velocity;
        var v = velocity.length();
        var invV = v ? 1 / v : 0;
        var magnitude = -strength * type(v);
        Vec3.scale(velocity, (magnitude < -max ? -max : magnitude) * invV, force);
        target.applyForce(force);
    }
};

module.exports = Drag;
