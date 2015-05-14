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

var time = 0;
var _now = Date.now;

var test = require('tape');
var Transitionable = require('../Transitionable');


test('Transitionable', function(t) {
    t.test('set up', function(t) {
        time = 0;
        Transitionable.Clock = {
            now: function() {
                return time;
            }
        };
        t.end();
    });

    t.test('constructor', function(t) {
        t.equal(typeof Transitionable, 'function', 'Transitionable should be a function');

        var args = [ 2, [1, 2], [1, 2, 3] ];

        t.doesNotThrow(function() {
            args.forEach(function(arg) {
                new Transitionable(arg);
            });
        }, 'Transitionable constructor should not throw an error');

        args.forEach(function(arg) {
            var transitionable = new Transitionable(arg);
            t.equal(transitionable.get(), arg, 'Transitionable constructor should set initial state');
        });

        t.end();
    });

    t.test('set method [deprecated]', function(t) {
        t.plan(6);
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.set, 'function', 'transitionable.set should be a function');

        transitionable.set(0);
        t.equal(transitionable.get(), 0, 'Transitionable.set should set state');

        transitionable.set(1);
        t.equal(transitionable.get(), 1, 'Transitionable.set should set state');

        transitionable.set(2);
        t.equal(transitionable.get(), 2, 'Transitionable.set should set state');

        var callback = function() {
            t.pass('Transitionable.set should accept and invoke callback function');
        };

        time = 0;
        transitionable.set(0, null, callback);
        time = 10;
        transitionable.set(4, { duration: 500 }, callback);
        time = 550;
        transitionable.get();
    });

    t.test('reset method [deprecated]', function(t) {
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.reset, 'function', 'transitionable.reset should be a function');

        transitionable.set(0);
        transitionable.set(1, { duration: 500 });
        transitionable.reset(1);
        t.equal(transitionable.get(), 1, 'Transitionable.reset should reset state if transition is active');

        t.end();
    });

    t.test('delay method', function(t) {
        t.plan(3);
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.delay, 'function', 'transitionable.delay should be a function');

        transitionable.from(0);
        transitionable.delay(500);
        t.equal(transitionable.get(), 0, 'transitionable.delay should delay the execution of the action queue');
        transitionable.from(1);
        t.equal(transitionable.get(500), 1, 'transitionable.delay should delay the execution of the action queue');
    });

    t.test('get method', function(t) {
        t.test('existence', function(t) {
            t.plan(1);
            var transitionable = new Transitionable();
            t.equal(typeof transitionable.get, 'function', 'transitionable.get should be a function');
        });

        t.test('number', function(t) {
            t.plan(2);
            var transitionable = new Transitionable();
            transitionable.set(4);
            t.equal(transitionable.get(), 4, 'transitionable.get should return previously set value');
            transitionable.set(2);
            t.equal(transitionable.get(), 2, 'transitionable.get should return previously set value');
        });

        t.test('array', function(t) {
            t.plan(2);
            var transitionable = new Transitionable();
            transitionable.set([1, 2]);
            t.deepEqual(transitionable.get(), [1, 2], 'transitionable.get should return previously set value');
            transitionable.set([3, 4]);
            t.deepEqual(transitionable.get(), [3, 4], 'transitionable.get should return previously set value');
        });

        t.test('number timestamp', function(t) {
            t.plan(1);
            var transitionable = new Transitionable();
            time = 0;
            transitionable.set(0);
            transitionable.set(1, { duration: 500 });
            time = 250;
            t.equal(transitionable.get(), 0.5);
        });

        t.test('array timestamp', function(t) {
            t.plan(1);
            var transitionable = new Transitionable();
            time = 0;
            transitionable.set([0, 0, 0]);
            transitionable.set([1, 1, 1], { duration: 500 });
            time = 250;
            t.deepEqual(transitionable.get(), [0.5, 0.5, 0.5]);
        });
    });

    t.test('isActive method', function(t) {
        t.plan(4);
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.isActive, 'function', 'transitionable.isActive should be a function');

        t.equal(transitionable.isActive(), false, 'transitionable.isActive should return false if transition is not active');

        transitionable.set(1, { duration: 100 });
        t.equal(transitionable.isActive(), true, 'transitionable.isActive should return true if transition is active');

        transitionable.halt();
        t.equal(transitionable.isActive(), false, 'transitionable.isActive should return false if transition is not active');
    });

    t.test('halt method #1', function(t) {
        t.plan(4);
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.halt, 'function', 'transitionable.halt should be a function');

        time = 0;
        transitionable.set(0);
        transitionable.set(1, { duration: 500 });
        time = 250;
        t.equal(transitionable.get(), 0.5);
        transitionable.halt();
        time = 600;
        t.equal(transitionable.isActive(), false, 'transitionable should not be active after transition has been halted');
        t.equal(transitionable.get(), 0.5, 'transitionable state should not change after transition has been halted');
    });

    t.test('halt method #2', function(t) {
        t.plan(2);
        time = 0;
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.halt, 'function', 'transitionable.halt should be a function');
        time = 0;
        transitionable.set([0, 0, 0]);
        time = 50;
        transitionable.set([1, 2, 3], { duration: 100 });
        time = 50;
        transitionable.halt();
        var value1 = transitionable.get();
        var value2 = transitionable.get();
        t.deepEqual(value1, value2);
    });

    t.test('callback', function(t) {
        t.plan(1);
        time = 0;
        var transitionable = new Transitionable(0);
        var test = false;
        transitionable.set(1, {curve: 'linear', duration: 500}, function() {
            test = true;
        });

        time = 501;
        transitionable.get();
        t.ok(test);
    });

    t.test('setting a value inside of a callback', function(t) {
        t.plan(5);
        time = 0;
        var transitionable = new Transitionable(0);
        var test1 = false;
        var test2 = false;
        transitionable.set(1, {curve: 'linear', duration: 500}, function() {
            test1 = true;
            transitionable.set(2);
            transitionable.set(3, {curve: 'linear', duration: 500}, function() {
                test2 = true;
            });
        });

        time = 500;
        t.equal(transitionable.get(), 1);
        t.equal(transitionable.get(), 2);
        t.ok(test1);
        time = 1000;
        t.equal(transitionable.get(), 3);
        t.ok(test2);
    });

    t.test('setting a value multiple times', function(t) {
        time = 0;
        var transitionable = new Transitionable(0);

        function testFunction() {
            transitionable.set(1, {curve: 'linear', duration: 500}, function() {
                transitionable.set(0, {curve: 'linear', duration: 500});
            });
        }

        testFunction();
        time = 500;
        t.equal(transitionable.get(), 1); // To call the callback
        time = 1000;
        testFunction();
        time = 1500;
        transitionable.get(); // To call the callback
        time = 2000;
        t.equal(transitionable.get(), 0);

        t.end();
    });

    t.test('continous polling', function(t) {
        var transitionable = new Transitionable();
        time = 0;
        transitionable.from(0)
            .to(100, 'linear', 100)
            .to(200, 'linear', 100)
            .to(300, 'linear', 100);

        time = 0;
        t.equal(transitionable.get(), 0);

        time = 100;
        t.equal(transitionable.get(), 100);

        time = 200;
        t.equal(transitionable.get(), 200);

        time = 300;
        t.equal(transitionable.get(), 300);

        t.end();
    });

    t.test('inconsistent polling', function(t) {
        t.plan(11);

        var transitionable = new Transitionable();
        time = 0;
        transitionable.from(0)
            .to(100, 'linear', 100, function() {
                t.equal(time, 100);
                t.pass();
            })
            .to(200, 'linear', 100, function() {
                t.equal(time, 400);
                t.pass();
            })
            .to(300, 'linear', 100, function() {
                t.pass();
                t.equal(time, 400);
            })
            .to(400, 'linear', 100, function() {
                t.pass();
                t.equal(time, 400);
            });

        time = 0;
        t.equal(transitionable.get(), 0);

        time = 100;
        t.equal(transitionable.get(), 100);

        time = 400;
        t.equal(transitionable.get(), 400);

        t.end();
    });

    t.test('pausing transitions', function(t) {
        var transitionable = new Transitionable();
        time = 0;
        transitionable.from(0).to(1, 'linear', 1000);

        time = 500;
        t.equal(transitionable.get(), 0.5);
        transitionable.pause();
        t.equal(transitionable.get(), 0.5);
        t.equal(transitionable.isPaused(), true);

        time = 750;
        t.equal(transitionable.get(), 0.5);
        t.equal(transitionable.isPaused(), true);

        transitionable.resume();

        time = 750;
        t.equal(transitionable.get(), 0.5);
        t.equal(transitionable.isPaused(), false);

        time = 1250;
        t.equal(transitionable.get(), 1);
        t.equal(transitionable.isPaused(), false);

        t.end();
    });

    t.test('override method', function(t) {
        var transitionable = new Transitionable();
        time = 0;
        transitionable.from(0).to(1, null, 1000);
        time = 500;
        t.equal(transitionable.get(), 0.5);
        transitionable.override(2);
        time = 1000;
        t.equal(transitionable.get(), 2);
        t.end();
    });

    t.test('to method slerp', function(t) {
        var transitionable = new Transitionable();
        time = 0;
        transitionable.from([0,0,0,1]).to([Math.sqrt(2)/2,0,Math.sqrt(2)/2,0], null, 1000, null, 'slerp');
        time = 500;
        var x = Math.sin(Math.PI/4)*Math.sqrt(2)/2;
        var z = x;
        var w = Math.cos(Math.PI/4);
        var tr = transitionable.get();
        t.assert(Math.abs(tr[0] - x) < 0.001 &&
            Math.abs(tr[1] - 0) < 0.001 &&
            Math.abs(tr[2] - z) < 0.001 &&
            Math.abs(tr[3] - w) < 0.001);
        time = 1000;
        t.deepEqual(transitionable.get(), [Math.sqrt(2)/2,0,Math.sqrt(2)/2,0]);
        t.end();
    });

    t.test('to method batch', function(t) {
        var start = {a:[0,0,0], b: 0, c: {x:0, y:0}, d: 'asdf'};
        var transitionable = new Transitionable(start);
        time = 0;
        transitionable.to({a:[10,20,30], b: -10, c: {x:10, y:-10}}, null, 1000);
        time = 500;
        var s = transitionable.get();
        t.equal(s, start);
        t.deepEqual(s, start);
        t.deepEqual(s, {a:[5,10,15], b: -5, c: {x:5, y:-5}, d: 'asdf'});
        time = 1000;
        s = transitionable.get();
        t.deepEqual(s, start);
        t.deepEqual(s, {a:[10,20,30], b: -10, c: {x:10, y:-10}, d: 'asdf'});
        t.end();
    });

    t.test('tear down', function(t) {
        Date.now = _now;
        t.end();
    });
});
