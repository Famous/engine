'use strict';

var Distance = require('../../src/constraints/Distance');
var Constraint = require('../../src/constraints/Constraint');
var Box = require('../../src/bodies/Box');
var Vec3 = require('famous-math').Vec3;
var test = require('tape');

test('Distance', function(t) {
    var a = new Box({size:[10,10,10], position: new Vec3(0,0,0)});
    var b = new Box({size:[10,10,10], position: new Vec3(100,0,0)});
    var d = new Distance(a,b, {period: 0.001});

    t.test('should extend Constraint', function(t) {
        t.assert(Distance instanceof Function, 'Distance should be a constructor');

        t.assert(d instanceof Distance && d instanceof Constraint, 'constructed objects should be instances of Constraint');

        t.end();
    });

    t.test('init method', function(t) {
        t.assert(d.init instanceof Function, '.init should be a function');
        t.assert(d.length === 100, '.init should correctly set .length');

        t.end();
    });

    t.test('update method', function(t) {
        d.impulse = 13;
        d.update(100, 60/1000);
        b.applyImpulse(new Vec3(-13,0,0));
        a.applyImpulse(new Vec3(13,0,0));
        t.assert(b.velocity.x === 0, '.update should warm start the constraint');
        t.assert(a.velocity.x === 0, '.update should warm start the constraint');

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