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
 * @class ParametricSphere
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function ParametricSphere (options) {
    options = options || {};
    var detail = options.detail || 10;
    var detailX = options.detailX || detail;
    var detailY = options.detailY || detail;

    var buffers = GeometryHelper.generateParametric(
        detailX,
        detailY,
        ParametricSphere.generator,
        true
    );

    GeometryHelper.getUniqueFaces(buffers.vertices, buffers.indices);

    return new Geometry({
        buffers: [
            { name: 'a_pos', data: buffers.vertices },
            { name: 'a_texCoord', data: GeometryHelper.getSpheroidUV(buffers.vertices), size: 2 },
            { name: 'a_normals', data: GeometryHelper.getSpheroidNormals(buffers.vertices) },
            { name: 'indices', data: buffers.indices, size: 1 }
        ]
    });
}

/**
 * Function used in iterative construction of parametric primitive.
 *
 * @static
 * @method
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @param {Array} pos X, Y, Z position of vertex at given slice and stack.
 *
 * @return {undefined} undefined
 */
ParametricSphere.generator = function generator(u, v, pos) {
    var x = Math.sin(u) * Math.cos(v);
    var y = Math.cos(u);
    var z = -Math.sin(u) * Math.sin(v);

    pos[0] = x;
    pos[1] = y;
    pos[2] = z;
};

module.exports = ParametricSphere;
