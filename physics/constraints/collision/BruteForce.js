'use strict';

var AABB = require('./AABB');

/**
 * O(n^2) comparisons with an AABB check for a midphase. Likely to be more performant
 * that the BruteForce when the bodies have many vertices. Only feasible for a small number of bodies.
 *
 * @class BruteForAABB
 * @param {Particles[]} targets
 * @param {Object} options
 */
function BruteForceAABB(targets) {
    this._volumes = [];
    this._entityRegistry = {};
    for (var i = 0; i < targets.length; i++) {
        this.add(targets[i]);
    }
}

/**
 * Start tracking a Particle.
 *
 * @method add
 * @param {Particle} body
 */
BruteForceAABB.prototype.add = function add(body) {
    var boundingVolume = new AABB(body);

    this._entityRegistry[body._ID] = body;
    this._volumes.push(boundingVolume);
};

/**
 * Return an array of possible collision pairs, culled by an AABB intersection test.
 *
 * @method update
 * @return {Particle[][]}
 */
BruteForceAABB.prototype.update = function update() {
    var _volumes = this._volumes;
    var _entityRegistry = this._entityRegistry;

    for (var k = 0, len = _volumes.length; k < len; k++) {
        _volumes[k].update();
    }

    var result = [];
    for (var i = 0, numTargets = _volumes.length; i < numTargets; i++) {
        for (var j = i + 1; j < numTargets; j++) {
            if (AABB.checkOverlap(_volumes[i], _volumes[j])) {
                result.push([_entityRegistry[i], _entityRegistry[j]]);
            }
        }
    }
    return result;
};

/**
 * The most simple yet computationally intensive broad-phase. Immediately passes its targets to the narrow-phase,
 * resulting in an O(n^2) process. Only feasible for a relatively small number of bodies.
 *
 * @class BruteForce
 * @param {Particle[]} targets
 */
function BruteForce(targets) {
    this.targets = targets;
}

/**
 * Start tracking a Particle.
 *
 * @method add
 * @param {Particle} body
 */
BruteForce.prototype.add = function add(body) {
    this.targets.push(body);
};

/**
 * Immediately returns an array of possible collisions.
 *
 * @method update
 * @return {Particle[][]}
 */
BruteForce.prototype.update = function update() {
    return [this.targets];
};

module.exports.BruteForceAABB = BruteForceAABB;
module.exports.BruteForce = BruteForce;
