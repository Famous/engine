'use strict';

var Spring = require('../../src/forces/Spring');
var Force = require('../../src/forces/Force');
var Particle = require('../../src/bodies/Particle');
var Vec3 = require('famous-math').Vec3;
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('Spring', function(t) {
    var p1 = new Particle({mass:1000});
    var p2 = new Particle({mass: 22});
    p2.setPosition(10,20,30);
    p2.setVelocity(3,5,8);
    var s = new Spring(p1, p2);

    t.test('should extend Force', function(t) {
        t.assert(Spring instanceof Function, 'Spring should be a constructor');

        t.assert(s instanceof Spring && s instanceof Force, 'constructed objects should be instances of Force');

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


        var e = Vec3.subtract(p1.position, p2.position, new Vec3());
        var effM = 1/(1/1000 + 1/22);
        e.scale(effM*s.stiffness);
        var d = Vec3.subtract(p1.velocity, p2.velocity, new Vec3());
        d.scale(effM*s.damping);
        e.add(d);

        s.update();

        t.assert(vec3sAreEqual(p2.force, e) && vec3sAreEqual(p1.force, e.invert()), '.update should apply forces correctly');

        t.end();
    });

    t.end();
});