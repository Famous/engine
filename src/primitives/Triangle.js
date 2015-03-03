'use strict';

var Geometry       = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class Triangle
 * @constructor
 *
 * @param {Object} options that can alter the values
 * and amount of vertex buffers
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
