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
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class Cylinder
 * @constructor
 *
 * @param {Object} options Parameters that alter thed
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Cylinder (options) {
    options  = options || {};
    var radius   = options.radius || 1;
    var detail   = options.detail || 15;
    var buffers;

    buffers = GeometryHelper.generateParametric(
        detail,
        detail,
        Cylinder.generator.bind(null, radius)
    );

    if (options.backface !== false) {
        GeometryHelper.addBackfaceTriangles(buffers.vertices, buffers.indices);
    }

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
 * Function used in iterative construction of parametric primitive.
 *
 * @static
 * @method
 * @param {Number} r Cylinder radius.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @param {Array} pos X, Y, Z position of vertex at given slice and stack.
 *
 * @return {undefined} undefined
 */
Cylinder.generator = function generator(r, u, v, pos) {
    pos[1] = r * Math.sin(v);
    pos[0] = r * Math.cos(v);
    pos[2] = r * (-1 + u / Math.PI * 2);
};

module.exports = Cylinder;
