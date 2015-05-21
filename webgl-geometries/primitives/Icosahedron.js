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
 * @class Icosahedron
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 * 
 * @return {Object} constructed geometry
 */
function Icosahedron() {
    var t = ( 1 + Math.sqrt( 5 ) ) / 2;

    var vertices = [
        - 1,   t,  0,    1,  t,  0,   - 1, - t,  0,    1, - t,  0,
          0, - 1, -t,    0,  1, -t,     0, - 1,  t,    0,   1,  t,
          t,   0,  1,    t,  0, -1,   - t,   0,  1,  - t,   0, -1
    ];
    var indices = [
        0,  5, 11,    0,  1,  5,    0,  7,  1,    0, 10,  7,    0, 11, 10,
        1,  9,  5,    5,  4, 11,    11, 2, 10,   10,  6,  7,    7,  8,  1,
        3,  4,  9,    3,  2,  4,    3,  6,  2,    3,  8,  6,    3,  9,  8,
        4,  5,  9,    2, 11,  4,    6, 10,  2,    8,  7,  6,    9,  1,  8
    ];

    GeometryHelper.getUniqueFaces(vertices, indices);

    var normals       = GeometryHelper.computeNormals(vertices, indices);
    var textureCoords = GeometryHelper.getSpheroidUV(vertices);

    vertices      = GeometryHelper.normalizeAll(vertices);

    return new Geometry({
        buffers: [
            { name: 'a_pos', data: vertices },
            { name: 'a_texCoord', data: textureCoords, size: 2 },
            { name: 'a_normals', data: normals },
            { name: 'indices', data: indices, size: 1 }
        ]
    });
}

module.exports = Icosahedron;
