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
    var options  = options || {};
    var detail   = options.detail || 30;
    var buffers  = getBuffers(detail);

    return new Geometry({
        type: 'TRIANGLE_FAN',
        buffers: [
            { name: 'pos', data: buffers.vertices },
            { name: 'texCoord', data: buffers.textureCoords, size: 2 },
            { name: 'normals', data: buffers.normals }
        ]
    });
}
    
/**
 * Calculates and returns all vertex positions, texture
 * coordinates and normals of the circle primitive.
 *
 * @method getBuffers
 *
 * @param {Number} detail Amount of detail that determines how many
 * vertices are created and where they are placed
 * 
 * @return {Object} constructed geometry
 */
function getBuffers(detail) {
    var theta = 0;
    var x;
    var y;
    var index = detail + 1;
    var nextTheta;
    var vertices      = [0, 0, 0];
    var normals       = [0, 0, 1];
    var textureCoords = [0.5, 0.5];

    while (index--) {
        theta = index / detail * Math.PI * 2;

        x = Math.cos(theta), y = Math.sin(theta);
        vertices.unshift(x, y, 0);
        normals.unshift(0, 0, 1);
        textureCoords.unshift(0.5 + x * 0.5, 0.5 + -y * 0.5);
    }

    return {
        vertices: vertices,
        normals: normals,
        textureCoords: textureCoords
    };
}

module.exports = Circle;
