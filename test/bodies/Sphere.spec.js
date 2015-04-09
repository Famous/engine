'use strict';

var Particle = require('../../src/bodies/Particle');
var Sphere = require('../../src/bodies/Sphere');
var Vec3 = require('famous-math').Vec3;
var test = require('tape');

function arraysAreEqual(a, b) {
    for (var i = 0, len = a.length; i < len; i++) {
        if (Math.abs(a[i] - b[i]) > 0.001) return false;
    }
    return true;
}

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('Sphere', function(t) {
    var s = new Sphere({radius: 5, mass: 2});

    t.test('should extend Particle', function(t) {
        t.assert(Sphere instanceof Function, 'Sphere should be a constructor');

        t.assert(s instanceof Sphere && s instanceof Particle, 'new spheres should be instances of Particle');

        t.end();
    });

    t.test('properties should respond to radius', function(t) {
        t.assert(s.size[0] === 10 && s.size[1] === 10 && s.size[2] === 10, 'should initialize with the correct .size');
        var i = s.localInertia.get();
        t.assert(arraysAreEqual(i, [20,0,0,0,20,0,0,0,20]), 'should initialize with the correct .inertia');

        t.assert(s.getRadius() === s.radius && s.radius === 5, '.getRadius should be a correct radius getter method');
        s.setRadius(10);
        t.assert(s.radius === 10, '.setRadius should be a correct radius setter method');
        t.assert(s.size[0] === 20 && s.size[1] === 20 && s.size[2] === 20, '.setRadius should update the sphere .size');

        t.end();
    });

    t.test('support prototypal method', function(t) {
        t.assert(s.support instanceof Function, '.support should be a function');
        var d = new Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        d.normalize();

        var c = Vec3.scale(d, s.radius, new Vec3());
        var sup = s.support(d);
        t.assert(vec3sAreEqual(sup,c), 'should provide an accurate .support method');

        t.end();
    });

    t.end();
});