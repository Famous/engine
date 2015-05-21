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

var Angle = require('../../constraints/Angle');
var Constraint = require('../../constraints/Constraint');
var Box = require('../../bodies/Box');
var Vec3 = require('../../../math/Vec3');
var test = require('tape');

test('Angle', function(t) {
    var a = new Box({size:[10,10,10]});
    a.setOrientation(0,1,0,0);
    var b = new Box({size:[10,10,10]});
    var ng = new Angle(a,b);

    t.test('should extend Force', function(t) {
        t.assert(Angle instanceof Function, 'Angle should be a constructor');

        t.assert(ng instanceof Angle && ng instanceof Constraint, 'constructed objects should be instances of Constraint');

        t.end();
    });

    t.test('init method', function(t) {
        t.assert(ng.init instanceof Function, '.init should be a function');
        t.assert(ng.cosAngle === 0, '.init should correctly set .cosAngle');
        a.setOrientation(1,0,0,0);
        ng.init();
        t.assert(ng.cosAngle === 1, '.init should correctly set .cosAngle');

        t.end();
    });

    t.test('update method', function(t) {
        ng.angularImpulse.set(1,0,0);
        ng.update();
        b.applyAngularImpulse(new Vec3(-1,0,0));
        a.applyAngularImpulse(new Vec3(1,0,0));
        t.assert(b.angularVelocity.x === 0, '.update should warm start the constraint');
        t.assert(a.angularVelocity.x === 0, '.update should warm start the constraint');

        t.end();
    });

    t.test('resolve method', function(t) {
        a.setAngularVelocity(1,1,1);
        b.setAngularVelocity(0,-1,0);

        ng.resolve();
        var aw = a.angularVelocity;
        var bw = b.angularVelocity;
        t.assert(aw.x === bw.x && aw.y === bw.y && aw.z === bw.z, '.resolve should solve the constraint');

        var x = ng.angularImpulse.x;
        var y = ng.angularImpulse.y;
        var z = ng.angularImpulse.z;

        ng.resolve();
        t.assert(aw.x === bw.x && aw.y === bw.y && aw.z === bw.z, '.resolve on a solved constraint should not disturb the constraint');
        t.assert(x === ng.angularImpulse.x && y === ng.angularImpulse.y && z === ng.angularImpulse.z, '.resolve on a solved constraint should not add to the total applied impulse');

        t.end();
    });
});
