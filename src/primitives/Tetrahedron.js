'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class Tetrahedron
 * @constructor
 *
 * @param {Object} options that can alter the values
 * and amount of vertex buffers
 * 
 * @return {Object} constructed geometry
 */

function Tetrahedron(options) {
    var textureCoords = [];
    var normals = [];
    var geometry;
    var detail;
    var i;
    
    var vertices = [
        // Back 
        -1,  1, -1,
         1,  1, -1,
         0, -1,  0,
        
        // Right
         0,  1,  1,
         0, -1,  0,
         1,  1, -1,

        // Left
        -1,  1, -1,
         0, -1,  0,
         0,  1,  1,

        // Bottom
        -1,  1, -1,
         0,  1,  1,
         1,  1, -1,
    ];

    var indices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11,
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
            { name: 'pos', data: vertices },
            { name: 'texCoord', data: textureCoords, size: 2 },
            { name: 'normals', data: normals },
            { name: 'indices', data: indices, size: 1 }
        ]
    });
}

module.exports = Tetrahedron;
