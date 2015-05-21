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

var Vec3 = require('../../../math/Vec3');
var ObjectManager = require('../../../utilities/ObjectManager');

ObjectManager.register('GJK_EPASupportPoint', GJK_EPASupportPoint);
var oMRequestGJK_EPASupportPoint = ObjectManager.requestGJK_EPASupportPoint;
var oMRequestDynamicGeometry = ObjectManager.requestDynamicGeometry;
var oMFreeGJK_EPASupportPoint = ObjectManager.freeGJK_EPASupportPoint;
var oMFreeDynamicGeometry = ObjectManager.freeDynamicGeometry;
var oMFreeDynamicGeometryFeature = ObjectManager.freeDynamicGeometryFeature;

var P_REGISTER = new Vec3();
var V0_REGISTER = new Vec3();
var V1_REGISTER = new Vec3();
var V2_REGISTER = new Vec3();

var DIRECTION_REGISTER = new Vec3();
var INVDIRECTION_REGISTER = new Vec3();

/**
 * Support point to be added to the DynamicGeometry. The point in Minkowski space as well as the
 * original pair.
 *
 * @class GJK_EPASupportPoint
 * @param {Vec3} vertex The point in Minkowski space.
 * @param {Vec3} worldVertexA The one vertex.
 * @param {Vec3} worldVertexB The other vertex.
 */
function GJK_EPASupportPoint(vertex, worldVertexA, worldVertexB) {
    this.vertex = vertex;
    this.worldVertexA = worldVertexA;
    this.worldVertexB = worldVertexB;
}

/**
 * Used by ObjectManager to reset the object with different data.
 *
 * @method
 * @param {Vec3} vertex The point in Minkowski space.
 * @param {Vec3} worldVertexA The one vertex.
 * @param {Vec3} worldVertexB The other vertex.
 * @return {GJK_EPASupportPoint} this
 */
GJK_EPASupportPoint.prototype.reset = function reset(vertex, worldVertexA, worldVertexB) {
    this.vertex = vertex;
    this.worldVertexA = worldVertexA;
    this.worldVertexB = worldVertexB;

    return this;
};

/**
 * Free the DynamicGeomtetry and associate vertices and features for later reuse.
 *
 * @method
 * @param {DynamicGeometry} geometry The geometry to release to the pool.
 * @return {undefined} undefined
 */
function freeGJK_EPADynamicGeometry(geometry) {
    var vertices = geometry.vertices;
    var i;
    i = vertices.length;
    while (i--) {
        var v = vertices.pop();
        if (v !== null) oMFreeGJK_EPASupportPoint(v);
    }
    geometry.numVertices = 0;
    var features = geometry.features;
    i = features.length;
    while (i--) {
        var f = features.pop();
        if (f !== null) oMFreeDynamicGeometryFeature(f);
    }
    geometry.numFeatures = 0;
    oMFreeDynamicGeometry(geometry);
}

/**
 * Find the point in Minkowski space furthest in a given direction for two convex Bodies.
 *
 * @method
 * @param {Particle} body1 The one body.
 * @param {Particle} body2 The other body.
 * @param {Vec3} direction The search direction.
 * @return {GJK_EPASupportPoint} The result.
 */
function minkowskiSupport(body1, body2, direction) {
    var inverseDirection = Vec3.scale(direction, -1, INVDIRECTION_REGISTER);

    var w1 = Vec3.add(body1.support(direction), body1.position, new Vec3());
    var w2 = Vec3.add(body2.support(inverseDirection), body2.position, new Vec3());

    // The vertex in Minkowski space as well as the original pair in world space
    return oMRequestGJK_EPASupportPoint().reset(Vec3.subtract(w1, w2, new Vec3()), w1, w2);
}

/**
 * Gilbert-Johnson-Keerthi collision detection. Returns a DynamicGeometry simplex if the bodies are found
 * to have collided, or false for no collsion.
 *
 * @method
 * @param {Particle} body1 The one body.
 * @param {Particle} body2 The other body.
 * @return {DynamicGeometry|Boolean} Result of the GJK query.
 */
