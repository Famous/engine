'use strict';

var test = require('tape');
var ContainerEngine = require('../ContainerEngine');

test('ContainerEngine', function(t) {
    t.test('constructor', function(t) {
        var engine;
        t.equal(typeof ContainerEngine, 'function', 'ContainerEngine should be a constructor function');
        t.doesNotThrow(function() {
            engine = new ContainerEngine();
        });
        t.end();
    });

    t.test('isRunning method', function(t) {
        t.plan(2);
        var engine = new ContainerEngine();
        t.equal(typeof engine.isRunning, 'function', 'engine.isRunning should be a function');
        t.equal(engine.isRunning(), true, 'ContainerEngine should be running by default');
    });

    t.test('update method', function(t) {
        t.plan(2);
        var engine = new ContainerEngine();
        t.equal(typeof engine.update, 'function', 'engine.update should be a function');
        var expectedUpdates = [12, 14, 18, 20, 45, 67, 89];
        var actualUpdates = [];
        engine.update({
            update: function(time) {
                actualUpdates.push(time);
                if (actualUpdates.length === expectedUpdates.length) {
                    t.deepEqual(actualUpdates.map(function(update) {
                        return Math.round(update);
                    }), expectedUpdates);
                }
            }
        });

        expectedUpdates.forEach(function (time) {
            window.postMessage(['FRAME', time], '*');
        });
    });

    t.test('noLongerUpdate method', function(t) {
        t.plan(2);
        var engine = new ContainerEngine();
        t.equal(typeof engine.noLongerUpdate, 'function', 'engine.noLongerUpdate should be a function');

        var updateable = {
            update: function(time) {
                t.equal(Math.round(time), 123);
                engine.noLongerUpdate(updateable);
                window.postMessage(['FRAME', 124], '*');
            }
        };
        engine.update(updateable);

        window.postMessage(['FRAME', 123], '*');
    });

    t.test('start method', function(t) {
        t.plan(1);
        var engine = new ContainerEngine();
        t.equal(typeof engine.start, 'function', 'engine.start should be a function');
    });

    t.test('stop method', function(t) {
        t.plan(2);
        var engine = new ContainerEngine();
        t.equal(typeof engine.stop, 'function', 'engine.stop should be a function');

        engine.stop();
        t.equal(engine.isRunning(), false, 'engine.stop should stop the engine');

        engine.update({
            update: function() {
                t.fail();
            }
        });

        window.postMessage(['FRAME', 123], '*');
    });

    t.test('step method', function(t) {
        t.plan(2);
        var engine = new ContainerEngine();
        t.equal(typeof engine.step, 'function', 'engine.step should be a function');
        engine.stop();

        engine.update({
            update: function(time) {
                t.equal(time, 123, 'engine.step should work if the engine is currently not running');
            }
        });
        engine.step(123);
    });

    t.test('normalize time', function(t) {
        t.plan(1);
        var engine = new ContainerEngine();
        engine.stop();

        window.postMessage(['FRAME', 100], '*');

        setTimeout(function() {
            engine.start();

            engine.update({
                update: function(time) {
                    t.ok(100 - time < 5);
                }
            });

            window.postMessage(['FRAME', 1100], '*');
        }, 1000);
    });
});
