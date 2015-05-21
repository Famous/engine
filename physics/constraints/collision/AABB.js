/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Axis-aligned bounding box. Used in collision broadphases.
 *
 * @class AABB
 * @param {Particle} body The body around which to track a bounding box.
 */
function AABB(body) {
    this._body = body;
    this._ID = body._ID;
    this.position = null;
    this.vertices = {
        x: [],
        y: [],
        z: []
    };
    this.update();
}

var SPHERE = 1 << 2;
var WALL = 1 << 3;

var DOWN = 0;
var UP = 1;
var LEFT = 2;
var RIGHT = 3;
var FORWARD = 4;
var BACKWARD = 5;

/**
 * Update the bounds to reflect the current orientation and position of the parent Body.
 *
 * @method
 * @return {undefined} undefined
 */
AABB.prototype.update = function() {
    var body = this._body;
    var pos = this.position = body.position;

    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    var type = body.type;
    if (type === SPHERE) {
        maxX = maxY = maxZ = body.radius;
        minX = minY = minZ = -body.radius;
    }
    else if (type === WALL) {
        var d = body.direction;
        maxX = maxY = maxZ = 1e6;
        minX = minY = minZ = -1e6;
        switch (d) {
            case DOWN:
                maxY = 25;
                minY = -1e3;
                break;
            case UP:
                maxY = 1e3;
                minY = -25;
                break;
            case LEFT:
                maxX = 25;
                minX = -1e3;
                break;
            case RIGHT:
                maxX = 1e3;
                minX = -25;
                break;
            case FORWARD:
                maxZ = 25;
                minZ = -1e3;
                break;
            case BACKWARD:
                maxZ = 1e3;
                minZ = -25;
                break;
            default:
                break;
       }
    }
    else if (body.vertices) {
        // ConvexBody
        var bodyVertices = body.vertices;
        for (var i = 0, len = bodyVertices.length; i < len; i++) {
            var vertex = bodyVertices[i];
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.y < minY) minY = vertex.y;
            if (vertex.y > maxY) maxY = vertex.y;
            if (vertex.z < minZ) minZ = vertex.z;
            if (vertex.z > maxZ) maxZ = vertex.z;
        }
    }
    else {
        // Particle
        maxX = maxY = maxZ = 25;
        minX = minY = minZ = -25;
    }
    var vertices = this.vertices;
    vertices.x[0] = minX + pos.x;
    vertices.x[1] = maxX + pos.x;
    vertices.y[0] = minY + pos.y;
    vertices.y[1] = maxY + pos.y;
    vertices.z[0] = minZ + pos.z;
    vertices.z[1] = maxZ + pos.z;
};

/**
 * Check for overlap between two AABB's.
 *
 * @method
 * @param {AABB} aabb1 The first bounding box.
 * @param {AABB} aabb2 The second bounding box.
 * @return {undefined} undefined
 */
AABB.checkOverlap = function(aabb1, aabb2) {
    var vertices1 = aabb1.vertices;
    var vertices2 = aabb2.vertices;

    var x10 = vertices1.x[0];
    var x11 = vertices1.x[1];
    var x20 = vertices2.x[0];
    var x21 = vertices2.x[1];
    if ((x20 <= x10 && x10 <= x21) || (x10 <= x20 && x20 <= x11)) {
        var y10 = vertices1.y[0];
        var y11 = vertices1.y[1];
        var y20 = vertices2.y[0];
        var y21 = vertices2.y[1];
        if ((y20 <= y10 && y10 <= y21) || (y10 <= y20 && y20 <= y11)) {
            var z10 = vertices1.z[0];
            var z11 = vertices1.z[1];
            var z20 = vertices2.z[0];
            var z21 = vertices2.z[1];
            if ((z20 <= z10 && z10 <= z21) || (z10 <= z20 && z20 <= z11)) {
                return true;
            }
        }
    }
    return false;
};

AABB.vertexThreshold = 100;

module.exports = AABB;
