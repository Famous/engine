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

var Gravity3D = require('../../forces/Gravity3D');
var Force = require('../../forces/Force');
var Particle = require('../../bodies/Particle');
var Vec3 = require('../../../math/Vec3');
var test = require('tape');

function vec3sAreEqual(a,b) {
    return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001 && Math.abs(a.z - b.z) < 0.001;
}

test('Gravity3D', function(t) {
    var p1 = new Particle({mass:1000});
    var p2 = new Particle({mass: 22});
    p2.setPosition(10,20,30);
    var g = new Gravity3D(p1, p2, {strength: 123});

    t.test('should extend Force', function(t) {
        t.assert(Gravity3D instanceof Function, 'Gravity3D should be a constructor');

        t.assert(g instanceof Gravity3D && g instanceof Force, 'constructed objects should be instances of Force');

        t.end();
    });

    t.test('init prototypal method', function(t) {
        t.assert(g.init instanceof Function, '.init should be a function');

        t.assert(g.strength === 123, '.init should set .strength correctly');

        t.end();
    });

    t.test('update prototypal method', function(t) {
        t.assert(g.update instanceof Function, '.update should be a function');

        g.update();

        var e = Vec3.subtract(p1.position, p2.position, new Vec3());
        e.normalize();
        var d = Math.sqrt(10*10+20*20+30*30);
        e.scale(123*1000*22/(d*d));

        t.assert(vec3sAreEqual(p2.force, e) && vec3sAreEqual(p1.force, e.invert()), '.update should apply forces correctly');

        t.end();
    });

    t.end();
});
