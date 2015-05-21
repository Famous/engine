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

var Vec3 = require('../math/Vec3');
var Mat33 = require('../math/Mat33');

var ObjectManager = require('../utilities/ObjectManager');
ObjectManager.register('DynamicGeometry', DynamicGeometry);
ObjectManager.register('DynamicGeometryFeature', DynamicGeometryFeature);
var oMRequestDynamicGeometryFeature = ObjectManager.requestDynamicGeometryFeature;
var oMFreeDynamicGeometryFeature = ObjectManager.freeDynamicGeometryFeature;

var TRIPLE_REGISTER = new Vec3();

/**
 * The so called triple product. Used to find a vector perpendicular to (v2 - v1) in the direction of v3.
 * (v1 x v2) x v3.
 *
 * @method
 * @private
 * @param {Vec3} v1 The first Vec3.
 * @param {Vec3} v2 The second Vec3.
 * @param {Vec3} v3 The third Vec3.
 * @return {Vec3} The result of the triple product.
 */
function tripleProduct(v1, v2, v3) {
    var v = TRIPLE_REGISTER;

    Vec3.cross(v1, v2, v);
    Vec3.cross(v, v3, v);

    return v;
}

/**
 * Of a set of vertices, retrieves the vertex furthest in the given direction.
 *
 * @method
 * @private
 * @param {Vec3[]} vertices The reference set of Vec3's.
 * @param {Vec3} direction The direction to compare against.
 * @return {Object} The vertex and its index in the vertex array.
 */
function _hullSupport(vertices, direction) {
    var furthest;
    var max = -Infinity;
    var dot;
    var vertex;
    var index;
    for (var i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        dot = Vec3.dot(vertex, direction);
        if (dot > max) {
            furthest = vertex;
            max = dot;
            index = i;
        }
    }

    return {
        vertex: furthest,
        index: index
    };
}

var VEC_REGISTER = new Vec3();
var POINTCHECK_REGISTER = new Vec3();
var AO_REGISTER = new Vec3();
var AB_REGISTER = new Vec3();
var AC_REGISTER = new Vec3();
var AD_REGISTER = new Vec3();
var BC_REGISTER = new Vec3();
var BD_REGISTER = new Vec3();

/**
 * Used internally to represent polyhedral facet information.
 *
 * @class DynamicGeometryFeature
 * @param {Number} distance The distance of the feature from the origin.
 * @param {Vec3} normal The Vec3 orthogonal to the feature, pointing out of the geometry.
 * @param {Number[]} vertexIndices The indices of the vertices which compose the feature.
 */
function DynamicGeometryFeature(distance, normal, vertexIndices) {
    this.distance = distance;
    this.normal = normal;
    this.vertexIndices = vertexIndices;
}

/**
 * Used by ObjectManager to reset objects.
 *
 * @method
 * @param {Number} distance Distance from the origin.
 * @param {Vec3} normal Vec3 normal to the feature.
 * @param {Number[]} vertexIndices Indices of the vertices which compose the feature.
 * @return {DynamicGeometryFeature} this
 */
DynamicGeometryFeature.prototype.reset = function(distance, normal, vertexIndices) {
    this.distance = distance;
    this.normal = normal;
    this.vertexIndices = vertexIndices;

    return this;
};

/**
 * Abstract object representing a growing polyhedron. Used in ConvexHull and in GJK+EPA collision detection.
 *
 * @class DynamicGeometry
 */
function DynamicGeometry() {
    this.vertices = [];
    this.numVertices = 0;
    this.features = [];
    this.numFeatures = 0;
    this.lastVertexIndex = 0;

    this._IDPool = {
        vertices: [],
        features: []
    };
}

/**
 * Used by ObjectManager to reset objects.
 *
 * @method
 * @return {DynamicGeometry} this
 */
DynamicGeometry.prototype.reset = function reset() {
    this.vertices = [];
    this.numVertices = 0;
    this.features = [];
    this.numFeatures = 0;
    this.lastVertexIndex = 0;

    this._IDPool = {
        vertices: [],
        features: []
    };

    return this;
};

/**
 * Add a vertex to the polyhedron.
 *
 * @method
 * @param {Object} vertexObj Object returned by the support function.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.addVertex = function(vertexObj) {
    var index = this._IDPool.vertices.length ? this._IDPool.vertices.pop() : this.vertices.length;
    this.vertices[index] = vertexObj;
    this.lastVertexIndex = index;
    this.numVertices++;
};

/**
 * Remove a vertex and push its location in the vertex array to the IDPool for later use.
 *
 * @method
 * @param {Number} index Index of the vertex to remove.
 * @return {Object} vertex The vertex object.
 */
