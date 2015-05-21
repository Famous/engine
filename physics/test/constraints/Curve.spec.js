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

var Curve = require('../../constraints/Curve');
var Constraint = require('../../constraints/Constraint');
var Box = require('../../bodies/Box');
var Vec3 = require('../../../math/Vec3');
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.1 && Math.abs(a.y - b.y) < 0.1 && Math.abs(a.z - b.z) < 0.1;
}

test('Curve', function(t) {
    var a = new Box({size:[100,100,100], position: new Vec3(101,0,0)});
    var d = new Curve(a, {
        equation1: function(x,y,z) {
            return x*x + y*y - 10000;
        },
        equation2: function(x,y,z) {
            return z;
        },
        period: 0.001
    });

    t.test('should extend Constraint', function(t) {
        t.assert(Curve instanceof Function, 'Curve should be a constructor');

        t.assert(d instanceof Curve && d instanceof Constraint, 'constructed objects should be instances of Constraint');

        t.end();
    });

    t.test('init method', function(t) {
        t.assert(d.init instanceof Function, '.init should be a function');

        t.assert(d.stiffness === 4 * Math.PI * Math.PI / (d.period * d.period), '.init should set .stiffness');
        t.assert(d.damping === 4 * Math.PI * d.dampingRatio / d.period, '.init should set .damping');

        t.end();
    });

    t.test('update method', function(t) {
        d.impulses[a._ID] = 7;

        a.applyImpulse(new Vec3(-7,0,0));
        d.update(100, 60/1000);
        t.assert(vec3sAreEqual(a.velocity, new Vec3()), '.update should warm start the constraint');

        t.end();
    });

    t.test('resolve method', function(t) {
        var EPSILSON = 1e-7;
        var x = a.position.x;
        var y = a.position.y;
        var z = a.position.z;

        var f = d.equation1;
        var g = d.equation2;

        var f0 = f(x, y, z);
        var dfx = (f(x + EPSILSON, y, z) - f0) / EPSILSON;
        var dfy = (f(x, y + EPSILSON, z) - f0) / EPSILSON;
        var dfz = (f(x, y, z + EPSILSON) - f0) / EPSILSON;

        var g0 = g(x, y, z);
        var dgx = (g(x + EPSILSON, y, z) - g0) / EPSILSON;
        var dgy = (g(x, y + EPSILSON, z) - g0) / EPSILSON;
        var dgz = (g(x, y, z + EPSILSON) - g0) / EPSILSON;

        var n = new Vec3(dfx + dgx, dfy + dgy, dfz + dgz);

        a.setVelocity(10,50,0);

        d.resolve();

        t.assert(Math.abs(a.velocity.dot(n) < 0.1), '.resolve should solve the constraint');

        var impulse = d.impulses[a._ID];

        d.resolve();
        d.resolve();
        d.resolve();

        console.log(impulse, d.impulses[a._ID]);

        t.assert(Math.abs(a.velocity.dot(n) < 0.1), 'subsequent calls to .resolve should not disturb the constraint');
        t.assert(Math.abs(impulse - d.impulses[a._ID]), '.resolve on a solved constraint should not add noticeably to the total applied impulse');
        t.end();
    });
});
