'use strict';

var Geometry = require('../Geometry');

function pickOctant(i) {
    return [(i & 1) * 2 - 1, (i & 2) - 1, (i & 4) / 2 - 1];
}

var boxData = [
    [0, 4, 2, 6, -1, 0, 0], 
    [1, 3, 5, 7, +1, 0, 0],
    [0, 1, 4, 5, 0, -1, 0],
    [2, 6, 3, 7, 0, +1, 0],
    [0, 2, 1, 3, 0, 0, -1],
    [4, 5, 6, 7, 0, 0, +1]
];

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class BoxGeometry
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 * 
 * @return {Object} constructed geometry
 */
function BoxGeometry(options) {
    var options = options || {};

    var vertices      = [];
    var textureCoords = [];
    var normals       = [];
    var indices       = [];

    var data;
    var d;
    var v;
    var i;
    var j;

    for (i = 0; i < boxData.length; i++) {
        data = boxData[i], v = i * 4;
        for (j = 0; j < 4; j++) {
            d = data[j];
            var octant = pickOctant(d);
            vertices.push(octant[0], octant[1], octant[2]);
            textureCoords.push(j & 1, (j & 2) / 2);
            normals.push(data[4], data[5], data[6]);
        }
        indices.push(v, v + 1, v + 2);
        indices.push(v + 2, v + 1, v + 3);
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

module.exports = BoxGeometry;
