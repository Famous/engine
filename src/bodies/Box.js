'use strict';

var Vec3 = require('famous-math').Vec3;
var ConvexBodyFactory = require('./ConvexBodyFactory');

var _Box = ConvexBodyFactory([
            // Order: back-left,back-right,front-left,front-right
            // Top half
            new Vec3(-100, -100, -100),
            new Vec3(100, -100, -100),
            new Vec3(-100, -100, 100),
            new Vec3(100, -100, 100),
            // Bottom half
            new Vec3(-100, 100, -100),
            new Vec3(100, 100, -100),
            new Vec3(-100, 100, 100),
            new Vec3(100, 100, 100),
        ]);

/**
 * @class Box
 * @extends Particle
 * @param {Object} options
 */
function Box(options) {
    _Box.call(this, options);
    this.normals = [
        // Order: top, right, front
        new Vec3(0, 1, 0),
        new Vec3(1, 0, 0),
        new Vec3(0, 0, 1)
    ];

    this.type = 1 << 1;
}

Box.prototype = Object.create(_Box.prototype);
Box.prototype.constructor = Box;

module.exports = Box;
