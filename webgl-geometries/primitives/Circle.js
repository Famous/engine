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
 * @class Circle
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Circle (options) {
    options  = options || {};
    var detail   = options.detail || 30;
    var buffers  = getCircleBuffers(detail, true);

    if (options.backface !== false) {
        GeometryHelper.addBackfaceTriangles(buffers.vertices, buffers.indices);
    }

    var textureCoords = getCircleTexCoords(buffers.vertices);
    var normals = GeometryHelper.computeNormals(buffers.vertices, buffers.indices);

    return new Geometry({
        buffers: [
            { name: 'a_pos', data: buffers.vertices },
            { name: 'a_texCoord', data: textureCoords, size: 2 },
            { name: 'a_normals', data: normals },
            { name: 'indices', data: buffers.indices, size: 1 }
        ]
    });
}

function getCircleTexCoords (vertices) {
    var textureCoords = [];
    var nFaces = vertices.length / 3;

    for (var i = 0; i < nFaces; i++) {
        var x = vertices[i * 3],
            y = vertices[i * 3 + 1];

        textureCoords.push(0.5 + x * 0.5, 0.5 + -y * 0.5);
    }

    return textureCoords;
}

/**
 * Calculates and returns all vertex positions, texture
 * coordinates and normals of the circle primitive.
 *
 * @method
 *
 * @param {Number} detail Amount of detail that determines how many
 * vertices are created and where they are placed
 *
 * @return {Object} constructed geometry
 */
function getCircleBuffers(detail) {
    var vertices = [0, 0, 0];
    var indices = [];
    var counter = 1;
    var theta;
    var x;
    var y;

    for (var i = 0; i < detail + 1; i++) {
        theta = i / detail * Math.PI * 2;

        x = Math.cos(theta);
        y = Math.sin(theta);

        vertices.push(x, y, 0);

        if (i > 0) indices.push(0, counter, ++counter);
    }

    return {
        vertices: vertices,
        indices: indices
    };
}

module.exports = Circle;
