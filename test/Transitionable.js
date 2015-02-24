'use strict';

var time = 0;
Date.now = function() {
    return time;
};

var test = require('tape');
var Transitionable = require('../src/Transitionable');

test('Transitionable', function(t) {
    t.test('pause method', function(t) {
        t.plan(1);
        var transitionable = new Transitionable();
        t.equal(transitionable.pause instanceof Function, true, 'transitionable.pause should be a function');
    });

    t.test('resume method', function(t) {
        t.plan(1);
        var transitionable = new Transitionable();
        t.equal(transitionable.resume instanceof Function, true, 'transitionable.resume should be a function');
    });

    t.test('isPaused method', function(t) {
        t.plan(1);
        var transitionable = new Transitionable();
        t.equal(transitionable.isPaused instanceof Function, true, 'transitionable.isPaused should be a function');
    });

    t.test('integration test: pausing actions', function(t) {
        t.plan(13);
        time = 0;
        var transitionable = new Transitionable();

        t.equal(transitionable.isPaused(), false);

        transitionable.set(0);

        t.equal(transitionable.isPaused(), false);

        transitionable.set(1, {
            duration: 1000,
            curve: function(t) {
                return t;
            }
        });

        t.equal(transitionable.isPaused(), false);

        time = 250;
        t.equal(transitionable.get(), 0.25);
        t.equal(transitionable.isPaused(), false);

        time = 500;
        t.equal(transitionable.get(), 0.5);
        t.equal(transitionable.isPaused(), false);
        transitionable.pause();
        t.equal(transitionable.isPaused(), true);

        time = 1000;
        t.equal(transitionable.get(), 0.5);
        t.equal(transitionable.isPaused(), true);
        transitionable.resume();
        t.equal(transitionable.isPaused(), false);

        time = 1500;
        t.equal(transitionable.get(), 1);

        t.equal(transitionable.isPaused(), false);
    });
});
