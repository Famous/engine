'use strict';

var RotationalDrag = require('../../src/forces/RotationalDrag');
var Force = require('../../src/forces/Force');
var Box = require('../../src/bodies/Box');
var Vec3 = require('famous-math').Vec3;
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('RotationalDrag', function(t) {
    var p1 = new Box({mass:1000, size: [10,20,30]});
    p1.setAngularVelocity(3,5,8);
    var d = new RotationalDrag(p1, {strength: 3});

    t.test('should extend Force', function(t) {
        t.assert(RotationalDrag instanceof Function, 'RotationalDrag should be a constructor');

        t.assert(d instanceof RotationalDrag && d instanceof Force, 'constructed objects should be instances of Force');

        t.end();
    });

    t.test('init prototypal method', function(t) {
        t.assert(d.init instanceof Function, '.init should be a function');

        t.assert(d.strength === 3, '.init should set options correctly');

        t.end();
    });

    t.test('update prototypal method', function(t) {
        t.assert(d.update instanceof Function, '.update should be a function');

        var v = Vec3.clone(p1.angularVelocity);
        v.scale(-d.strength);

        d.update();

        t.assert(vec3sAreEqual(p1.torque, v), '.update should apply forces correctly');

        t.end();
    });

    t.end();
});