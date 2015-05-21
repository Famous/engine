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
var Vec3 = require('../../math/Vec3');
var Geometry = require('../Geometry');
var DynamicGeometry = Geometry.DynamicGeometry;
var ConvexHull = Geometry.ConvexHull;

test('DynamicGeometry', function(t) {
    t.test('should be a constructor', function(t) {
        t.assert(DynamicGeometry instanceof Function, 'DynamicGeometry should be a function');

        t.end();
    });

    t.test('vertex methods', function(t) {
        var dg = new DynamicGeometry();
        t.assert(dg.addVertex instanceof Function, '.addVertex should be a function');
        t.assert(dg.removeVertex instanceof Function, '.removeVertex should be a function');
        t.assert(dg.getLastVertex instanceof Function, '.getLastVertex should be a function');

        var x = {};
        var v = {};
        dg.addVertex(x);
        dg.addVertex(v);

        t.assert(dg.lastVertexIndex === 1, '.addVertex should update .lastVertexIndex');
        t.assert(dg.vertices[1] === v, '.addVertex should push to .vertices');
        t.assert(dg.numVertices === 2, '.addVertex should update .numVertices');

        dg.removeVertex(0);
        t.assert(dg.numVertices === 1, '.removeVertex should update .numVertices');
        t.assert(dg.vertices[0] === null, 'removeVertex should null the removed index');

        var vv = {};
        dg.addVertex(vv);
        t.assert(dg.vertices[0] === vv, '.addVertex should fill in holes in .vertices');

        t.end();
    });

    t.test('feature methods', function(t) {
        var dg = new DynamicGeometry();
        t.assert(dg.addFeature instanceof Function, '.addFeature should be a function');
        t.assert(dg.removeFeature instanceof Function, '.removeFeature should be a function');
        t.assert(dg.getFeatureClosestToOrigin instanceof Function, '.getFeatureClosestToOrigin should be a function');

        dg.addFeature(123, {}, []);
        dg.addFeature(321, {}, []);

        t.assert(dg.features[1].distance === 321, '.addFeature should push to .features');
        t.assert(dg.numFeatures === 2, '.addFeature should update .numFeatures');

        dg.removeFeature(0);
        t.assert(dg.numFeatures === 1, '.removeFeature should update .numFeatures');
        t.assert(dg.features[0] === null, 'removeFeature should null the removed index');

        dg.addFeature(555, {}, []);
        t.assert(dg.features[0].distance === 555, '.addFeature should fill in holes in .features');

        t.assert(dg.getFeatureClosestToOrigin().distance === 321, '.getFeatureClosestToOrigin should return the closest feature');

        t.end();
    });

    t.test('reshape method', function(t) {
        var dg = new DynamicGeometry();

        var v0 = {vertex: new Vec3(1,1,1)};
        var v1 = {vertex: new Vec3(1,1,-1)};
        var v2 = {vertex: new Vec3(1,-1,-1)};
        var v3 = {vertex: new Vec3(-1,-1,-1)};
        var v4 = {vertex: new Vec3(-1,-1,1)};
        var v5 = {vertex: new Vec3(-1,1,1)};
        var v6 = {vertex: new Vec3(-1,1,-1)};
        var v7 = {vertex: new Vec3(1,-1,1)};

        var n0 = new Vec3(1,0,0);
        var n1 = new Vec3(-1,0,0);
        var n2 = new Vec3(0,1,0);
        var n3 = new Vec3(0,-1,0);
        var n4 = new Vec3(0,0,1);
        var n5 = new Vec3(0,0,-1);

        dg.addVertex(v0);
        dg.addVertex(v1);
        dg.addVertex(v2);
        dg.addVertex(v3);
        dg.addVertex(v4);
        dg.addVertex(v5);
        dg.addVertex(v6);
        dg.addVertex(v7);

        dg.addFeature(1, n1, [3,4,5]);
        dg.addFeature(1, n1, [3,4,6]);
        dg.addFeature(1, n2, [0,1,5]);
        dg.addFeature(1, n2, [1,5,6]);
        dg.addFeature(1, n3, [3,2,4]);
        dg.addFeature(1, n3, [2,4,7]);
        dg.addFeature(1, n4, [0,4,5]);
        dg.addFeature(1, n4, [0,4,7]);
        dg.addFeature(1, n5, [1,2,3]);
        dg.addFeature(1, n5, [1,2,6]);
        dg.addFeature(1, n0, [0,2,7]);
        dg.addFeature(1, n0, [0,2,1]);

        var test = {vertex: new Vec3(2,0,0)};
        dg.addVertex(test);
        dg.reshape();
        t.assert(dg.numFeatures === 14, '.reshape should add features as necessary');
        t.assert(dg.features[10].normal !== n0 && dg.features[11].normal !== n0, '.reshape should remove interior features');

        var f = dg.features;
        var same = 0;
        if (f[0].normal === n1) same++;
        if (f[1].normal === n1) same++;
        if (f[2].normal === n2) same++;
        if (f[3].normal === n2) same++;
        if (f[4].normal === n3) same++;
        if (f[5].normal === n3) same++;
        if (f[6].normal === n4) same++;
        if (f[7].normal === n4) same++;
        if (f[8].normal === n5) same++;
        if (f[9].normal === n5) same++;

        t.assert(same === 10, '.reshape should not alter exterior features');

        var pos = 0;
        var neg = 0;
        var c = Math.sqrt(2)/2;
        if (Math.abs(f[10].normal.z - c) < 0.001 || Math.abs(f[10].normal.y - c) < 0.001) pos++;
        if (Math.abs(f[11].normal.z - c) < 0.001 || Math.abs(f[11].normal.y - c) < 0.001) pos++;
        if (Math.abs(f[12].normal.z - c) < 0.001 || Math.abs(f[12].normal.y - c) < 0.001) pos++;
        if (Math.abs(f[13].normal.z - c) < 0.001 || Math.abs(f[13].normal.y - c) < 0.001) pos++;
        if (Math.abs(f[10].normal.z + c) < 0.001 || Math.abs(f[10].normal.y + c) < 0.001) neg++;
        if (Math.abs(f[11].normal.z + c) < 0.001 || Math.abs(f[11].normal.y + c) < 0.001) neg++;
        if (Math.abs(f[12].normal.z + c) < 0.001 || Math.abs(f[12].normal.y + c) < 0.001) neg++;
        if (Math.abs(f[13].normal.z + c) < 0.001 || Math.abs(f[13].normal.y + c) < 0.001) neg++;

        t.assert(pos === 2 && neg === 2, '.reshape should assign new features the correct normals');

        t.end();
    });

    t.test('simplexContainsOrigin method', function(t) {
        var dg = new DynamicGeometry();

        var v0 = {vertex: new Vec3(1,0,0)};
        var v1 = {vertex: new Vec3(0,-1,0)};
        var v2 = {vertex: new Vec3(0,0,1)};
        var v3 = {vertex: new Vec3(-1,1,-1)};

        dg.addVertex(v0);
        dg.addVertex(v1);
        var d = new Vec3();
        var res = dg.simplexContainsOrigin(d);

        t.assert(res === false, '.simplexContainsOrigin should return false on failure');
        t.assert(d.x === -1 && d.y === 1 && d.z === 0, '.simplexContainsOrigin should alter input Vec3 direction to point toward the origin');

        dg.addVertex(v2);
        res = dg.simplexContainsOrigin(d);
        t.assert(res === false, '.simplexContainsOrigin should return false on failure');
        t.assert(d.x === -1 && d.y === 1 && d.z === -1, '.simplexContainsOrigin should alter input Vec3 direction to point toward the origin');

        dg.addVertex(v3);
        res = dg.simplexContainsOrigin(d);
        t.assert(res === true, '.simplexContainsOrigin should return true on success');

        t.end();
    });
});

test('ConvexHull', function(t) {
    t.test('should be a constructor', function(t) {
        t.assert(ConvexHull instanceof Function, 'ConvexHull should be a function');

        var v0 = new Vec3(2,1,1);
        var v1 = new Vec3(2,1,-1);
        var v2 = new Vec3(2,-1,-1);
        var v3 = new Vec3(0,-1,-1);
        var v4 = new Vec3(0,-1,1);
        var v5 = new Vec3(0,1,1);
        var v6 = new Vec3(0,1,-1);
        var v7 = new Vec3(2,-1,1);
        var v8 = new Vec3(1,0,0);

        var vs = [v0,v1,v2,v3,v4,v5,v6,v7,v8];

        var hull = new ConvexHull(vs);
        t.assert(hull.vertices.length === 8, 'ConvexHull should disregard interior vertices');
        var p = hull.polyhedralProperties;
        var c = p.centroid;
        t.assert(c.x === 1 && c.y ===0 && c.z === 0, 'ConvexHull should determine the centroid of the vertices');
        t.assert(p.volume === 8, 'ConvexHull should determine the volume of the vertices');
        t.deepEqual(p.size, [2,2,2], 'ConvexHull should determine the xyz span of the vertices');

        t.end();
    });
});
