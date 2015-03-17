'use strict';

var Geometry       = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Triangle
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 * 
 * @return {Object} constructed geometry
 */
function Triangle (options) {
    var options  = options || {};
    var detail   = options.detail || 1;
    var normals  = [];
    var textureCoords = [
        0.0, 0.0,
        0.5, 1.0,
        1.0, 0.0
    ];
    var indices  = [
        0, 1, 2
    ];
    var vertices = [
        -1,  1, 0,
         0, -1, 0,
         1,  1, 0
    ];

    while(--detail) GeometryHelper.subdivide(indices, vertices, textureCoords);
    normals       = GeometryHelper.computeNormals(vertices, indices);

    return new Geometry({
        buffers: [
            { name: 'pos', data: vertices },
            { name: 'texCoord', data: textureCoords, size: 2 },
            { name: 'normals', data: normals },
            { name: 'indices', data: indices, size: 1 }
        ]
    });
}

module.exports = Triangle;
