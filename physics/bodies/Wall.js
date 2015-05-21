/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Particle = require('./Particle');
var Vec3 = require('../../math/Vec3');

/**
 * @enum directions
 */
Wall.DOWN = 0;
Wall.UP = 1;
Wall.LEFT = 2;
Wall.RIGHT = 3;
Wall.FORWARD = 4;
Wall.BACKWARD = 5;

/**
 * An axis-aligned boundary. Will not respond to forces or impulses.
 *
 * @class Wall
 * @extends Particle
 * @param {Object} options The initial state of the body.
 */
function Wall(options) {
    Particle.call(this, options);

    var n = this.normal = new Vec3();

    var d = this.direction = options.direction;
    switch (d) {
        case Wall.DOWN:
            n.set(0, 1, 0);
            break;
        case Wall.UP:
            n.set(0, -1, 0);
            break;
        case Wall.LEFT:
            n.set(-1, 0, 0);
            break;
        case Wall.RIGHT:
            n.set(1, 0, 0);
            break;
        case Wall.FORWARD:
            n.set(0, 0, -1);
            break;
        case Wall.BACKWARD:
            n.set(0, 0, 1);
            break;
        default:
            break;
    }

    this.invNormal = Vec3.clone(n, new Vec3()).invert();

    this.mass = Infinity;
    this.inverseMass = 0;

    this.type = 1 << 3;
}

Wall.prototype = Object.create(Particle.prototype);
Wall.prototype.constructor = Wall;

module.exports = Wall;