DynamicGeometry.prototype.removeVertex = function(index) {
    var vertex = this.vertices[index];
    this.vertices[index] = null;
    this._IDPool.vertices.push(index);
    this.numVertices--;

    return vertex;
};

/**
 * Add a feature (facet) to the polyhedron. Used internally in the reshaping process.
 *
 * @method
 * @param {Number} distance The distance of the feature from the origin.
 * @param {Vec3} normal The facet normal.
 * @param {Number[]} vertexIndices The indices of the vertices which compose the feature.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.addFeature = function(distance, normal, vertexIndices) {
    var index = this._IDPool.features.length ? this._IDPool.features.pop() : this.features.length;
    this.features[index] = oMRequestDynamicGeometryFeature().reset(distance, normal, vertexIndices);
    this.numFeatures++;
};

/**
 * Remove a feature and push its location in the feature array to the IDPool for later use.
 *
 * @method
 * @param {Number} index Index of the feature to remove.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.removeFeature = function(index) {
    var feature = this.features[index];
    this.features[index] = null;
    this._IDPool.features.push(index);
    this.numFeatures--;

    oMFreeDynamicGeometryFeature(feature);
};

/**
 * Retrieve the last vertex object added to the geometry.
 *
 * @method
 * @return {Object} The last vertex added.
 */
DynamicGeometry.prototype.getLastVertex = function() {
    return this.vertices[this.lastVertexIndex];
};

/**
 * Return the feature closest to the origin.
 *
 * @method
 * @return {DynamicGeometryFeature} The closest feature.
 */
DynamicGeometry.prototype.getFeatureClosestToOrigin = function() {
    var min = Infinity;
    var closest = null;
    var features = this.features;
    for (var i = 0, len = features.length; i < len; i++) {
        var feature = features[i];
        if (!feature) continue;
        if (feature.distance < min) {
            min = feature.distance;
            closest = feature;
        }
    }
    return closest;
};

/**
 * Adds edge if not already on the frontier, removes if the edge or its reverse are on the frontier.
 * Used when reshaping DynamicGeometry's.
 *
 * @method
 * @private
 * @param {Object[]} vertices Vec3 reference array.
 * @param {Array.<Number[]>} frontier Current edges potentially separating the features to remove from the persistant shape.
 * @param {Number} start The index of the starting Vec3 on the edge.
 * @param {Number} end The index of the culminating Vec3.
 * @return {undefined} undefined
 */
function _validateEdge(vertices, frontier, start, end) {
    var e0 = vertices[start].vertex;
    var e1 = vertices[end].vertex;
    for (var i = 0, len = frontier.length; i < len; i++) {
        var edge = frontier[i];
        if (!edge) continue;
        var v0 = vertices[edge[0]].vertex;
        var v1 = vertices[edge[1]].vertex;
        if ((e0 === v0 && (e1 === v1)) || (e0 === v1 && (e1 === v0))) {
            frontier[i] = null;
            return;
        }
    }
    frontier.push([start, end]);
}

