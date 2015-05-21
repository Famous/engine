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

var BallAndSocket = require('../../constraints/BallAndSocket');
var Constraint = require('../../constraints/Constraint');
var Box = require('../../bodies/Box');
var Vec3 = require('../../../math/Vec3');
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('BallAndSocket', function(t) {
    var a = new Box({size:[100,100,100], position: new Vec3(0,0,0)});
    var b = new Box({size:[100,100,100], position: new Vec3(100,100,0)});
    var d = new BallAndSocket(a,b, {anchor: new Vec3(0,100,0), axis: new Vec3(0,0,1)});

    t.test('should extend Constraint', function(t) {
        t.assert(BallAndSocket instanceof Function, 'BallAndSocket should be a constructor');

        t.assert(d instanceof BallAndSocket && d instanceof Constraint, 'constructed objects should be instances of Constraint');

        t.end();
    });

    t.test('init method', function(t) {
        t.assert(d.init instanceof Function, '.init should be a function');

        t.end();
    });

    t.test('update method', function(t) {
        d.impulse = new Vec3(10,10,10);
        d.angImpulseA = new Vec3(13,13,13);
        d.angImpulseB = new Vec3(13,13,13);
        d.update(100, 60/1000);
        b.applyImpulse(new Vec3(-10,-10,-10));
        a.applyImpulse(new Vec3(10,10,10));
        b.applyAngularImpulse(new Vec3(-13,-13,-13));
        a.applyAngularImpulse(new Vec3(-13,-13,-13));
        t.assert(vec3sAreEqual(b.velocity, new Vec3()), '.update should warm start the constraint');
        t.assert(vec3sAreEqual(a.velocity, new Vec3()), '.update should warm start the constraint');
        t.assert(vec3sAreEqual(b.angularVelocity, new Vec3()), '.update should warm start the constraint');
        t.assert(vec3sAreEqual(a.angularVelocity, new Vec3()), '.update should warm start the constraint');

        t.end();
    });

    t.test('resolve method', function(t) {
        a.setVelocity(200,0,0);
        b.setVelocity(0,0,0);
        a.setAngularVelocity(0,0,0);
        b.setAngularVelocity(0,0,0);
        d.resolve();

        var c;
        c = Vec3.cross(a.angularVelocity, d.rA, new Vec3()).add(a.velocity)
        .subtract(Vec3.cross(b.angularVelocity, d.rB, new Vec3()).add(b.velocity));
        t.assert(vec3sAreEqual(c, new Vec3()), '.resolve should solve the constraint');

        var impulse = Vec3.clone(d.impulse);
        var angImpulseA = Vec3.clone(d.angImpulseA);
        var angImpulseB = Vec3.clone(d.angImpulseB);

        d.resolve();
        d.resolve();
        d.resolve();
        d.resolve();
        d.resolve();
        d.resolve();
        c = Vec3.cross(a.angularVelocity, d.rA, new Vec3()).add(a.velocity)
        .subtract(Vec3.cross(b.angularVelocity, d.rB, new Vec3()).add(b.velocity));
        t.assert(vec3sAreEqual(c, new Vec3()), 'subsequent calls to .resolve should not disturb the constraint');
        t.assert(vec3sAreEqual(impulse, d.impulse), '.resolve on a solved constraint should not add noticeably to the total applied impulse');
        t.assert(vec3sAreEqual(angImpulseA, d.angImpulseA), '.resolve on a solved constraint should not add noticeably to the total applied impulse');
        t.assert(vec3sAreEqual(angImpulseB, d.angImpulseB), '.resolve on a solved constraint should not add noticeably to the total applied impulse');

        t.end();
    });
});
