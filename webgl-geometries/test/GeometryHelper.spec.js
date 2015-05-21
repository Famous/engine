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
var test = require('tape');
var GeometryHelper = require('../GeometryHelper');
var Vec3 = require('../../math/Vec3');

test('GeometryHelper', function(t) {
    t.test('GeometryHelper.generateParametric', function(t) {

        t.ok(
            GeometryHelper.generateParametric instanceof Function,
            'Should have generateParametric function'
        );

        var generator = function generator(u, v, pos) {
            generator.callCount++;

            var x = Math.sin(u) * Math.cos(v);
            var y = Math.cos(u);
            var z = -Math.sin(u) * Math.sin(v);

            pos[0] = x;
            pos[1] = y;
            pos[2] = z;
        };
        generator.callCount = 0;

        var detailX = 10;
        var detailY = 10;

        GeometryHelper.generateParametric(detailX, detailY, generator);

        t.equals(
            generator.callCount,
            (detailX + 1) * detailY,
            'Should call generator exactly (detailX + 1) * detailY times!'
        );

        t.end();
    });

    t.test('GeometryHelper.computeNormals', function(t) {
        var vertices = [
            -1,  1, 0,
             0, -1, 0,
             1,  1, 0
        ];
        var indices = [0, 1, 2];

        var normals = GeometryHelper.computeNormals(vertices, indices);

        t.equals(normals.length, vertices.length, 'Normals should be length of vertices');
        t.deepEquals([0, 0, 1], normals.slice(0, 3), 'Should return correct normals');
        t.deepEquals([0, 0, 1], normals.slice(3, 6), 'Should return correct normals');
        t.deepEquals([0, 0, 1], normals.slice(6, 9), 'Should return correct normals');

        t.end();
    });

    t.test('GeometryHelper.subdivide', function(t) {
        var vertices = [
            -1,  1, 0,
             0, -1, 0,
             1,  1, 0
        ];
        var indices = [0, 1, 2];
        var texCoords = [
            0.0, 0.0,
            0.5, 1.0,
            1.0, 0.0
        ];

        GeometryHelper.subdivide(indices, vertices, texCoords);

        t.equals(
            vertices.length,
            9 * 2,
            'Returned vertices should be 2X length!'
        );

        t.equals(
            indices.length,
            3 * 4,
            'Returned indices should 4X length'
        );

        var rangeX = [0, 0];
        var rangeY = [0, 0];
        var rangeZ = [0, 0];
        var vectors = [];

        for (var i = 0; i < vertices.length; i+=3) {
            vectors.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
        }

        // Get ranges
        vectors.forEach(function(item, i) {
            if (item[0] < rangeX[0]) rangeX[0] = item[0];
            if (item[0] > rangeX[1]) rangeX[1] = item[0];
            if (item[1] < rangeY[0]) rangeY[0] = item[1];
            if (item[1] > rangeY[1]) rangeY[1] = item[1];
            if (item[2] < rangeZ[0]) rangeZ[0] = item[2];
            if (item[2] > rangeZ[1]) rangeZ[1] = item[2];
        });

        t.ok(!(rangeX[0] < -1), 'Returned vertices should remain with bounds of triangle');
        t.ok(!(rangeX[1] >  1), 'Returned vertices should remain with bounds of triangle');
        t.ok(!(rangeY[0] < -1), 'Returned vertices should remain with bounds of triangle');
        t.ok(!(rangeY[1] <  1), 'Returned vertices should remain with bounds of triangle');
        t.ok(!(rangeZ[0] < -1), 'Returned vertices should remain with bounds of triangle');
        t.ok(!(rangeZ[1] >  1), 'Returned vertices should remain with bounds of triangle');

        t.end();
    });

    t.test('GeometryHelper.getUniqueFaces', function(t) {
        var vertices = [
            -1,  1, 0,
             0, -1, 0,
             1,  1, 0
        ];
        var indices = [0, 1, 2];

        GeometryHelper.getUniqueFaces(vertices, indices);

        t.equals(vertices.length, 9, 'Should not duplicate vertices when no duplicate faces are found');

        indices = [0, 1, 2, 0, 1, 2];

        GeometryHelper.getUniqueFaces(vertices, indices);

        t.equals(vertices.length, 18, 'Should duplicate vertices for duplicate faces');

        t.end();
    });

    t.test('GeometryHelper.subdivideSpheroid', function(t) {
        var vertices = [];

        vertices.push.apply(vertices, new Vec3(-1, 1, 0).normalize().toArray());
        vertices.push.apply(vertices, new Vec3( 0,-1, 0).normalize().toArray());
        vertices.push.apply(vertices, new Vec3( 1, 1, 0).normalize().toArray());

        var indices = [0, 1, 2];

        GeometryHelper.subdivideSpheroid(vertices, indices);

        var vectors = [];
        for (var i = 0; i < vertices.length; i += 3) {
            vectors.push(new Vec3(vertices[i], vertices[i + 1], vertices[i + 2]));
        }

        var allLengthOne = vectors.every(function(vec) {
            return isNormalized(vec.length());
        });

        t.ok(allLengthOne, "All returned vectors should be of length 1");

        t.end();
    });

    t.test('GeometryHelper.getSpheroidNormals', function(t) {
        var vertices = [
            -1,  1, 0,
             0, -1, 0,
             1,  1, 0
        ];

        var normals = GeometryHelper.getSpheroidNormals(vertices);

        var normalVectors = [];
        normalVectors.push(normals.slice(0, 3));
        normalVectors.push(normals.slice(3, 6));
        normalVectors.push(normals.slice(6, 9));

        var allNormalized = normalVectors.every(function(normal, i) {
            var vector = new Vec3(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]).normalize();

            return (normal[0] === vector.x) && (normal[1] === vector.y) && (normal[2] === vector.z);
        });

        t.equals(normals.length, vertices.length, 'Returned normals should have same length as vertices');
        t.ok(allNormalized, "All output normals should be normalized vertices values");

        t.end();
    });

    t.test('GeometryHelper.getSpheroidUV', function(t) {
        var vertices = [0, 1, 0, 0, 0, 1];
        var textureCoords = GeometryHelper.getSpheroidUV(vertices);

        t.equals(textureCoords.length, vertices.length / 3 * 2, "Should return texCoords of same length");
        t.end();
    });

    t.test('GeometryHelper.normalizeAll', function(t) {
        var numVerts = 10;
        var vertices = generateRandomArray(numVerts, [-1, 1]);

        var normalized = GeometryHelper.normalizeAll(vertices);
        var allNormalized = testVector(normalized, function(vector) {
            return isNormalized(vector.length());
        });

        t.ok(allNormalized, "All output vectors should be normalized");
        t.end();
    });

    t.test('GeometryHelper.normalizeVertices', function(t) {
        var vertices = generateRandomArray(10, [-10, 10]);
        var normalized = GeometryHelper.normalizeVertices(vertices);
        var withinRange = testVector(normalized, function(vector) {
            return (vector.x <= 1) && (vector.x >= -1)
                && (vector.y <= 1) && (vector.y >= -1)
                && (vector.z <= 1) && (vector.z >= -1);
        });

        t.ok(withinRange, "All vectors should be within 2x2 bounding box");
        t.end();
    });

    t.test('GeometryHelper.getTranslationFactor', function(t) {
        t.end();
    });

    t.test('GeometryHelper.getScaleFactor', function(t) {
        t.end();
    });

    t.test('GeometryHelper.getAzimuth', function(t) {
        t.end();
    });

    t.test('GeometryHelper.getAlititude', function(t) {
        t.end();
    });

    t.test('GeometryHelper.trianglesToLines', function(t) {
        var triangleIndices = generateRandomArray(12);
        var lineIndices = GeometryHelper.trianglesToLines(triangleIndices);

        t.equals(
            lineIndices.length,
            triangleIndices.length * 2,
            "Line indices should be 1/2 length of triangle indices"
        );

        t.end();
    });

    t.end();
});


// Helper methods used for testing

function testVector(vertices, callback) {
    var numVectors = vertices.length / 3;

    for (var i = 0; i < numVectors; i++) {
        var vector = new Vec3(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]);
        if (!callback(vector)) return false;
    }

    return true;
}

function isNormalized(len) {
    return (len > 0.98) && (len < 1.02);
}

function generateRandomArray(numVerts, range) {
    var out = [];
    range = range || [0, 1];
    var offset = range[1] - range[0];

    while (numVerts--) {
        out.push(Math.random() * offset + range[0]);
    }

    return out;
}
