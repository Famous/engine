'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('famous-math').Vec3;

var IMPULSE_REGISTER = new Vec3();
var NORMAL_REGISTER = new Vec3();

/** @const */
var EPSILSON = 1e-7;
/** @const */
var PI = Math.PI;


/**
 *  A constraint that keeps a physics body on a given implicit curve.
 *
 *  @class Curve
 *  @constructor
 *  @extends Constraint
 */
function Curve(targets, options) {
    if (targets) {
        if (targets instanceof Array) this.targets = targets;
        else this.targets = [targets];
    }
    else this.targets = [];

    Constraint.call(this, options);

    this.impulses = {};
    this.normals = {};
    this.velocityBiases = {};
    this.divisors = {};
}

Curve.prototype = Object.create(Constraint.prototype);
Curve.prototype.constructor = Curve;

/**
 * Initialize the Curve. Sets defaults if a property was not already set.
 *
 * @method init
 */
Curve.prototype.init = function() {
    this.equation1 = this.equation1 || function() {
        return 0;
    };
    this.equation2 = this.equation2 || function(x, y, z) {
        return z;
    };
    this.period = this.period || 1;
    this.dampingRatio = this.dampingRatio || 0.5;

    this.stiffness = 4 * PI * PI / (this.period * this.period);
    this.damping = 4 * PI * this.dampingRatio / this.period;
};

/**
 * Warmstart the constraint and prepare calculations used in the .resolve step.
 *
 * @method update
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 */
Curve.prototype.update = function update(time, dt) {
    var targets = this.targets;

    var normals = this.normals;
    var velocityBiases = this.velocityBiases;
    var divisors = this.divisors;
    var impulses = this.impulses;

    var impulse = IMPULSE_REGISTER;
    var n = NORMAL_REGISTER;

    var f = this.equation1;
    var g = this.equation2;

    var _c = this.damping;
    var _k = this.stiffness;

    for (var i = 0, len = targets.length; i < len; i++) {
        var body = targets[i];
        var ID = body._ID;
        if (body.immune) continue;

        var p = body.position;
        var m = body.mass;

        var gamma;
        var beta;

        if (this.period === 0) {
            gamma = 0;
            beta = 1;
        } else {
            var c = _c * m;
            var k = _k * m;

            gamma = 1 / (dt*(c + dt*k));
            beta  = dt*k / (c + dt*k);
        }

        var x = p.x;
        var y = p.y;
        var z = p.z;

        var f0 = f(x, y, z);
        var dfx = (f(x + EPSILSON, y, z) - f0) / EPSILSON;
        var dfy = (f(x, y + EPSILSON, z) - f0) / EPSILSON;
        var dfz = (f(x, y, z + EPSILSON) - f0) / EPSILSON;

        var g0 = g(x, y, z);
        var dgx = (g(x + EPSILSON, y, z) - g0) / EPSILSON;
        var dgy = (g(x, y + EPSILSON, z) - g0) / EPSILSON;
        var dgz = (g(x, y, z + EPSILSON) - g0) / EPSILSON;

        n.set(dfx + dgx, dfy + dgy, dfz + dgz);
        n.normalize();

        var baumgarte = beta * (f0 + g0) / dt;
        var divisor = gamma + 1 / m;

        var lambda = impulses[ID] || 0;
        Vec3.scale(n, lambda, impulse);
        body.applyImpulse(impulse);

        normals[ID] = normals[ID] || new Vec3();
        normals[ID].copy(n);
        velocityBiases[ID] = baumgarte;
        divisors[ID] = divisor;
        impulses[ID] = 0;
    }
};

/**
 * Adds a curve impulse to a physics body.
 *
 * @method resolve
 */
Curve.prototype.resolve = function resolve() {
    var targets = this.targets;

    var normals = this.normals;
    var velocityBiases = this.velocityBiases;
    var divisors = this.divisors;
    var impulses = this.impulses;

    var impulse = IMPULSE_REGISTER;

    for (var i = 0, len = targets.length; i < len; i++) {
        var body = targets[i];
        var ID = body._ID;
        if (body.immune) continue;

        var v = body.velocity;
        var n = normals[ID];

        var lambda = -(Vec3.dot(n, v) + velocityBiases[ID]) / divisors[ID];

        Vec3.scale(n, lambda, impulse);
        body.applyImpulse(impulse);


        impulses[ID] += lambda;
    }
};

module.exports = Curve;