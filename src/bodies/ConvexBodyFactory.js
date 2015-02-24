'use strict';

var Particle = require('../bodies/Particle');
var Matrix = require('famous-math').Mat33;
var Vec3 = require('famous-math').Vec3;
var Geometry = require('famous-math').Geometry;
var ConvexHull = Geometry.ConvexHull;

/**
 * Returns a constructor for a physical body reflecting the shape defined by input ConvexHull or Vec3 array.
 *
 * @method ConvexBodyFactory
 * @param {ConvexHull | Vec3[]} hull
 * @return {Function}
 */
function ConvexBodyFactory(hull) {
    if (!(hull instanceof ConvexHull)) {
        if (!(hull instanceof Array)) throw new Error('ConvexBodyFactory requires a ConvexHull object or an array of Vec3\'s as input.');
        else hull = new ConvexHull(hull);
    }

    var _polyhedralProperties = hull.polyhedralProperties;
    var _vertices = hull.vertices;
    var _vertexGraph = hull.graph;

    function ConvexBody(options) {
        Particle.call(this, options);

        var originalSize = _polyhedralProperties.size;
        var size = options.size || originalSize;

        var scaleX = size[0]/originalSize[0];
        var scaleY = size[1]/originalSize[1];
        var scaleZ = size[2]/originalSize[2];

        var T = new Matrix([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

        var properties = _computeInertiaProperties(_polyhedralProperties, options, T);

        this.mass = properties.mass;
        this.inverseMass = 1 / this.mass;
        this.inertia = new Matrix(properties.inertia);
        this.inverseInertia = Matrix.inverse(this.inertia, new Matrix());

        this._bodyVertices = [];
        for (var i = 0, len = _vertices.length; i < len; i++) {
            this._bodyVertices.push(T.vectorMultiply(_vertices[i], new Vec3()));
        }
        this.vertices = [];
        for (var i = 0, len = this._bodyVertices.length; i < len; i++) {
            this.vertices.push(Vec3.clone(this._bodyVertices[i]));
        }

        this.vertexGraph = _vertexGraph;
        this.hull = hull;
    }

    ConvexBody.prototype = Object.create(Particle.prototype);
    ConvexBody.prototype.constructor = ConvexBody;

    ConvexBody.prototype.support = function support(direction) {
        var vertices = this.vertices;
        var max = -Infinity;
        for (var i = 0, len = vertices.length; i < len; i++) {
            var vertex = vertices[i];
            var dot = Vec3.dot(vertex,direction);
            if (dot > max) {
                var furthest = vertex;
                max = dot;
            }
        }
        return furthest;
    };

    ConvexBody.prototype.updateShape = function updateShape() {
        var vertices = this.vertices;
        var q = this.orientation;
        var bodyVertices = this._bodyVertices;
        for (var i = 0, len = vertices.length; i < len; i++) {
            Vec3.applyRotation(bodyVertices[i], q, vertices[i]);
        }
    };

    return ConvexBody;
}

/**
 * Determines mass and inertia tensor based off the density, size, and facet information of the polyhedron.
 *
 * @method _computeInertiaProperties
 * @private
 * @param {Object} polyhedralProperties
 * @param {Object} options
 * @param {Mat33} T
 * @return {Object}
 */
function _computeInertiaProperties(polyhedralProperties, options, T) {
    var T_values = T.get();
    var detT = T_values[0] * T_values[4] * T_values[8];

    var E_o = polyhedralProperties.eulerTensor;

    var E = new Matrix();
    Matrix.multiply(T, E_o, E);
    Matrix.multiply(E, T, E);
    var E_values = E.get();

    var Exx = E_values[0];
    var Eyy = E_values[4];
    var Ezz = E_values[8];
    var Exy = E_values[1];
    var Eyz = E_values[7];
    var Exz = E_values[2];

    var newVolume = polyhedralProperties.volume * detT;
    var density = 1;
    var mass = newVolume;

    if (options.mass) {
        mass = options.mass;
        density = mass / newVolume;
    } else if (options.density) {
        density = options.density;
        mass *= options.density;
    }

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

    return {
        mass: mass,
        inertia: inertia
    };
}

module.exports = ConvexBodyFactory;
