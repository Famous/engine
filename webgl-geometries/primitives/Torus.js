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

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Torus
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */

function Torus(options) {
    options  = options || {};
    var detail   = options.detail || 30;
    var holeRadius = options.holeRadius || 0.80;
    var tubeRadius = options.tubeRadius || 0.20;

    var buffers = GeometryHelper.generateParametric(
        detail,
        detail,
        Torus.generator.bind(null, holeRadius, tubeRadius)
    );

    return new Geometry({
        buffers: [
            { name: 'a_pos', data: buffers.vertices },
            { name: 'a_texCoord', data: GeometryHelper.getSpheroidUV(buffers.vertices), size: 2 },
            { name: 'a_normals', data: GeometryHelper.computeNormals(buffers.vertices, buffers.indices) },
            { name: 'indices', data: buffers.indices, size: 1 }
        ]
    });
}

/**
 * function used in iterative construction of parametric primitive.
 *
 * @static
 * @method
 * @param {Number} c Radius of inner hole.
 * @param {Number} a Radius of tube.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @param {Array} pos X, Y, Z position of vertex at given slice and stack.
 *
 * @return {undefined} undefined
 */
Torus.generator = function generator(c, a, u, v, pos) {
    pos[0] = (c + a * Math.cos(2 * v)) * Math.sin(2 * u);
    pos[1] = -(c + a * Math.cos(2 * v)) * Math.cos(2 * u);
    pos[2] = a * Math.sin(2 * v);
};

module.exports = Torus;
