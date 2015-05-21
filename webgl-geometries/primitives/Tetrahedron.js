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
 * This function generates custom buffers and passes them to
 * a new static geometry, which is returned to the user.
 *
 * @class Tetrahedron
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Tetrahedron(options) {
    var textureCoords = [];
    var normals = [];
    var detail;
    var i;
    var t = Math.sqrt(3);

    var vertices = [
        // Back
         1, -1, -1 / t,
        -1, -1, -1 / t,
         0,  1,  0,

        // Right
         0,  1,  0,
         0, -1, t - 1 / t,
         1, -1, -1 / t,

        // Left
         0,  1,  0,
        -1, -1, -1 / t,
         0, -1,  t - 1 / t,

        // Bottom
         0, -1,  t - 1 / t,
        -1, -1, -1 / t,
         1, -1, -1 / t
    ];

    var indices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11
    ];

    for (i = 0; i < 4; i++) {
        textureCoords.push(
            0.0, 0.0,
            0.5, 1.0,
            1.0, 0.0
        );
    }

    options       = options || {};

    while(--detail) GeometryHelper.subdivide(indices, vertices, textureCoords);
    normals       = GeometryHelper.computeNormals(vertices, indices);

    return new Geometry({
        buffers: [
            { name: 'a_pos', data: vertices },
            { name: 'a_texCoord', data: textureCoords, size: 2 },
            { name: 'a_normals', data: normals },
            { name: 'indices', data: indices, size: 1 }
        ]
    });
}

module.exports = Tetrahedron;
