'use strict';

var Geometry       = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class Cylinder
 * @constructor
 * 
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Cylinder (options) {
    var options  = options || {};
    var radius   = options.radius || 1;
    var detail   = options.detail || 15;
    var buffers;

    buffers = GeometryHelper.generateParametric(
        1,
        detail,
        Cylinder.generator.bind(null, radius)
    );

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
 * Function used in iterative construction of parametric primitive.
 *
 * @static
 * @method generator
 * @param {Number} r Cylinder radius.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 *
 * @return {Array} x, y and z coordinate of geometry.
 */
Cylinder.generator = function generator(r, u, v, pos) {
    pos[0] = r * Math.cos(v);
    pos[1] = r * (-1 + u / Math.PI * 2);
    pos[2] = r * Math.sin(v);
}

module.exports = Cylinder;
