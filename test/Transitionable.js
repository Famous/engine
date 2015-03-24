'use strict';

var test = require('tape');
var Transitionable = require('../src/Transitionable');

var time = 0;
var _now = Date.now;

test('Transitionable', function(t) {
    t.test('set up', function(t) {
        time = 0;
        Date.now = function() {
            return time;
        };
        t.end();
    });

    t.test('constructor', function(t) {
        t.equal(typeof Transitionable, 'function', 'Transitionable should be a function');

        var args = [ undefined, 2, [1, 2], [1, 2, 3] ];

        t.doesNotThrow(function() {
            args.forEach(function(arg) {
                new Transitionable(arg);
            });
        }, 'Transitionable constructor should not throw an error');

        args.forEach(function(arg) {
            var transitionable = new Transitionable(arg);
            t.equal(transitionable.get(), arg, 'Transitionable constructor should set intial state');
        });

        t.end();
    });

    t.test('set method', function(t) {
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
        transitionable.set(4, { duration: 500 }, callback);
        time = 510;
        transitionable.set(4, undefined, callback);
        time = 550;
        transitionable.set(0);
    });

    t.test('reset method', function(t) {
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.reset, 'function', 'transitionable.reset should be a function');

        transitionable.set(0);
        transitionable.set(1, { duration: 500 });
        transitionable.reset();
        t.equal(transitionable.get(), undefined, 'Transitionable.reset should reset state if transition is active');

        t.end();
    });

    t.test('delay method', function(t) {
        t.plan(3);
        var transitionable = new Transitionable();
        t.equal(typeof transitionable.delay, 'function', 'transitionable.delay should be a function');

        // TODO test callback

        transitionable.set(0);
        transitionable.delay(500);
        t.equal(transitionable.get(), 0, 'transitionable.delay should delay the execution of the action queue');
        transitionable.set(1);
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
            transitionable.set(1, { transition: 500 });
            time = 250;
            t.equal(transitionable.get(), 0.5);
        });

        t.test('array timestamp', function(t) {
            t.plan(1);
            var transitionable = new Transitionable();
            time = 0;
            transitionable.set([0, 0, 0]);
            transitionable.set([1, 1, 1], { transition: 500 });
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

    t.test('halt method', function(t) {
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
        t.plan(2);
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
        transitionable.get();
        t.ok(test1)
        time = 1000;
        transitionable.get();
        t.ok(test2);
    });

    t.test('setting a value multiple times', function(t) {
        t.plan(1);
        time = 0;
        var transitionable = new Transitionable(0);
        var test1 = false;
        var test2 = false;

        function testFunction() {
            transitionable.set(1, {curve: 'linear', duration: 500}, function() {
                transitionable.set(0, {curve: 'linear', duration: 500});
            });    
        }
        
        testFunction();
        time = 500;
        transitionable.get(); // To call the callback
        time = 1000;
        testFunction();
        time = 1500;
        transitionable.get(); // To call the callback
        time = 2000;
        t.ok(transitionable.get() === 0);

    });

    t.test('tear down', function(t) {
        Date.now = _now;
        t.end();
    });
});
