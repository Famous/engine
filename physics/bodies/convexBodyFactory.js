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

var Particle = require('./Particle');
var Mat33 = require('../../math/Mat33');
var Vec3 = require('../../math/Vec3');
var Geometry = require('../Geometry');
var ConvexHull = Geometry.ConvexHull;

var TEMP_REGISTER = new Vec3();

/**
 * Returns a constructor for a physical body reflecting the shape defined by input ConvexHull or Vec3 array.
 *
 * @method
 * @param {ConvexHull | Vec3[]} hull ConvexHull instance or Vec3 array.
 * @return {Function} The constructor for the custom convex body type.
 */
function convexBodyFactory(hull) {
    if (!(hull instanceof ConvexHull)) {
        if (!(hull instanceof Array)) throw new Error('convexBodyFactory requires a ConvexHull object or an array of Vec3\'s as input.');
        else hull = new ConvexHull(hull);
    }

    /**
     * The body class with inertia and vertices inferred from the input ConvexHull or Vec3 array.
     *
     * @class ConvexBody
     * @param {Object} options The options hash.
     */
    function ConvexBody(options) {
        Particle.call(this, options);

        var originalSize = hull.polyhedralProperties.size;
        var size = options.size || originalSize;

        var scaleX = size[0] / originalSize[0];
        var scaleY = size[1] / originalSize[1];
        var scaleZ = size[2] / originalSize[2];

        this._scale = [scaleX, scaleY, scaleZ];

        var T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

        this.hull = hull;

        this.vertices = [];
        for (var i = 0, len = hull.vertices.length; i < len; i++) {
            this.vertices.push(T.vectorMultiply(hull.vertices[i], new Vec3()));
        }

        _computeInertiaProperties.call(this, T);
        this.inverseInertia.copy(this.localInverseInertia);
        this.updateInertia();

        var w = options.angularVelocity;
        if (w) this.setAngularVelocity(w.x, w.y, w.z);
    }

    ConvexBody.prototype = Object.create(Particle.prototype);
    ConvexBody.prototype.constructor = ConvexBody;

    /**
     * Set the size and recalculate
     *
     * @method
     * @chainable
     * @param {Number} x The x span.
     * @param {Number} y The y span.
     * @param {Number} z The z span.
     * @return {ConvexBody} this
     */
    ConvexBody.prototype.setSize = function setSize(x,y,z) {
        var originalSize = hull.polyhedralProperties.size;

        this.size[0] = x;
        this.size[1] = y;
        this.size[2] = z;

        var scaleX = x / originalSize[0];
        var scaleY = y / originalSize[1];
        var scaleZ = z / originalSize[2];

        this._scale = [scaleX, scaleY, scaleZ];

        var T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

        var vertices = this.vertices;
        for (var i = 0, len = hull.vertices.length; i < len; i++) {
            T.vectorMultiply(hull.vertices[i], vertices[i]);
        }

        return this;
    };

    /**
     * Update the local inertia and inverse inertia to reflect the current size.
     *
     * @method
     * @return {ConvexBody} this
     */
    ConvexBody.prototype.updateLocalInertia = function updateInertia() {
        var scaleX = this._scale[0];
        var scaleY = this._scale[1];
        var scaleZ = this._scale[2];

        var T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

        _computeInertiaProperties.call(this, T);

        return this;
    };

    /**
     * Retrieve the vertex furthest in a direction. Used internally for collision detection.
     *
     * @method
     * @param {Vec3} direction The direction in which to search.
     * @return {Vec3} The furthest vertex.
     */
    ConvexBody.prototype.support = function support(direction) {
        var vertices = this.vertices;
        var vertex, dot, furthest;
        var max = -Infinity;
        for (var i = 0, len = vertices.length; i < len; i++) {
            vertex = vertices[i];
            dot = Vec3.dot(vertex,direction);
            if (dot > max) {
                furthest = vertex;
                max = dot;
            }
        }
        return furthest;
    };

    /**
     * Update vertices to reflect current orientation.
     *
     * @method
     * @return {ConvexBody} this
     */
    ConvexBody.prototype.updateShape = function updateShape() {
        var vertices = this.vertices;
        var q = this.orientation;
        var modelVertices = this.hull.vertices;

        var scaleX = this._scale[0];
        var scaleY = this._scale[1];
        var scaleZ = this._scale[2];

        var t = TEMP_REGISTER;
        for (var i = 0, len = vertices.length; i < len; i++) {
            t.copy(modelVertices[i]);
            t.x *= scaleX;
            t.y *= scaleY;
            t.z *= scaleZ;
            Vec3.applyRotation(t, q, vertices[i]);
        }

        return this;
    };

    return ConvexBody;
}

/**
 * Determines mass and inertia tensor based off the density, size, and facet information of the polyhedron.
 *
 * @method
 * @private
 * @param {Mat33} T The matrix transforming the intial set of vertices to a set reflecting the body size.
 * @return {undefined} undefined
 */
function _computeInertiaProperties(T) {
    var polyhedralProperties = this.hull.polyhedralProperties;
    var T_values = T.get();
    var detT = T_values[0] * T_values[4] * T_values[8];

    var E_o = polyhedralProperties.eulerTensor;

    var E = new Mat33();
    Mat33.multiply(T, E_o, E);
    Mat33.multiply(E, T, E);
    var E_values = E.get();

    var Exx = E_values[0];
    var Eyy = E_values[4];
    var Ezz = E_values[8];
    var Exy = E_values[1];
    var Eyz = E_values[7];
    var Exz = E_values[2];

    var newVolume = polyhedralProperties.volume * detT;
    var mass = this.mass;
    var density = mass / newVolume;

    var Ixx = Eyy + Ezz;
    var Iyy = Exx + Ezz;
    var Izz = Exx + Eyy;
    var Ixy = -Exy;
    var Iyz = -Eyz;
    var Ixz = -Exz;

    var centroid = polyhedralProperties.centroid;

    Ixx -= newVolume * (centroid.y * centroid.y + centroid.z * centroid.z);
    Iyy -= newVolume * (centroid.z * centroid.z + centroid.x * centroid.x);
    Izz -= newVolume * (centroid.x * centroid.x + centroid.y * centroid.y);
    Ixy += newVolume * centroid.x * centroid.y;
    Iyz += newVolume * centroid.y * centroid.z;
    Ixz += newVolume * centroid.z * centroid.x;

    Ixx *= density * detT;
    Iyy *= density * detT;
    Izz *= density * detT;
    Ixy *= density * detT;
    Iyz *= density * detT;
    Ixz *= density * detT;

    var inertia = [
        Ixx, Ixy, Ixz,
        Ixy, Iyy, Iyz,
        Ixz, Iyz, Izz
    ];

    this.localInertia.set(inertia);
    Mat33.inverse(this.localInertia, this.localInverseInertia);
}

module.exports = convexBodyFactory;
