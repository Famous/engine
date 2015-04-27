'use strict';

var Direction = require('../../src/constraints/Direction');
var Constraint = require('../../src/constraints/Constraint');
var Box = require('../../src/bodies/Box');
var Vec3 = require('famous-math').Vec3;
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('Direction', function(t) {
    var a = new Box({size:[10,10,10], position: new Vec3(0,0,0)});
    var b = new Box({size:[10,10,10], position: new Vec3(100,100,0)});
    var d = new Direction(a,b, {period: 0.001});

    t.test('should extend Constraint', function(t) {
        t.assert(Direction instanceof Function, 'Direction should be a constructor');

        t.assert(d instanceof Direction && d instanceof Constraint, 'constructed objects should be instances of Constraint');

        t.end();
    });

    t.test('init method', function(t) {
        t.assert(d.init instanceof Function, '.init should be a function');
        var n = Vec3.subtract(b.position, a.position, new Vec3()).normalize();
        t.assert(vec3sAreEqual(n, d.direction), '.init should correctly set .direction');

        t.end();
    });

    t.test('update method', function(t) {
        d.impulse = 13;
        d.update(100, 60/1000);
        b.applyImpulse(Vec3.scale(d.normal, -13, new Vec3()));
        a.applyImpulse(Vec3.scale(d.normal, 13, new Vec3()));
        t.assert(vec3sAreEqual(b.velocity, new Vec3()), '.update should warm start the constraint');
        t.assert(vec3sAreEqual(a.velocity, new Vec3()), '.update should warm start the constraint');

        t.end();
    });

    t.test('resolve method', function(t) {
        a.setVelocity(1,1,0);
        b.setVelocity(-1,0,0);
        d.resolve();

        var c;
        c = Vec3.subtract(b.velocity, a.velocity, new Vec3()).dot(d.normal);
        t.assert(Math.abs(c) < 0.001, '.resolve should solve the constraint');

        var impulse = d.impulse;

        d.resolve();
        c = Vec3.subtract(b.velocity, a.velocity, new Vec3()).dot(d.normal);
        t.assert(Math.abs(c) < 0.001, 'subsequent calls to .resolve should not disturb the constraint');
        t.assert(Math.abs(impulse - d.impulse) < 0.001, '.resolve on a solved constraint should not add to the total applied impulse');

        t.end();
    });
});