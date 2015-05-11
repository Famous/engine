'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class ParametricSphere
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
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
            { name: 'normals', data: GeometryHelper.getSpheroidNormals(buffers.vertices) },
            { name: 'indices', data: buffers.indices, size: 1 }
        ]
    });
}

/**
 * Function used in iterative construction of parametric primitive.
 *
 * @static
 * @method generator
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @return {Array} x, y and z coordinates of geometry
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
