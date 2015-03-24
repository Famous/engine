'use strict';
var test           = require('tape');
var OBJLoader      = require('../src/OBJLoader');
var Utility        = require('../../utilities/Utility');

test('OBJLoader', function(t) {
    var teapotURL = 'http://people.sc.fsu.edu/~jburkardt/data/obj/teapot.obj';
    var invoked   = false;

    t.test('load', function(t) {
        t.plan(7);

        t.ok(OBJLoader.load instanceof Function, 'should have a .load method');

        OBJLoader.load(teapotURL, function(res) {
            t.equal(typeof res, 'object', 'should return an object');

            t.ok(res.vertices, 'returned object should have vertices');
            t.ok(res.textureCoords, 'returned object should have textureCoords');
            t.ok(res.indices, 'returned object should have indices');
            t.ok(res.normals.length === 0, 'returned object should have normals of length 0');

            OBJLoader.load(teapotURL, function(res) {
                invoked = true;
            });

            t.ok(invoked, 'should immediately invoke callbacks for cached results');
        });
    });
    t.end();
});