/**
 * Based on the last (exterior) point added to the polyhedron, removes features as necessary and redetermines
 * its (convex) shape to include the new point by adding triangle features. Uses referencePoint, a point on the shape's
 * interior, to ensure feature normals point outward, else takes referencePoint to be the origin.
 *
 * @method
 * @param {Vec3} referencePoint Point known to be in the interior, used to orient feature normals.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.reshape = function(referencePoint) {
    var vertices = this.vertices;
    var point = this.getLastVertex().vertex;
    var features = this.features;
    var vertexOnFeature;
    var featureVertices;

    var i, j, len;

    // The removal of features creates a hole in the polyhedron -- frontierEdges maintains the edges
    // of this hole, each of which will form one edge of a new feature to be created
    var frontierEdges = [];

    for (i = 0, len = features.length; i < len; i++) {
        if (!features[i]) continue;
        featureVertices = features[i].vertexIndices;
        vertexOnFeature = vertices[featureVertices[0]].vertex;
        // If point is 'above' the feature, remove that feature, and check to add its edges to the frontier.
        if (Vec3.dot(features[i].normal, Vec3.subtract(point, vertexOnFeature, POINTCHECK_REGISTER)) > -0.001) {
            _validateEdge(vertices, frontierEdges, featureVertices[0], featureVertices[1]);
            _validateEdge(vertices, frontierEdges, featureVertices[1], featureVertices[2]);
            _validateEdge(vertices, frontierEdges, featureVertices[2], featureVertices[0]);
            this.removeFeature(i);
        }
    }

    var A = point;
    var a = this.lastVertexIndex;
    for (j = 0, len = frontierEdges.length; j < len; j++) {
        if (!frontierEdges[j]) continue;
        var b = frontierEdges[j][0];
        var c = frontierEdges[j][1];
        var B = vertices[b].vertex;
        var C = vertices[c].vertex;

        var AB = Vec3.subtract(B, A, AB_REGISTER);
        var AC = Vec3.subtract(C, A, AC_REGISTER);
        var ABC = Vec3.cross(AB, AC, new Vec3());
        ABC.normalize();

        if (!referencePoint) {
            var distance = Vec3.dot(ABC, A);
            if (distance < 0) {
                ABC.invert();
                distance *= -1;
            }
            this.addFeature(distance, ABC, [a, b, c]);
        }
        else {
            var reference = Vec3.subtract(referencePoint, A, VEC_REGISTER);
            if (Vec3.dot(ABC, reference) > -0.001) ABC.invert();
            this.addFeature(null, ABC, [a, b, c]);
        }
    }
};

/**
 * Checks if the Simplex instance contains the origin, returns true or false.
 * If false, removes a point and, as a side effect, changes input direction to be both
 * orthogonal to the current working simplex and point toward the origin.
 * Calls callback on the removed point.
 *
 * @method
 * @param {Vec3} direction Vector used to store the new search direction.
 * @param {Function} callback Function invoked with the removed vertex, used e.g. to free the vertex object
 * in the object manager.
 * @return {Boolean} The result of the containment check.
 */
DynamicGeometry.prototype.simplexContainsOrigin = function(direction, callback) {
    var numVertices = this.vertices.length;

    var a = this.lastVertexIndex;
    var b = a - 1;
    var c = a - 2;
    var d = a - 3;

    b = b < 0 ? b + numVertices : b;
    c = c < 0 ? c + numVertices : c;
    d = d < 0 ? d + numVertices : d;

    var A = this.vertices[a].vertex;
    var B = this.vertices[b].vertex;
    var C = this.vertices[c].vertex;
    var D = this.vertices[d].vertex;

    var AO = Vec3.scale(A, -1, AO_REGISTER);
    var AB = Vec3.subtract(B, A, AB_REGISTER);
    var AC, AD, BC, BD;
    var ABC, ACD, ABD, BCD;
    var distanceABC, distanceACD, distanceABD, distanceBCD;

    var vertexToRemove;

    if (numVertices === 4) {
        // Tetrahedron
        AC = Vec3.subtract(C, A, AC_REGISTER);
        AD = Vec3.subtract(D, A, AD_REGISTER);

        ABC = Vec3.cross(AB, AC, new Vec3());
        ACD = Vec3.cross(AC, AD, new Vec3());
        ABD = Vec3.cross(AB, AD, new Vec3());
        ABC.normalize();
        ACD.normalize();
        ABD.normalize();
        if (Vec3.dot(ABC, AD) > 0) ABC.invert();
        if (Vec3.dot(ACD, AB) > 0) ACD.invert();
        if (Vec3.dot(ABD, AC) > 0) ABD.invert();
        // Don't need to check BCD because we would have just checked that in the previous iteration
        // -- we added A to the BCD triangle because A was in the direction of the origin.

        distanceABC = Vec3.dot(ABC, AO);
        distanceACD = Vec3.dot(ACD, AO);
        distanceABD = Vec3.dot(ABD, AO);

        // Norms point away from origin -> origin is inside tetrahedron
        if (distanceABC < 0.001 && distanceABD < 0.001 && distanceACD < 0.001) {
            BC = Vec3.subtract(C, B, BC_REGISTER);
            BD = Vec3.subtract(D, B, BD_REGISTER);
            BCD = Vec3.cross(BC, BD, new Vec3());
            BCD.normalize();
            if (Vec3.dot(BCD, AB) <= 0) BCD.invert();
            distanceBCD = -1 * Vec3.dot(BCD,B);
            // Prep features for EPA
            this.addFeature(-distanceABC, ABC, [a,b,c]);
            this.addFeature(-distanceACD, ACD, [a,c,d]);
            this.addFeature(-distanceABD, ABD, [a,d,b]);
            this.addFeature(-distanceBCD, BCD, [b,c,d]);
            return true;
        }
        else if (distanceABC >= 0.001) {
            vertexToRemove = this.removeVertex(d);
            direction.copy(ABC);
        }
        else if (distanceACD >= 0.001) {
            vertexToRemove = this.removeVertex(b);
            direction.copy(ACD);
        }
        else {
            vertexToRemove = this.removeVertex(c);
            direction.copy(ABD);
        }
    }
    else if (numVertices === 3) {
        // Triangle
        AC = Vec3.subtract(C, A, AC_REGISTER);
        Vec3.cross(AB, AC, direction);
        if (Vec3.dot(direction, AO) <= 0) direction.invert();
    }
    else {
        // Line
        direction.copy(tripleProduct(AB, AO, AB));
    }
    if (vertexToRemove && callback) callback(vertexToRemove);
    return false;
};

