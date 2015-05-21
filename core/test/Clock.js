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
var Clock = require('../Clock');

test('Clock', function(t) {
    t.test('constructor', function(t) {
        t.plan(1);
        t.doesNotThrow(function() {
            new Clock();
        }, 'Clock constructor should not be a function');
    });

    t.test('step method', function(t) {
        t.plan(3);
        var clock = new Clock();
        t.equal(typeof clock.step, 'function', 'clock.step should be a function');

        t.equal(clock.step(123), clock, 'clock.step should be chainable');
        t.equal(clock.getTime(), 123, 'clock.step should update internal time');
    });

    t.test('getTime method', function(t) {
        t.plan(1);
        t.equal(typeof (new Clock()).getTime, 'function', 'clock.getTime should be a function');
    });

    t.test('now method', function(t) {
        t.plan(1);
        t.equal(typeof (new Clock()).now, 'function', 'clock.now should be a function');
    });

    t.test('getFrame method', function(t) {
        t.plan(1);
        t.equal(typeof (new Clock()).getFrame, 'function', 'clock.getFrame should be a function');
    });

    t.test('setTimeout method (basic)', function(t) {
        t.plan(6);
        var clock = new Clock();
        t.equal(typeof clock.setTimeout, 'function', 'clock.setTimeout should be a function');
        var invoked = false;
        clock.setTimeout(function() {
            invoked = true;
        }, 1000);
        clock.step(500);
        t.equal(invoked, false, 'clock should not invoke passed in timer function after 500ms');
        clock.step(750);
        t.equal(invoked, false, 'clock should not invoke passed in timer function after 750ms');
        clock.step(1000);
        t.equal(invoked, true, 'clock should invoke passed in timer function after 1000ms');
        invoked = false;
        clock.step(1000);
        t.equal(invoked, false, 'clock should invoke passed in timer function only once');
        clock.step(1001);
        t.equal(invoked, false, 'clock should invoke passed in timer function only once');
    });

    t.test('setTimeout method (multiple sequential functions)', function(t) {
        var clock = new Clock();
        var time = 0;
        var i;
        function timer(i) {
            if (time < i) {
                t.fail(i + '. timeout function has been invoked at ' + time);
            }
        }
        for (i = 10; i < 20; i++) {
            clock.setTimeout(timer.bind(null, i), i);
        }
        for (i = 0; i < 20; i++) {
            time = i;
            clock.step(i);
        }
        t.end();
    });

    t.test('setTimeout method (order of invokcations)', function(t) {
        t.plan(2);
        var clock = new Clock();
        var first = false;
        var second = false;
        clock.setTimeout(function() {
            if (second) {
                t.fail('clock.setTimeout invoked second scheduled timer function before first one');
            }
            else {
                t.pass('clock.setTimeout invoked first scheduled timer function before second one');
            }
            first = true;
        }, 10);
        clock.setTimeout(function() {
            if (!first) {
                t.fail('clock.setTimeout invoked second scheduled timer function before first one');
            }
            else {
                t.pass('clock.setTimeout invoked first scheduled timer function before second one');
            }
            second = true;
        }, 10);
        clock.step(10);
        clock.step(12);
    });

    t.test('setInterval method (basic)', function(t) {
        t.plan(2);
        var clock = new Clock();
        t.equal(typeof clock.setInterval, 'function', 'clock.setInterval should be a function');
        var time = 0;
        var invocations = [];
        clock.setInterval(function() {
            invocations.push(time);
        }, 7);
        for (time = 0; time < 100; time++) {
            clock.step(time);
        }
        t.deepEqual(
            invocations,
            [ 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98 ],
            'callback should have been invoked every 7 steps'
        );
    });

    t.test('clearTimer function', function(t) {
        var clock = new Clock();
        t.equal(typeof clock.clearTimer, 'function', 'clock.clearTimer should be a function');
        var timeout = clock.setTimeout(function() {
            t.fail('clock.clearTimer should cancel future invocation of timer function');
        }, 100);
        var interval = clock.setInterval(function() {
            t.fail('clock.clearTimer should cancel future invocation of timer function');
        }, 100);

        clock.step(50);
        clock.clearTimer(timeout);
        clock.clearTimer(interval);
        clock.step(75);
        clock.step(100);
        clock.step(101);
        t.end();
    });

    t.test('setScale/ getScale method', function(t) {
        var clock = new Clock();
        t.equal(typeof clock.setScale, 'function', 'clock.setScale should be a function');
        t.equal(typeof clock.getScale, 'function', 'clock.getScale should be a function');

        clock.step(100);
        t.equal(clock.now(), 100);

        t.equal(clock.getScale(), 1, 'Clock should be initialized with a time scale of 1 (realtime)');

        clock.step(120);
        t.equal(clock.now(), 120);
        clock.setScale(0.5);
        t.equal(clock.getScale(), 0.5);
        t.equal(clock.now(), 120);

        clock.step(150);
        t.equal(clock.now(), 135);

        clock.step(210);
        t.equal(clock.now(), 165);

        clock.setScale(1);
        t.equal(clock.getScale(), 1);
        clock.step(220);
        t.equal(clock.now(), 175);

        t.end();
    });
});
