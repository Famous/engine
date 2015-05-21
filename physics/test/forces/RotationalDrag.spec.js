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

var RotationalDrag = require('../../forces/RotationalDrag');
var Force = require('../../forces/Force');
var Box = require('../../bodies/Box');
var Vec3 = require('../../../math/Vec3');
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
