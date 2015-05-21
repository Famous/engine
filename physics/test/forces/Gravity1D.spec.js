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

var Gravity1D = require('../../forces/Gravity1D');
var Force = require('../../forces/Force');
var Vec3 = require('../../../math/Vec3');
var test = require('tape');

test('Gravity1D', function(t) {
    var g = new Gravity1D();

    t.test('should extend Force', function(t) {
        t.assert(Gravity1D instanceof Function, 'Gravity1D should be a constructor');

        t.assert(g instanceof Gravity1D && g instanceof Force, 'constructed objects should be instances of Force');

        t.end();
    });

    t.test('init prototypal method', function(t) {
        t.assert(g.init instanceof Function, '.init should be a function');

        var a = new Vec3(100,100,100);
        var g1 = new Gravity1D([], {acceleration: a});
        t.assert(g1.direction === -1 && g1.acceleration === a && Math.abs(g1.strength - a.length()) < 0.001, '.init should set .direction and .strength correctly when .acceleration is explicitly specified');

        var g2 = new Gravity1D([], {strength: 235, direction: Gravity1D.UP});
        t.assert(g2.acceleration.x === 0 && g2.acceleration.y === -235 && g2.acceleration.z === 0, '.init should set .acceleration correctly when .strength and .direction are specified');

        t.end();
    });

    t.test('update prototypal method', function(t) {
        t.assert(g.update instanceof Function, '.update should be a function');
        var v = new Vec3();
        var dummy = {
            mass: 11,
            applyForce: function(f) {
                v.copy(f);
            }
        };
        var grav = new Gravity1D(dummy, {acceleration: new Vec3(1,-2,3)});

        grav.update();
        t.assert(v.x === 1*11 && v.y === 11*-2 && v.z === 11*3, '.update should apply forces correctly');

        t.end();
    });

    t.end();
});
