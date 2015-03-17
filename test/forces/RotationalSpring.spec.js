'use strict';

var RotationalSpring = require('../../src/forces/RotationalSpring');
var Force = require('../../src/forces/Force');
var Box = require('../../src/bodies/Box');
var Vec3 = require('famous-math').Vec3;
var Mat33 = require('famous-math').Mat33;
var Quaternion = require('famous-math').Quaternion;
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('RotationalSpring', function(t) {
    var p1 = new Box({mass:1000, size: [10,10,10]});
    var p2 = new Box({mass: 22, size: [10,10,10]});
    p2.setOrientation(1,2,3,4);
    p2.setAngularVelocity(3,5,8);
    var s = new RotationalSpring(p1, p2);

    t.test('should extend Force', function(t) {
        t.assert(RotationalSpring instanceof Function, 'RotationalSpring should be a constructor');

        t.assert(s instanceof RotationalSpring && s instanceof Force, 'constructed objects should be instances of Force');

        t.end();
    });

    t.test('init prototypal method', function(t) {
        t.assert(s.init instanceof Function, '.init should be a function');

        s.setOptions({stiffness: 1234, damping: 4321});
        t.assert(s.stiffness === 1234 && s.damping === 4321 && s.period === null && s.dampingRatio === null, '.init should set .stiffness and .damping correctly when explicitly specified');
        s.setOptions({period: 2.5, dampingRatio: 0.5});

        var k = 2*2*Math.PI*Math.PI/(2.5*2.5);
        var c = 2*2*Math.PI*0.5/2.5;

        t.assert(s.period === 2.5 && s.dampingRatio === 0.5 && s.stiffness === k && s.damping === c, '.init should infer .stiffness and .damping correctly when .period and .dampingRatio are specified');

        t.end();
    });

    t.test('update prototypal method', function(t) {
        t.assert(s.update instanceof Function, '.update should be a function');

        var eI = Mat33.add(p1.inverseInertia, p2.inverseInertia, new Mat33()).inverse();

        var q = Quaternion.conjugate(p2.orientation, new Quaternion());
        var deltaQ = q.leftMultiply(p1.orientation);

        var halftheta = deltaQ.w > 1 ? 0 : Math.acos(deltaQ.w);
        var length = Math.sqrt(1-deltaQ.w*deltaQ.w);

        var v = Vec3.clone(deltaQ).scale(2*halftheta/length);

        v.scale(s.stiffness);
        var w = Vec3.subtract(p1.angularVelocity, p2.angularVelocity, new Vec3());
        w.scale(s.damping);
        v.add(w);

        v.applyMatrix(eI);

        s.update();

        t.assert(vec3sAreEqual(p2.torque, v) && vec3sAreEqual(p1.torque, v.invert()), '.update should apply forces correctly');

        t.end();
    });

    t.end();
});