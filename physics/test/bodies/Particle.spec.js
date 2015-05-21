/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Particle = require('../../bodies/Particle');
var Vec3 = require('../../../math/Vec3');
var Mat33 = require('../../../math/Mat33');
var Quaternion = require('../../../math/Quaternion');
var test = require('tape');

test('Particle', function(t) {
    var p = new Particle({mass: 123});

    t.test('should be a constructor', function(t) {
        t.assert(Particle instanceof Function, 'Particle should be a function');

        t.assert(p instanceof Particle, 'Particle should be a construcor');

        t.end();
    });

    t.test('event methods', function(t) {
        t.assert(p.events, '.events should exist');
        t.assert(p.on instanceof Function, '.on should be a function');
        t.assert(p.off instanceof Function, '.off should be a function');
        t.assert(p.trigger instanceof Function, '.trigger should be a function');

        t.end();
    });

    t.test('mode prototypal methods', function(t) {
        t.assert(p.getRestrictions instanceof Function, '.getRestrictions should be a function');
        t.assert(p.setRestrictions instanceof Function, '.setRestrictions should be a function');

        p.setRestrictions('xy', 'zx');
        t.assert(p.restrictions === 32 + 16 + 4 + 1, '.setRestrictions should convert the string to a bitmask');
        t.deepEqual(p.getRestrictions(), ['xy', 'xz'], '.getRestrictions should convert the enum to its string');

        t.end();
    });

    t.test('mass prototypal methods', function(t) {

        t.assert(p.getMass instanceof Function, '.getMass should be a function');
        t.assert(p.getInverseMass instanceof Function, '.getInverseMass should be a function');
        t.assert(p.setMass instanceof Function, '.setMass should be a function');
        t.assert(p.updateInertia instanceof Function, '.updateInertia should be a function');

        t.assert(p.getMass() === p.mass && p.mass === 123, '.getMass should correctly return the mass');
        p.setMass(321);
        t.assert(p.getMass() === p.mass && p.mass === 321, '.setMass should correctly set the mass');
        t.assert(p.getInverseMass() === p.inverseMass && p.inverseMass === 1/321, '.setMass should update .inverseMass');

        t.end();
    });

    t.test('position prototypal methods', function(t) {
        t.assert(p.getPosition instanceof Function, '.getPosition should be a function');
        t.assert(p.setPosition instanceof Function, '.setPosition should be a function');

        var pos = p.position;
        p.setPosition(10,-3,55);
        t.assert(p.getPosition() === pos, '.getPosition should return the position vector');
        t.assert(pos.x === 10 && pos.y === -3 && pos.z === 55, '.setPosition should correctly set position');

        t.end();
    });

    t.test('velocity prototypal methods', function(t) {
        t.assert(p.getVelocity instanceof Function, '.getVelocity should be a function');
        t.assert(p.setVelocity instanceof Function, '.setVelocity should be a function');

        p.setMass(2);
        var v = p.velocity;
        p.setVelocity(100,-50,100);
        t.assert(p.getVelocity() === v, '.getVelocity should return the velocity vector');
        t.assert(v.x === 100 && v.y === -50 && v.z === 100, '.setVelocity should correctly set the velocity');
        var m = p.momentum;
        t.assert(m.x === 100*2 && m.y === -50*2 && m.z === 100*2, '.setVelocity should update momentum');

        t.end();
    });

    t.test('momentum prototypal methods', function(t) {
        t.assert(p.getMomentum instanceof Function, '.getMomentum should be a function');
        t.assert(p.setMomentum instanceof Function, '.setMomentum should be a function');

        p.setMass(2);
        var m = p.momentum;
        p.setMomentum(100,-50,100);
        t.assert(p.getMomentum() === m, '.getMomentum should return the momentum vector');
        t.assert(m.x === 100 && m.y === -50 && m.z === 100, '.setMomentum should correctly set the momentum');
        var v = p.velocity;
        t.assert(v.x === 100/2 && v.y === -50/2 && v.z === 100/2, '.setMomentum should update velocity');

        t.end();
    });

    t.test('orientation prototypal methods', function(t) {
        t.assert(p.getOrientation instanceof Function, '.getOrientation should be a function');
        t.assert(p.setOrientation instanceof Function, '.setOrientation should be a function');

        var ref = new Quaternion(1,2,3,4);
        ref.normalize();
        var q = p.orientation;
        p.setOrientation(1,2,3,4);
        t.assert(p.getOrientation() === q, '.getOrientation should return the orientation quaternion');
        t.assert(q.w === ref.w && q.x === ref.x && q.y === ref.y && q.z === ref.z, '.setOrientation should correctly set the orientation');

        t.end();
    });

    t.test('angular velocity prototypal methods', function(t) {
        t.assert(p.getAngularVelocity instanceof Function, '.getAngularVelocity should be a function');
        t.assert(p.setAngularVelocity instanceof Function, '.setAngularVelocity should be a function');

        var I = new Mat33([1,2,3,2,5,51,3,51,9]);
        p.inverseInertia = Mat33.inverse(I, new Mat33());
        var w = p.angularVelocity;
        p.setAngularVelocity(15,-20,35);
        t.assert(p.getAngularVelocity() === w, '.getAngularVelocity should return the angular velocity vector');
        t.assert(w.x === 15 && w.y === -20 && w.z === 35, '.setAngularVelocity should correctly set the angular velocity');
        var L = p.angularMomentum;
        var e = I.vectorMultiply(p.angularVelocity, new Vec3());
        t.assert(Math.abs(L.x - e.x) < 0.001 && Math.abs(L.y - e.y) < 0.001 && Math.abs(L.z - e.z) < 0.001, '.setAngularVelocity should update angular momentum');

        t.end();
    });

    t.test('angular momentum prototypal methods', function(t) {
        t.assert(p.getAngularMomentum instanceof Function, '.getAngularMomentum should be a function');
        t.assert(p.setAngularMomentum instanceof Function, '.setAngularMomentum should be a function');

        var I = new Mat33([1,2,3,2,5,51,3,51,9]);
        p.inverseInertia = Mat33.inverse(I, new Mat33());
        var L = p.angularMomentum;
        p.setAngularMomentum(13,-21,37);
        t.assert(p.getAngularMomentum() === L, '.getAngularMomentum should return the angular momentum vector');
        t.assert(L.x === 13 && L.y === -21 && L.z === 37, '.setAngularMomentum should correctly set the angular momentum');
        var w = p.angularVelocity;
        var e = p.inverseInertia.vectorMultiply(p.angularMomentum, new Vec3());
        t.assert(w.x === e.x && w.y === e.y && w.z === e.z, '.setAngularMomentum should update angular velocity');

        t.end();
    });

    t.test('force and torque prototypal methods', function(t) {
        t.assert(p.getForce instanceof Function, '.getForce should be a function');
        t.assert(p.setForce instanceof Function, '.setForce should be a function');
        t.assert(p.getTorque instanceof Function, '.getTorque should be a function');
        t.assert(p.setTorque instanceof Function, '.setTorque should be a function');

        var f = p.force;
        var tau = p.torque;
        p.setForce(1,2,3);
        p.setTorque(5,6,7);

        t.assert(p.getForce() === f, '.getForce should return the force vector');
        t.assert(p.getTorque() === tau, '.getTorque should return the torque vector');
        t.assert(f.x === 1 && f.y === 2 && f.z === 3, '.setForce should correctly set the force');
        t.assert(tau.x === 5 && tau.y === 6 && tau.z === 7, '.setTorque should correctly set the torque');

        t.end();
    });

    t.test('impulse prototypal methods', function(t) {
        t.assert(p.applyImpulse instanceof Function, '.applyImpulse should be a function');
        t.assert(p.applyAngularImpulse instanceof Function, '.applyAngularImpulse should be a function');

        var I = new Mat33([1,2,4,2,5,11,4,11,9]);
        p.inverseInertia = Mat33.inverse(I, new Mat33());

        p.setVelocity(1,2,3);
        var M = p.mass;
        var m = p.momentum;
        var v = p.velocity;
        p.applyImpulse(new Vec3(13,17,19));
        t.assert(m.x === 1*M+13 && m.y === 2*M+17 && m.z === 3*M+19, '.applyImpulse should add to momentum correctly');
        t.assert(v.x === 1+13/M && v.y === 2+17/M && v.z === 3+19/M, '.applyImpulse should update velocity correctly');

        p.setAngularVelocity(2,3,1);
        var l = I.vectorMultiply(p.angularVelocity, new Vec3());
        var ngimpulse = new Vec3(15,6,8);
        var e = p.inverseInertia.vectorMultiply(ngimpulse, new Vec3());
        p.applyAngularImpulse(ngimpulse);
        var L = p.angularMomentum;
        var w = p.angularVelocity;
        t.assert(L.x === l.x+15 && L.y === l.y+6 && L.z === l.z+8, '.applyAngularImpulse should add to angular momentum correctly');
        t.assert(Math.abs(w.x-e.x-2) < 0.0001 && Math.abs(w.y-e.y-3) < 0.0001 && Math.abs(w.z-e.z-1) < 0.0001, '.applyAngularImpulse should add update angular velocity correctly');

        t.end();
    });

    t.test('support prototypal method', function (t) {
        t.assert(p.support instanceof Function, '.support should be a function');
        var d = new Vec3(5,3,7);
        var v = p.support(d);

        t.assert(v.x === 0 && v.y === 0 && v.z === 0, '.support should return the zero vector');

        t.end();
    });

    t.end();
});
