'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class ParametricCone
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 * 
 * @return {Object} constructed geometry
 */
function ParametricCone (options) {
    var options  = options || {};
    var detail   = options.detail || 15;
    var radius   = options.radius || 1 / Math.PI;

    var buffers = GeometryHelper.generateParametric(
        detail,
        detail,
        ParametricCone.generator.bind(null, radius)
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
 * function used in iterative construction of parametric primitive.
 *
 * @static
 * @method generator
 * @param {Number} r Cone Radius.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @return {Array} x, y and z coordinate of geometry.
 */

ParametricCone.generator = function generator(r, u, v, pos) {
    pos[0] = r * u * Math.sin(v);
    pos[1] = -r * u * Math.cos(v);
    pos[2] = -u;
}

module.exports = ParametricCone;
