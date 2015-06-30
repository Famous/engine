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

var test = require('tape');
var api = require('./Opacity.api');
var Opacity = require('../../Opacity');
var OpacityStub = require('./Opacity.stub');

test('Opacity class', function (t) {

    t.test('Opacity constructor' , function (t) {
        t.ok(Opacity, 'There should be a transform module');
        t.equal(Opacity.constructor, Function, 'Opacity should be a function');

        t.doesNotThrow(function () {
            return new Opacity();
        }, 'Opacity should be callable with new');

        t.doesNotThrow(function () {
            return new Opacity(new OpacityStub());
        }, 'Opacity should be callable with new and another transform as an argument');

        t.equal((new Opacity()).constructor, Opacity, 'Opacity should be a constructor function');

        var transform = new Opacity();

        api.forEach(function (method) {
            t.ok(
                transform[method] && transform[method].constructor === Function,
                'Opacity should have a ' + method + ' method'
            );
        });

        t.equal(Opacity.WORLD_CHANGED, 1, 'Opacity should have a static property WORLD_CHANGED that equals 1');
        t.equal(Opacity.LOCAL_CHANGED, 2, 'Opacity should have a static property LOCAL_CHANGED that equals 2');

        var parent = new OpacityStub();
        transform = new Opacity(parent);

        t.equal(transform.getParent(), parent, 'Opacity constructor should have its parent set to the first argument');

        t.notOk(transform.isBreakPoint(), 'Transforms should not be a breakpoint by default');

        t.end();
    });

    t.test('calculate', function (t) {
        var opacities = [];

        var opacity;

        for (var i = 0; i < 5; i++) {
            opacity = new Opacity(opacities[i - 1]);

            opacities.push(opacity);
            opacity.setOpacity(0.5);
        }

        t.test('Root Opacity (no breakpoint): 0.5', function(t) {
            t.equal(
                opacities[0].calculate(), Opacity.LOCAL_CHANGED & ~Opacity.WORLD_CHANGED,
                'Calculating the root opacity should only change the local opacity'
            );
            t.equal(
                opacities[0].getLocalOpacity(), 0.5,
                'The root local opacity should be set to 0.5'
            );

            t.equal(
                opacities[0].getOpacity(), 0.5,
                'The root opacity should still be set to 0.5 after calculation'
            );
            t.throws(
                function() {
                    opacities[0].getWorldOpacity();
                },
                /not calculating world transforms/,
                'Attempting to get the world opacity of the root opacity should throw an error, since no breakpoint has been set on it'
            );

            t.end();
        });

        t.test('2nd Opacity (no breakpoint): 0.5', function(t) {
            t.equal(
                opacities[1].calculate(), Opacity.LOCAL_CHANGED & ~Opacity.WORLD_CHANGED,
                'Calculating the 2nd opacity (child of root) should only change the local opacity, since no breakpoint has been set on it'
            );
            t.equal(
                opacities[1].getLocalOpacity(), 0.25,
                'The 2nd opacity should have been multiplied with the root opacity'
            );

            t.equal(
                opacities[1].getOpacity(), 0.5,
                'The 2nd opacity should still be set to 0.5 after calculation'
            );
            t.throws(
                function() {
                    opacities[1].getWorldOpacity();
                },
                /not calculating world transforms/,
                'Attempting to get the world opacity of the 2nd opacity should throw an error, since no breakpoint has been set on it'
            );

            t.end();
        });

        t.test('3rd Opacity (no breakpoint): 0.5', function(t) {
            t.equal(
                opacities[2].calculate(), Opacity.LOCAL_CHANGED & ~Opacity.WORLD_CHANGED,
                'Calculating the 3rd opacity should only change the local opacity, since no breakpoint has been set on it'
            );
            t.equal(
                opacities[2].getLocalOpacity(), 0.125,
                'The 3rd opacity should have been multiplied with the root and 2nd opacity'
            );

            t.equal(
                opacities[2].getOpacity(), 0.5,
                'The 3rd opacity should still be set to 0.5 after calculation'
            );
            t.throws(
                function() {
                    opacities[2].getWorldOpacity();
                },
                /not calculating world transforms/,
                'Attempting to get the world opacity of the 3rd opacity should throw an error, since no breakpoint has been set on it'
            );

            t.end();
        });

        t.test('4th Opacity (breakpoint): 0.5', function(t) {
            opacities[3].setBreakPoint();
            t.equal(
                opacities[3].calculate(), Opacity.LOCAL_CHANGED | Opacity.WORLD_CHANGED,
                'Calculating the 4th opacity should have checked if the world opacity changed, since it has a breakpoint set on it'
            );

            t.equal(
                opacities[3].isBreakPoint(), true,
                'The 4th opacity should still have breakpoint after calculation'
            );
            t.equal(
                opacities[3].getLocalOpacity(), 0.0625,
                'The 4th local opacity should have been multiplied with the root, 2nd and 3rd opacity'
            );
            t.equal(
                opacities[3].getOpacity(), 0.5,
                'The 4th opacity should still be set to 0.5 after calculation'
            );
            t.doesNotThrow(function() {
                opacities[3].getWorldOpacity();
            }, 'Attempting to calculate the world on the 4th opacity should not throw an error, since a breakpoint has been set on it');

            t.equal(
                opacities[3].getWorldOpacity(), 0.0625,
                'The 4th world opacity should be have been multiplied with all previous opacities'
            );

            t.end();
        });

        t.test('5th Opacity (no breakpoint): 0.5', function(t) {
            t.equal(
                opacities[4].calculate(), Opacity.LOCAL_CHANGED & ~Opacity.WORLD_CHANGED,
                'Calculating the 5th opacity should only change the local opacity, since no breakpoint has been set on it'
            );
            t.equal(
                opacities[4].getLocalOpacity(), 0.5,
                'The 5th local opacity should be equivalent to the opacity set on it, it should not have been multiplied, since the 4th node has a breakpoint set on it'
            );

            t.equal(
                opacities[4].getOpacity(), 0.5,
                'The 5th opacity should still be set to 0.5 after calculation'
            );

            t.throws(
                function() {
                    opacities[4].getWorldOpacity();
                },
                /not calculating world transforms/,
                'Attempting to get the world opacity of the 4th opacity should throw an error, since no breakpoint has been set on it'
            );

            t.end();
        });
    });
});