/**
 * Given an array of Vec3's, computes the convex hull. Used in constructing bodies in the physics system and to
 * create custom GL meshes.
 *
 * @class ConvexHull
 * @param {Vec3[]} vertices Cloud of vertices of which the enclosing convex hull is desired.
 * @param {Number} iterations Maximum number of vertices to compose the convex hull.
 */
function ConvexHull(vertices, iterations) {
    iterations = iterations || 1e3;
    var hull = _computeConvexHull(vertices, iterations);

    var i, len;

    var indices = [];
    for (i = 0, len = hull.features.length; i < len; i++) {
        var f = hull.features[i];
        if (f) indices.push(f.vertexIndices);
    }

    var polyhedralProperties = _computePolyhedralProperties(hull.vertices, indices);
    var centroid = polyhedralProperties.centroid;

    var worldVertices = [];
    for (i = 0, len = hull.vertices.length; i < len; i++) {
        worldVertices.push(Vec3.subtract(hull.vertices[i].vertex, centroid, new Vec3()));
    }

    var normals = [];
    for (i = 0, len = worldVertices.length; i < len; i++) {
        normals.push(Vec3.normalize(worldVertices[i], new Vec3()));
    }

    var graph = {};
    var _neighborMatrix = {};
    for (i = 0; i < indices.length; i++) {
        var a = indices[i][0];
        var b = indices[i][1];
        var c = indices[i][2];

        _neighborMatrix[a] = _neighborMatrix[a] || {};
        _neighborMatrix[b] = _neighborMatrix[b] || {};
        _neighborMatrix[c] = _neighborMatrix[c] || {};

        graph[a] = graph[a] || [];
        graph[b] = graph[b] || [];
        graph[c] = graph[c] || [];

        if (!_neighborMatrix[a][b]) {
            _neighborMatrix[a][b] = 1;
            graph[a].push(b);
        }
        if (!_neighborMatrix[a][c]) {
            _neighborMatrix[a][c] = 1;
            graph[a].push(c);
        }
        if (!_neighborMatrix[b][a]) {
            _neighborMatrix[b][a] = 1;
            graph[b].push(a);
        }
        if (!_neighborMatrix[b][c]) {
            _neighborMatrix[b][c] = 1;
            graph[b].push(c);
        }
        if (!_neighborMatrix[c][a]) {
            _neighborMatrix[c][a] = 1;
            graph[c].push(a);
        }
        if (!_neighborMatrix[c][b]) {
            _neighborMatrix[c][b] = 1;
            graph[c].push(b);
        }
    }

    this.indices = indices;
    this.vertices = worldVertices;
    this.normals = normals;
    this.polyhedralProperties = polyhedralProperties;
    this.graph = graph;
}

/**
 * Performs the actual computation of the convex hull.
 *
 * @method
 * @private
 * @param {Vec3[]} vertices Cloud of vertices of which the enclosing convex hull is desired.
 * @param {Number} maxIterations Maximum number of vertices to compose the convex hull.
 * @return {DynamicGeometry} The computed hull.
 */
