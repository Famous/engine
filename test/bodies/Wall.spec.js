'use strict';

var Particle = require('../../src/bodies/Particle');
var Wall = require('../../src/bodies/Wall');
var Vec3 = require('famous-math').Vec3;
var test = require('tape');

test('Wall', function(t) {
    var w = new Wall({direct: Wall.DOWN});

    t.test('should extend Particle', function(t) {
        t.assert(Wall instanceof Function, 'Wall should be a constructor');

        t.assert(w instanceof Wall && w instanceof Particle, 'new boxes should be instances of Particle');

        t.end();
    });

    t.test('mass properties', function(t) {
        t.assert(w.inverseMass === 0, 'walls should have 0 inverse mass');
        var i = w.inverseInertia.get();
        t.assert(i[0] === 0 && i[4] === 0 && i[8] === 0, 'walls should have 0 inverse moments of inertia');

        t.end();
    })

    t.end();
});