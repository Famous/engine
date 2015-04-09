'use strict';

var Drag = require('../../src/forces/Drag');
var Force = require('../../src/forces/Force');
var Particle = require('../../src/bodies/Particle');
var Vec3 = require('famous-math').Vec3;
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('Drag', function(t) {
    var p1 = new Particle({mass:1000});
    p1.setVelocity(3,5,8);
    var d = new Drag(p1, {strength: 3});

    t.test('should extend Force', function(t) {
        t.assert(Drag instanceof Function, 'Drag should be a constructor');

        t.assert(d instanceof Drag && d instanceof Force, 'constructed objects should be instances of Force');

        t.end();
    });

    t.test('init prototypal method', function(t) {
        t.assert(d.init instanceof Function, '.init should be a function');

        t.assert(d.strength === 3, '.init should set options correctly');

        t.end();
    });

    t.test('update prototypal method', function(t) {
        t.assert(d.update instanceof Function, '.update should be a function');

        var v = Vec3.clone(p1.velocity);
        v.scale(-d.strength);

        d.update();

        t.assert(vec3sAreEqual(p1.force, v), '.update should apply forces correctly');

        t.end();
    });

    t.end();
});