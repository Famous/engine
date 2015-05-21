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
var OBJLoader = require('../OBJLoader');

test('OBJLoader', function(t) {
    var teapotURL = 'http://people.sc.fsu.edu/~jburkardt/data/obj/teapot.obj';
    var invoked   = false;
    var normalized;

    t.test('OBJLoader.load', function(t) {
        t.plan(9);

        t.ok(OBJLoader.load instanceof Function, 'should have a .load method');

        OBJLoader.requests[teapotURL] = [function(res) {
            var geom = res[0];
            t.equal(typeof geom, 'object', 'should return an object');

            t.ok(geom.vertices, 'returned object should have vertices');
            t.ok(geom.textureCoords, 'returned object should have textureCoords');
            t.ok(geom.indices, 'returned object should have indices');
            t.ok(geom.normals, 'returned object should have normals');

            normalized = isNormalized(geom.vertices);

            t.ok(!normalized, 'vertices should not be normalized by default');

            OBJLoader.load(teapotURL, function(res) {
                invoked = true;
            });

            t.ok(invoked, 'should immediately invoke callbacks for cached results');
        }];

        OBJLoader._onsuccess(teapotURL, null, OBJ);

        //
        // WITH OPTIONS
        //

        OBJLoader.requests[teapotURL] = [function(res) {
            normalized = isNormalized(res[0].vertices);

            t.ok(normalized, 'Vertices should be normalized optionally');
        }];

        OBJLoader._onsuccess(teapotURL, { normalize: true }, OBJ);
    });

    t.end();
});

function isNormalized(buffer) {
    return buffer.every(function(a) {
        return a <= 1 && a >= -1;
    });
}

var OBJ = [
    'v -10 -10 0',
    'v 10 -10 0',
    'v 10 10 0',
    'v -10 10 0',
    'vn 0 0 1',
    'vt 0 0',
    'vt 1 0',
    'vt 1 1',
    'vt 0 1',
    'f 1/1/1 4/4/1 2/2/1',
    'f 4/4/1 3/3/1 2/2/1'
].join('\n');
