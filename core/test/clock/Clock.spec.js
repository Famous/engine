'use strict';

var test = require('tape');
var Clock = require('../../Clock');
var api = require('./Clock.api');

test('Clock class', function(t) {

    t.test('Clock constructor' , function(t) {
        t.ok(Clock, 'There should be a node module');
        t.equal(Clock.constructor, Function, 'Clock should be a function');

        t.doesNotThrow(function () {
            return new Clock();
        }, 'Clock should be callable with new');

        t.equal((new Clock()).constructor, Clock, 'Clock should be a constructor function');

        var node = new Clock();

        api.forEach(function (method) {
            t.ok(
                node[method] && node[method].constructor === Function,
                'Clock should have a ' + method + ' method'
            );
        });

        t.end();
    });

    t.test('step method', function(t) {
        var clock = new Clock();

        t.equal(clock.step(123), clock, 'clock.step should be chainable');
        t.equal(clock.now(), 123, 'clock.step should update internal time');
        
        t.doesNotThrow(function () {
            clock.step(122);
        }, 'clock.step backwards should not throw an error');
        
        t.end();
    });

    t.test('getTime method', function(t) {
        var clock = new Clock();
        t.equal(clock.getTime, clock.now, 'clock.getTime should be an alias for clock.now');

        t.end();
    });
    
    t.test('now method', function(t) {
        var clock = new Clock();
        clock.step(123);
        t.equal(clock.now(), 123, 'clock.now should return internal time');
        
        t.end();
    });

    t.test('setTimeout method', function(t) {

        t.test('basic', function(t) {
            t.plan(5);

            var clock = new Clock();
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
        
        t.test('multiple sequential functions', function(t) {
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
        
        t.test('order of invokcation', function(t) {
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

    });
    
    t.test('clearTimer method', function(t) {
        var clock = new Clock();
        
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

        t.equal(clock.getScale(), 1, 'Clock should be initialized with a time scale of 1 (real time)');

        clock.step(120);
        t.equal(clock.now(), 120);

        clock.setScale(0.5);

        t.equal(clock.getScale(), 0.5);
        
        t.equal(clock.now(), 120, 'clock.setScale should not affect time set beforehand');

        clock.step(150);
        t.equal(clock.now(), 135, 'clock.setScale should scale time difference to next step');

        clock.step(210);
        t.equal(clock.now(), 165, 'clock.setScale should scale time difference to next step');

        clock.setScale(1);
        t.equal(clock.getScale(), 1, 'clock.getScale should return set scale');

        clock.step(220);
        t.equal(clock.now(), 175, 'clock.step after resetting the scale should preserve previous time scale');

        t.end();
    });
    
    t.test('getFrame method', function(t) {
        var clock = new Clock();
        
        t.equal(clock.getFrame(), 0, 'clock.getFrame should initially return 0');
        
        clock.step();
        t.equal(clock.getFrame(), 1, 'clock.getFrame should return 1 after initial step');
        
        clock.step();
        t.equal(clock.getFrame(), 2, 'clock.step should increment value returned by clock.getFrame');
        
        t.end();
    });
    
});
