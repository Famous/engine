'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class ParametricSphere
 * @constructor
 *
 * @param {Object} options that can alter the values
 * and amount of vertex buffers
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
          ParametricSphere.generator
    );

    GeometryHelper.getUniqueFaces(buffers.vertices, buffers.indices);

    return new Geometry({
        buffers: [
            { name: 'pos', data: buffers.vertices },
            { name: 'texCoord', data: GeometryHelper.getSpheroidUV(buffers.vertices), size: 2 },
            { name: 'normals', data: GeometryHelper.computeNormals(buffers.vertices, buffers.indices) },
            { name: 'indices', data: buffers.indices, size: 1 }
        ]
    });
}

/**
 * function used in iterative construction of parametric primitive.
 *
 * @static
 * @method generator
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @return {Array} x, y and z coordinate of geometry
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
