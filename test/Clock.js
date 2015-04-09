'use strict';

var test = require('tape');
var Clock = require('../src/Clock');

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
        var timerFunctions = [];
        var time = 0;
        var i;
        for (i = 10; i < 20; i++) {
            clock.setTimeout(function(i) {
                if (time < i) {
                    t.fail(i + '. timeout function has been invoked at ' + time);
                }
            }.bind(null, i), i);
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
            } else {
                t.pass('clock.setTimeout invoked first scheduled timer function before second one');
            }
            first = true;
        }, 10);
        clock.setTimeout(function() {
            if (!first) {
                t.fail('clock.setTimeout invoked second scheduled timer function before first one');
            } else {
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
});
