'use strict';

var Vec3 = require('famous-math').Vec3;
var ObjectManager = require('famous-utilities').ObjectManager;

ObjectManager.register('GJK_EPASupportPoint', GJK_EPASupportPoint);
var OMRequestGJK_EPASupportPoint = ObjectManager.requestGJK_EPASupportPoint;
var OMRequestDynamicGeometry = ObjectManager.requestDynamicGeometry;
var OMFreeGJK_EPASupportPoint = ObjectManager.freeGJK_EPASupportPoint;
var OMFreeDynamicGeometry = ObjectManager.freeDynamicGeometry;
var OMFreeDynamicGeometryFeature = ObjectManager.freeDynamicGeometryFeature;

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
 * @param {Vec3} vertex
 * @param {Vec3} worldVertexA
 * @param {Vec3} worldVertexAB
 */
function GJK_EPASupportPoint(vertex, worldVertexA, worldVertexB) {
    this.vertex = vertex;
    this.worldVertexA = worldVertexA;
    this.worldVertexB = worldVertexB;
}

/**
 * Used by ObjectManager to reset the object with different data.
 *
 * @method reset
 * @param {Object[]} args
 * @chainable
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
 * @method freeGJK_EPADynamicGeometry
 * @param {DynamicGeometry} geometry
 */
function freeGJK_EPADynamicGeometry(geometry) {
    var vertices = geometry.vertices;
    var i;
    i = vertices.length;
    while (i--) {
        var v = vertices.pop();
        if (v !== null) OMFreeGJK_EPASupportPoint(v);
    }
    geometry.numVertices = 0;
    var features = geometry.features;
    i = features.length;
    while (i--) {
        var f = features.pop();
        if (f !== null) OMFreeDynamicGeometryFeature(f);
    }
    geometry.numFeatures = 0;
    OMFreeDynamicGeometry(geometry);
}

/**
 * Find the point in Minkowski space furthest in a given direction for two convex Bodies.
 *
 * @method minkowskiSupport
 * @param {Body} body1
 * @param {Body} body2
 * @param {Vec3} direction
 * @return {GJK_EPASupportPoint}
 */
function minkowskiSupport(body1, body2, direction) {
    var inverseDirection = Vec3.scale(direction, -1, INVDIRECTION_REGISTER);

    var w1 = Vec3.add(body1.support(direction), body1.position, new Vec3());
    var w2 = Vec3.add(body2.support(inverseDirection), body2.position, new Vec3());

    // The vertex in Minkowski space as well as the original pair in world space
    return OMRequestGJK_EPASupportPoint().reset(Vec3.subtract(w1, w2, new Vec3()), w1, w2);
}

/**
 * Gilbert-Johnson-Keerthi collision detection. Returns a DynamicGeometry simplex if the bodies are found
 * to have collided or false for no collsion.
 *
 * @method GJK
 * param {Body} body1
 * param {Body} body2
 * @return {DynamicGeometry | Boolean}
 */
function GJK(body1, body2) {
    var support = minkowskiSupport;
    // Use p2 - p1 to seed the initial choice of direction
    var direction = Vec3.subtract(body2.position, body1.position, DIRECTION_REGISTER).normalize();
    var simplex = OMRequestDynamicGeometry();
    simplex.addVertex(support(body1, body2, direction));
    direction.invert();

    var i = 0;
    var maxIterations = 1e3;
    while(i++ < maxIterations) {
        if (direction.x === 0 && direction.y === 0 && direction.z === 0) break;
        simplex.addVertex(support(body1, body2, direction));
        if (Vec3.dot(simplex.getLastVertex().vertex, direction) < 0) break;
        // If simplex contains origin, return for use in EPA
        if (simplex.simplexContainsOrigin(direction, OMFreeGJK_EPASupportPoint)) return simplex;
    }
    freeGJK_EPADynamicGeometry(simplex);
    return false;
}

/**
 * Expanding Polytope Algorithm--penetration depth, collision normal, and contact points.
 * Returns a CollisonData object.
 *
 * @method EPA
 * @param {Body} body1
 * @param {Body} body2
 * @param {DynamicGeometry} polytope
 * @return {CollisionData}
 */
function EPA(body1, body2, polytope) {
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
            OMFreeGJK_EPASupportPoint(point);

            return ObjectManager.requestCollisionData().reset(closest.distance, direction, body1Contact, body2Contact, localBody1Contact, localBody2Contact);
        } else {
            polytope.addVertex(point);
            polytope.reshape();
        }
    }
    throw new Error('EPA failed to terminate in allotted iterations.');
}

module.exports.GJK = GJK;
module.exports.EPA = EPA;
