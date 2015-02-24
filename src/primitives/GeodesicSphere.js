'use strict';

var Geometry       = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class GeodesicSphere
 * @constructor
 *
 * @param {Object} options that can alter the values
 * and amount of vertex buffers
 * 
 * @return {Object} constructed geometry
 */

function GeodesicSphere (options) {
    var t = (1 + Math.sqrt(5)) * 0.5;

    var vertices = [
        - 1,  t,  0,    1,  t,  0,   - 1, - t,  0,    1, - t,  0,
         0, - 1, -t,    0,  1, -t,    0, - 1,   t,    0,  1,   t,
         t,  0,   1,    t,  0, -1,   - t,  0,   1,   - t,  0, -1
    ];
    var indices = [
        0, 11,  5,    0,  5,  1,    0,  1,  7,    0,  7, 10,    0, 10, 11,
        1,  5,  9,    5, 11,  4,    11, 10, 2,   10,  7,  6,    7,  1,  8,
        3,  9,  4,    3,  4,  2,    3,  2,  6,    3,  6,  8,    3,  8,  9,
        4,  9,  5,    2,  4, 11,    6,  2, 10,    8,  6,  7,    9,  8,  1
    ];

    vertices = GeometryHelper.normalizeAll(vertices);

    var options = options || {};
    var detail  = options.detail || 3;

    while(--detail) GeometryHelper.subdivideSpheroid(vertices, indices);
    GeometryHelper.getUniqueFaces(vertices, indices);

    var normals       = GeometryHelper.computeNormals(vertices, indices);
    var textureCoords = GeometryHelper.getSpheroidUV(vertices);

    return new Geometry({
        buffers: [
            { name: 'pos', data: vertices },
            { name: 'texCoord', data: textureCoords, size: 2 },
            { name: 'normals', data: normals },
            { name: 'indices', data: indices, size: 1 }
        ]
    });
}

module.exports = GeodesicSphere;
