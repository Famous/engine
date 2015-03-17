'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Torus
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 * 
 * @return {Object} constructed geometry
 */

function Torus(options) {
    var options  = options || {};
    var detail   = options.detail || 30;
    var holeRadius = options.holeRadius || 0.80;
    var tubeRadius = options.tubeRadius || 0.20;

    var buffers = GeometryHelper.generateParametric(
        detail,
        detail,
        Torus.generator.bind(null, holeRadius, tubeRadius)
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
 * @param {Number} c Radius of inner hole.
 * @param {Number} a Radius of tube.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @return {Array} x, y and z coordinate of the vertex.
 */
Torus.generator = function generator(c, a, u, v, pos) {
    pos[0] = (c + a * Math.cos(2 * v)) * Math.sin(2 * u);
    pos[1] = -(c + a * Math.cos(2 * v)) * Math.cos(2 * u);
    pos[2] = a * Math.sin(2 * v);
}

module.exports = Torus;