function _computeConvexHull(vertices, maxIterations) {
    var hull = new DynamicGeometry();

    hull.addVertex(_hullSupport(vertices, new Vec3(1, 0, 0)));
    hull.addVertex(_hullSupport(vertices, new Vec3(-1, 0, 0)));
    var A = hull.vertices[0].vertex;
    var B = hull.vertices[1].vertex;
    var AB = Vec3.subtract(B, A, AB_REGISTER);

    var dot;
    var vertex;
    var furthest;
    var index;
    var i, len;

    var max = -Infinity;
    for (i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        if (vertex === A || vertex === B) continue;
        var AV = Vec3.subtract(vertex, A, VEC_REGISTER);
        dot = Vec3.dot(AV, tripleProduct(AB, AV, AB));
        dot = dot < 0 ? dot * -1 : dot;
        if (dot > max) {
            max = dot;
            furthest = vertex;
            index = i;
        }
    }
    hull.addVertex({
        vertex: furthest,
        index: index
    });

    var C = furthest;
    var AC = Vec3.subtract(C, A, AC_REGISTER);
    var ABC = Vec3.cross(AB, AC, new Vec3());
    ABC.normalize();

    max = -Infinity;
    for (i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        if (vertex === A || vertex === B || vertex === C) continue;
        dot = Vec3.dot(Vec3.subtract(vertex, A, VEC_REGISTER), ABC);
        dot = dot < 0 ? dot * -1 : dot;
        if (dot > max) {
            max = dot;
            furthest = vertex;
            index = i;
        }
    }
    hull.addVertex({
        vertex: furthest,
        index: index
    });

    var D = furthest;
    var AD = Vec3.subtract(D, A, AD_REGISTER);
    var BC = Vec3.subtract(C, B, BC_REGISTER);
    var BD = Vec3.subtract(D, B, BD_REGISTER);

    var ACD = Vec3.cross(AC, AD, new Vec3());
    var ABD = Vec3.cross(AB, AD, new Vec3());
    var BCD = Vec3.cross(BC, BD, new Vec3());
    ACD.normalize();
    ABD.normalize();
    BCD.normalize();
    if (Vec3.dot(ABC, AD) > 0) ABC.invert();
    if (Vec3.dot(ACD, AB) > 0) ACD.invert();
    if (Vec3.dot(ABD, AC) > 0) ABD.invert();
    if (Vec3.dot(BCD, AB) < 0) BCD.invert();

    var a = 0;
    var b = 1;
    var c = 2;
    var d = 3;

    hull.addFeature(null, ABC, [a, b, c]);
    hull.addFeature(null, ACD, [a, c, d]);
    hull.addFeature(null, ABD, [a, b, d]);
    hull.addFeature(null, BCD, [b, c, d]);

    var assigned = {};
    for (i = 0, len = hull.vertices.length; i < len; i++) {
       assigned[hull.vertices[i].index] = true;
    }

    var cx = A.x + B.x + C.x + D.x;
    var cy = A.y + B.y + C.y + D.y;
    var cz = A.z + B.z + C.z + D.z;
    var referencePoint = new Vec3(cx, cy, cz);
    referencePoint.scale(0.25);

    var features = hull.features;
    var iteration = 0;
    while (iteration++ < maxIterations) {
        var currentFeature = null;
        for (i = 0, len = features.length; i < len; i++) {
            if (!features[i] || features[i].done) continue;
            currentFeature = features[i];
            furthest = null;
            index = null;
            A = hull.vertices[currentFeature.vertexIndices[0]].vertex;
            var s = _hullSupport(vertices, currentFeature.normal);
            furthest = s.vertex;
            index = s.index;
            var dist = Vec3.dot(Vec3.subtract(furthest, A, VEC_REGISTER), currentFeature.normal);

            if (dist < 0.001 || assigned[index]) {
                currentFeature.done = true;
                continue;
            }

            assigned[index] = true;
            hull.addVertex(s);
            hull.reshape(referencePoint);
        }
            // No feature has points 'above' it -> finished
        if (currentFeature === null) break;
    }

    return hull;
}

/**
 * Helper function used in _computePolyhedralProperties.
 * Sets f0 - f2 and g0 - g2 depending on w0 - w2.
 *
 * @method
 * @private
 * @param {Number} w0 Reference x coordinate.
 * @param {Number} w1 Reference y coordinate.
 * @param {Number} w2 Reference z coordinate.
 * @param {Number[]} f One of two output registers to contain the result of the calculation.
 * @param {Number[]} g One of two output registers to contain the result of the calculation.
 * @return {undefined} undefined
 */
