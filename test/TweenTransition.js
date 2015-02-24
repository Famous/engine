'use strict';

var time = 0;
Date.now = function() {
    return time;
};

var test = require('tape');
var TweenTransition = require('../src/TweenTransition');

test('TweenTransition', function(t) {
    t.test('constructor', function(t) {
        t.equal(typeof TweenTransition, 'function', 'TweenTransition should be a function');

        var args = [undefined, 2, [1, 2], [1, 2, 3]];

        t.doesNotThrow(function() {
            args.forEach(function(arg) {
                new TweenTransition(arg);
            });
        }, 'TweenTransition constructor should not throw an error');
        t.end();
    });

    t.test('set and get methods', function(t) {
        t.plan(4);
        var tweenTransition = new TweenTransition();
        t.equal(typeof tweenTransition.set, 'function', 'tweenTransition.set should be a function');
        t.equal(typeof tweenTransition.get, 'function', 'tweenTransition.get should be a function');

        time = 0;
        tweenTransition.set(1);
        t.equal(tweenTransition.get(1), 1);

        tweenTransition.set(1, { duration: 500 });

        time = 500;
        t.equal(tweenTransition.get(1), 1);
    });

    t.test('get method with time as argument', function(t) {
        t.plan(4);
        time = 0;
        var tweenTransition = new TweenTransition();
        tweenTransition.set(1, { duration: 200 });
        time = 100;
        t.equal(tweenTransition.get(), 100/200);
        t.equal(tweenTransition.get(100), 100/200);
        time = 150;
        t.equal(tweenTransition.get(), 150/200);
        t.equal(tweenTransition.get(150), 150/200);
    });

    t.test('isActive method', function(t) {
        t.plan(4);
        time = 0;
        var tweenTransition = new TweenTransition();
        t.equal(typeof tweenTransition.isActive, 'function', 'tweenTransition.isActive should be a function');

        tweenTransition.set(0);
        tweenTransition.set(1, { duration: 500 });
        t.ok(tweenTransition.isActive());

        time = 100;
        t.equal(tweenTransition.isActive(), true);
        
        time = 700;   
        tweenTransition.reset();
        t.equal(tweenTransition.isActive(), false);
    });

    t.test('reset method', function(t) {
        t.plan(2);
        var tweenTransition = new TweenTransition();
        t.equal(typeof tweenTransition.reset, 'function', 'tweenTransition.reset should be a function');

        tweenTransition.set(1, { duratio: 500 });
        tweenTransition.reset();
        t.equal(tweenTransition.get(), undefined);
    });

    t.test('halt method', function(t) {
        t.plan(2);
        time = 0;
        var tweenTransition = new TweenTransition();
        t.equal(typeof tweenTransition.halt, 'function', 'tweenTransition.halt should be a function');
        tweenTransition.set([0, 0, 0]);
        tweenTransition.set([1, 2, 3], { duration: 100 });
        time = 50;
        tweenTransition.halt();
        var value1 = tweenTransition.get();
        var value2 = tweenTransition.get();
        t.deepEqual(value1, value2);
    });

    t.test('getVelocity method', function(t) {
        t.plan(2);
        var tweenTransition = new TweenTransition();
        t.equal(typeof tweenTransition.getVelocity, 'function', 'tweenTransition.getVelocity should be a function');
        t.equal(tweenTransition.getVelocity(), undefined, 'tweenTransition velocity should default to undefined');
    });

    t.test('setOptions method', function(t) {
        t.test('exists', function(t) {
            t.plan(1);
            var tweenTransition = new TweenTransition();
            t.equal(typeof tweenTransition.setOptions, 'function', 'tweenTransition.setOptions should be a function');
        });

        t.test('curve option', function(t) {
            t.plan(1);
            time = 0;
            var tweenTransition = new TweenTransition();
            tweenTransition.setOptions({
                curve: function() {
                    return 0.1234;
                }
            });
            tweenTransition.set(1, { duration: 20 });
            time = 10;
            t.equal(tweenTransition.get(), 0.1234);
        });

        t.test('duration option', function(t) {
            t.plan(2);
            time = 0;
            var tweenTransition = new TweenTransition();
            tweenTransition.setOptions({ duration: 1000 });
            tweenTransition.set(1, {});
            time = 500;
            t.equal(tweenTransition.get(), 0.5);

            time = 1000;
            t.equal(tweenTransition.get(), 1);
        });

        t.test('speed option', function(t) {
            t.plan(1);
            time = 0;
            var tweenTransition = new TweenTransition();
            tweenTransition.setOptions({ speed: 0.0001 });

            tweenTransition.set(0);
            tweenTransition.set(1, {
                curve: function(t) { return t; },
                duration: 1000
            });

            time = 1;
            t.equal(tweenTransition.get(), 0.0001);
        });
    });

    t.test('halt method', function(t) {
        t.plan(2);
        time = 0;
        var tweenTransition = new TweenTransition();
        t.equal(typeof tweenTransition.halt, 'function', 'tweenTransition.halt should be a function');
        tweenTransition.set(1, { duration: 500 });
        time = 250;
        tweenTransition.halt();
        time = 1000;
        t.equal(tweenTransition.get(), 0.5);
    });
});
