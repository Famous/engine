'use strict';

var test = require('tape');

var Engine = require('../src');

test('Engine', function(t) {
    t.test('constructor', function(t) {
        t.plan(2);
        var engine;
        t.doesNotThrow(function() {
            engine = new Engine();
        });

        var updateable = {
            update: function() {
                t.pass();
                engine.noLongerUpdate(updateable);
                engine.stop();
            }
        };
        engine.update(updateable);
    });

    t.test('start method', function(t) {
        t.plan(1);
        var engine = new Engine();
        t.equal(typeof engine.start, 'function', 'engine.start should be a function');
        engine.stop();
    });

    t.test('stop method', function(t) {
        t.plan(1);
        var engine = new Engine();
        t.equal(typeof engine.stop, 'function', 'engine.stop should be a function');
        engine.stop();
    });

    t.test('isRunning method', function(t) {
        t.plan(3);
        var engine = new Engine();
        t.equal(typeof engine.isRunning, 'function', 'engine.isRunning should be a function');
        t.equal(engine.isRunning(), true, 'engine should be running as soon as it has been initialized');
        engine.stop();
        t.equal(engine.isRunning(), false, 'stop should stop the engine');
    });

    t.test('step method', function(t) {
        t.plan(1);
        var engine = new Engine();
        t.equal(typeof engine.step, 'function', 'engine.step should be a function');
        engine.stop();
    });

    t.test('loop method', function(t) {
        t.plan(1);
        var engine = new Engine();
        t.equal(typeof engine.loop, 'function', 'engine.loop should be a function');
        engine.stop();
    });

    t.test('update method', function(t) {
        t.plan(1);
        var engine = new Engine();
        t.equal(typeof engine.update, 'function', 'engine.update should be a function');
        engine.stop();
    });

    t.test('noLongerUpdate method', function(t) {
        t.plan(8);
        var engine = new Engine();
        t.equal(typeof engine.noLongerUpdate, 'function', 'engine.noLongerUpdate should be a function');

        var c = 0;
        var updateable = {
            update: function(time) {
                t.equal(typeof time, 'number', 'engine.loop should pass in the requestAnimationFrame timestamp');
                t.pass('engine should keep running until engine.noLongerUpdate has been invoked');

                if (c++ === 2) {
                    t.pass('engine.noLongerUpdate should prevent any further engine updates');
                    engine.noLongerUpdate(updateable);
                    engine.stop();
                }
            }
        };
        engine.update(updateable);
    });
});