function _subexpressions(w0, w1, w2, f, g) {
    var t0 = w0 + w1;
    f[0] = t0 + w2;
    var t1 = w0 * w0;
    var t2 = t1 + w1 * t0;
    f[1] = t2 + w2 * f[0];
    f[2] = w0 * t1 + w1 * t2 + w2 * f[1];
    g[0] = f[1] + w0 * (f[0] + w0);
    g[1] = f[1] + w1 * (f[0] + w1);
    g[2] = f[1] + w2 * (f[0] + w2);
}

/**
 * Determines various properties of the volume.
 *
 * @method
 * @private
 * @param {Vec3[]} vertices The vertices of the polyhedron.
 * @param {Array.<Number[]>} indices Array of arrays of indices of vertices composing the triangular features of the polyhedron,
 * one array for each feature.
 * @return {Object} Object holding the calculated span, volume, center, and euler tensor.
 */
function _computePolyhedralProperties(vertices, indices) {
    // Order: 1, x, y, z, x^2, y^2, z^2, xy, yz, zx
    var integrals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var fx = [];
    var fy = [];
    var fz = [];
    var gx = [];
    var gy = [];
    var gz = [];

    var i, len;

    for (i = 0, len = indices.length; i < len; i++) {
        var A = vertices[indices[i][0]].vertex;
        var B = vertices[indices[i][1]].vertex;
        var C = vertices[indices[i][2]].vertex;
        var AB = Vec3.subtract(B, A, AB_REGISTER);
        var AC = Vec3.subtract(C, A, AC_REGISTER);
        var ABC = AB.cross(AC);
        if (Vec3.dot(A, ABC) < 0) ABC.invert();

        var d0 = ABC.x;
        var d1 = ABC.y;
        var d2 = ABC.z;

        var x0 = A.x;
        var y0 = A.y;
        var z0 = A.z;
        var x1 = B.x;
        var y1 = B.y;
        var z1 = B.z;
        var x2 = C.x;
        var y2 = C.y;
        var z2 = C.z;

        _subexpressions(x0, x1, x2, fx, gx);
        _subexpressions(y0, y1, y2, fy, gy);
        _subexpressions(z0, z1, z2, fz, gz);

        integrals[0] += d0 * fx[0];
        integrals[1] += d0 * fx[1];
        integrals[2] += d1 * fy[1];
        integrals[3] += d2 * fz[1];
        integrals[4] += d0 * fx[2];
        integrals[5] += d1 * fy[2];
        integrals[6] += d2 * fz[2];
        integrals[7] += d0 * (y0 * gx[0] + y1 * gx[1] + y2 * gx[2]);
        integrals[8] += d1 * (z0 * gy[0] + z1 * gy[1] + z2 * gy[2]);
        integrals[9] += d2 * (x0 * gz[0] + x1 * gz[1] + x2 * gz[2]);
    }

    integrals[0] /= 6;
    integrals[1] /= 24;
    integrals[2] /= 24;
    integrals[3] /= 24;
    integrals[4] /= 60;
    integrals[5] /= 60;
    integrals[6] /= 60;
    integrals[7] /= 120;
    integrals[8] /= 120;
    integrals[9] /= 120;

    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    for (i = 0, len = vertices.length; i < len; i++) {
        var vertex = vertices[i].vertex;
        if (vertex.x < minX) minX = vertex.x;
        if (vertex.x > maxX) maxX = vertex.x;
        if (vertex.y < minY) minY = vertex.y;
        if (vertex.y > maxY) maxY = vertex.y;
        if (vertex.z < minZ) minZ = vertex.z;
        if (vertex.z > maxZ) maxZ = vertex.z;
    }

    var size = [maxX - minX, maxY - minY, maxZ - minZ];
    var volume = integrals[0];
    var centroid = new Vec3(integrals[1], integrals[2], integrals[3]);
    centroid.scale(1 / volume);

    var eulerTensor = new Mat33([
                                  integrals[4], integrals[7], integrals[9],
                                  integrals[7], integrals[5], integrals[8],
                                  integrals[9], integrals[8], integrals[6]
                                 ]);

    return {
        size: size,
        volume: volume,
        centroid: centroid,
        eulerTensor: eulerTensor
    };
}

module.exports = {
    DynamicGeometry: DynamicGeometry,
    ConvexHull: ConvexHull
};
