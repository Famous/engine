'use strict';
var test           = require('tape');
var OBJLoader      = require('../src/OBJLoader');
var Vec3           = require('famous-math').Vec3;

test('OBJLoader', function(t) {
    var teapotURL = 'http://people.sc.fsu.edu/~jburkardt/data/obj/teapot.obj';
    var invoked   = false;
    var normalized;

    t.test('OBJLoader.load', function(t) {
        t.plan(9);

        t.ok(OBJLoader.load instanceof Function, 'should have a .load method');

        OBJLoader.requests[teapotURL] = [function(res) {
            t.equal(typeof res, 'object', 'should return an object');

            t.ok(res.vertices, 'returned object should have vertices');
            t.ok(res.textureCoords, 'returned object should have textureCoords');
            t.ok(res.indices, 'returned object should have indices');
            t.ok(res.normals, 'returned object should have normals');

            normalized = isNormalized(res.vertices);

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
            normalized = isNormalized(res.vertices);

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