function gjk(body1, body2) {
    var support = minkowskiSupport;
    // Use p2 - p1 to seed the initial choice of direction
    var direction = Vec3.subtract(body2.position, body1.position, DIRECTION_REGISTER).normalize();
    var simplex = oMRequestDynamicGeometry();
    simplex.addVertex(support(body1, body2, direction));
    direction.invert();

    var i = 0;
    var maxIterations = 1e3;
    while(i++ < maxIterations) {
        if (direction.x === 0 && direction.y === 0 && direction.z === 0) break;
        simplex.addVertex(support(body1, body2, direction));
        if (Vec3.dot(simplex.getLastVertex().vertex, direction) < 0) break;
        // If simplex contains origin, return for use in EPA
        if (simplex.simplexContainsOrigin(direction, oMFreeGJK_EPASupportPoint)) return simplex;
    }
    freeGJK_EPADynamicGeometry(simplex);
    return false;
}

/**
 * Expanding Polytope Algorithm--penetration depth, collision normal, and contact points.
 * Returns a CollisonData object.
 *
 * @method
 * @param {Body} body1 The one body.
 * @param {Body} body2 The other body.
 * @param {DynamicGeometry} polytope The seed simplex from GJK.
 * @return {CollisionData} The collision data.
 */
function epa(body1, body2, polytope) {
    var support = minkowskiSupport;
    var depthEstimate = Infinity;

    var i = 0;
    var maxIterations = 1e3;
    while(i++ < maxIterations) {
        var closest = polytope.getFeatureClosestToOrigin();
        if (closest === null) return null;
        var direction = closest.normal;
        var point = support(body1, body2, direction);
        depthEstimate = Math.min(depthEstimate, Vec3.dot(point.vertex, direction));
        if (depthEstimate - closest.distance <= 0.01) {
            var supportA = polytope.vertices[closest.vertexIndices[0]];
            var supportB = polytope.vertices[closest.vertexIndices[1]];
            var supportC = polytope.vertices[closest.vertexIndices[2]];

            var A = supportA.vertex;
            var B = supportB.vertex;
            var C = supportC.vertex;
            var P = Vec3.scale(direction, closest.distance, P_REGISTER);

            var V0 = Vec3.subtract(B, A, V0_REGISTER);
            var V1 = Vec3.subtract(C, A, V1_REGISTER);
            var V2 = Vec3.subtract(P, A, V2_REGISTER);

            var d00 = Vec3.dot(V0, V0);
            var d01 = Vec3.dot(V0, V1);
            var d11 = Vec3.dot(V1, V1);
            var d20 = Vec3.dot(V2, V0);
            var d21 = Vec3.dot(V2, V1);
            var denom = d00*d11 - d01*d01;

            var v = (d11*d20 - d01*d21) / denom;
            var w = (d00*d21 - d01*d20) / denom;
            var u = 1.0 - v - w;

            var body1Contact =      supportA.worldVertexA.scale(u)
                               .add(supportB.worldVertexA.scale(v))
                               .add(supportC.worldVertexA.scale(w));

            var body2Contact =      supportA.worldVertexB.scale(u)
                               .add(supportB.worldVertexB.scale(v))
                               .add(supportC.worldVertexB.scale(w));

            var localBody1Contact = Vec3.subtract(body1Contact, body1.position, new Vec3());
            var localBody2Contact = Vec3.subtract(body2Contact, body2.position, new Vec3());

            freeGJK_EPADynamicGeometry(polytope);
            oMFreeGJK_EPASupportPoint(point);

            return ObjectManager.requestCollisionData().reset(closest.distance, direction, body1Contact, body2Contact, localBody1Contact, localBody2Contact);
        }
        else {
            polytope.addVertex(point);
            polytope.reshape();
        }
    }
    throw new Error('EPA failed to terminate in allotted iterations.');
}

module.exports.gjk = gjk;
module.exports.epa = epa;
