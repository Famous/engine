'use strict';

var Geometry = require('../Geometry');

/**
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class Plane
 * @constructor
 *
 * @param {Object} options that can alter the values
 * and amount of vertex buffers
 * 
 * @return {Object} constructed geometry
 */

function Plane(options) {
    var options = options || {};
    var detailX = options.detailX || options.detail || 1;
    var detailY = options.detailY || options.detail || 1;

    var vertices      = [];
    var textureCoords = [];
    var normals       = [];
    var indices       = [];

    for (var y = 0; y <= detailY; y++) {
        var t = y / detailY;
        for (var x = 0; x <= detailX; x++) {
            var s = x / detailX;
            vertices.push(2. * (s - .5), 2 * (t - .5), 0);
            textureCoords.push(s, 1 - t);
            normals.push(0, 0, 1);
            if (x < detailX && y < detailY) {
                var i = x + y * (detailX + 1);
                indices.push(i, i + 1, i + detailX + 1);
                indices.push(i + detailX + 1, i + 1, i + detailX + 2);
            }
        }
    }
    
    return new Geometry({
        buffers: [
            { name: 'pos', data: vertices },
            { name: 'texCoord', data: textureCoords, size: 2 },
            { name: 'normals', data: normals },
            { name: 'indices', data: indices, size: 1 }
        ]
    });
};

module.exports = Plane;
